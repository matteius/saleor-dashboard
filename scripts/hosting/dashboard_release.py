"""Deploy the latest main source to the existing App Platform static dashboard."""

import argparse
import fcntl
import json
import os
from pathlib import Path
import re
import subprocess
import time

REPO = "matteius/saleor-dashboard"
APP = "f7050c32-077c-41e8-8257-c5f5cc9c0a10"
WORKFLOW = ".github/workflows/opensensor-image.yml"
STATE = Path.home() / ".config/opensensor-hosting/dashboard-release"


def command(args):
    result = subprocess.run(args, capture_output=True, text=True, timeout=90)
    if result.returncode:
        raise RuntimeError("Provider command failed: " + args[0])
    return json.loads(result.stdout)


def gh(path, **fields):
    args = ["gh", "api", "-H", "Cache-Control: no-cache", path]
    for key, value in fields.items():
        args += ["-f", key + "=" + str(value)]
    return command(args)


def provider(*args):
    value = command(["doctl", "apps", *args, "--output", "json"])
    return value[0] if isinstance(value, list) else value


def context(target):
    return f'hosting/dashboard/{target["run_id"]}/{target["attempt"]}'


def report(target, state, description):
    gh(
        f'repos/{REPO}/statuses/{target["commit"]}',
        state=state,
        context=context(target),
        description=description,
        target_url=f'https://github.com/{REPO}/actions/runs/{target["run_id"]}',
    )


def validate(run):
    if (
        run["repository"]["full_name"] != REPO
        or run["path"] != WORKFLOW
        or run["event"] != "push"
        or run["head_branch"] != "main"
        or not re.fullmatch("[a-f0-9]{40}", run["head_sha"])
    ):
        raise ValueError("Expected an exact main push from this repository")
    return {
        "commit": run["head_sha"],
        "run_id": run["id"],
        "attempt": run["run_attempt"],
    }


def latest():
    runs = gh(
        f"repos/{REPO}/actions/workflows/opensensor-image.yml/runs?branch=main&event=push&per_page=1"
    )["workflow_runs"]
    if not runs:
        return None
    target = validate(runs[0])
    jobs = gh(
        f'repos/{REPO}/actions/runs/{target["run_id"]}/attempts/{target["attempt"]}/jobs?per_page=100'
    )["jobs"]
    if not any(
        j["name"] == "release-tests" and j["conclusion"] == "success" for j in jobs
    ):
        return None
    return target


def save(path, value):
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(value))
    temporary.replace(path)


def source(deployment):
    sites = deployment.get("static_sites", [])
    matches = [s for s in sites if s["name"] == "dashboard"]
    return matches[0].get("source_commit_hash") if len(matches) == 1 else None


def verify_app(app):
    sites = app["spec"].get("static_sites", [])
    if (
        len(sites) != 1
        or sites[0]["name"] != "dashboard"
        or sites[0].get("git")
        != {"repo_clone_url": f"https://github.com/{REPO}.git", "branch": "main"}
    ):
        raise RuntimeError("Dashboard production source configuration changed")


def deploy(target, path):
    app = provider("get", APP)
    verify_app(app)
    active = app.get("active_deployment", {})
    if active.get("phase") == "ACTIVE" and source(active) == target["commit"]:
        return active["id"]
    if path.exists():
        receipt = json.loads(path.read_text())
        if receipt["target"] != target:
            raise RuntimeError("Deployment receipt belongs to another main push")
        deployment = provider("get-deployment", APP, receipt["id"])
    else:
        # Adopt an in-flight provider deployment after an interrupted create reply.
        deployment = app.get("in_progress_deployment") or {}
        if not deployment:
            head = gh(f"repos/{REPO}/git/ref/heads/main")["object"]["sha"]
            if head != target["commit"]:
                raise RuntimeError("A newer main push superseded this deployment")
            deployment = provider("create-deployment", APP, "--force-rebuild")
        save(path, {"target": target, "id": deployment["id"]})
    deadline = time.monotonic() + 2100
    while time.monotonic() < deadline:
        phase = deployment["phase"]
        if phase == "ACTIVE":
            app = provider("get", APP)
            if (
                source(deployment) != target["commit"]
                or app.get("active_deployment", {}).get("id") != deployment["id"]
            ):
                raise RuntimeError("Active deployment is not this exact main source")
            return deployment["id"]
        if phase in ("ERROR", "CANCELED", "SUPERSEDED"):
            raise RuntimeError("Dashboard build/deployment did not become active")
        time.sleep(10)
        deployment = provider("get-deployment", APP, deployment["id"])
    raise RuntimeError("Timed out waiting for the production dashboard build")


def main():
    os.umask(0o077)
    STATE.mkdir(parents=True, exist_ok=True)
    with (STATE / "agent.lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        target = latest()
        if target is None:
            return
        path = STATE / "latest.json"
        previous = json.loads(path.read_text()) if path.exists() else {}
        if previous.get("target") == target and previous.get("state") == "success":
            return
        report(target, "pending", "Building and deploying current main on App Platform")
        try:
            deployment = deploy(
                target, STATE / f'{target["run_id"]}-{target["attempt"]}.json'
            )
            save(
                path,
                {
                    "target": target,
                    "state": "success",
                    "deployment_id": deployment,
                    "updated_at": time.time(),
                },
            )
            report(
                target, "success", "Production dashboard serves this exact main source"
            )
        except Exception as error:
            save(
                path,
                {
                    "target": target,
                    "state": "failure",
                    "error_type": type(error).__name__,
                },
            )
            report(
                target,
                "failure",
                "Dashboard deployment incomplete: " + type(error).__name__,
            )
            raise


def wait():
    target = {
        "commit": os.environ["GITHUB_SHA"],
        "run_id": int(os.environ["GITHUB_RUN_ID"]),
        "attempt": int(os.environ["GITHUB_RUN_ATTEMPT"]),
    }
    deadline = time.monotonic() + 2400
    while time.monotonic() < deadline:
        statuses = gh(f'repos/{REPO}/commits/{target["commit"]}/statuses?per_page=100')
        matches = [s for s in statuses if s["context"] == context(target)]
        if matches and matches[0]["state"] == "success":
            print("Exact main source verified active in production")
            return
        time.sleep(15)
    raise RuntimeError(
        "Production deployment has not been verified; see hosting status"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--wait", action="store_true")
    wait() if parser.parse_args().wait else main()
