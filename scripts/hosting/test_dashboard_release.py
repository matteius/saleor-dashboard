import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import dashboard_release as release

SHA = "a" * 40
TARGET = {"commit": SHA, "run_id": 1, "attempt": 1}


def app(active=None):
    return {
        "spec": {
            "static_sites": [
                {
                    "name": "dashboard",
                    "git": {
                        "repo_clone_url": "https://github.com/matteius/saleor-dashboard.git",
                        "branch": "main",
                    },
                }
            ]
        },
        "active_deployment": active or {},
    }


def deployment(commit=SHA):
    return {
        "id": "fixture",
        "phase": "ACTIVE",
        "static_sites": [{"name": "dashboard", "source_commit_hash": commit}],
    }


class DeploymentTests(unittest.TestCase):
    def test_main_push_and_dispatch_require_the_same_source_identity(self):
        run = {
            "repository": {"full_name": release.REPO},
            "path": release.WORKFLOW,
            "event": "push",
            "head_branch": "main",
            "head_sha": SHA,
            "id": 1,
            "run_attempt": 1,
        }
        for event in ("push", "workflow_dispatch"):
            with self.subTest(event=event):
                self.assertEqual(release.validate({**run, "event": event}), TARGET)
        for invalid in (
            {"event": "pull_request"},
            {"head_branch": "feature"},
            {"repository": {"full_name": "unrelated/dashboard"}},
            {"path": ".github/workflows/unrelated.yml"},
            {"head_sha": "main"},
        ):
            with self.subTest(invalid=invalid), self.assertRaises(ValueError):
                release.validate({**run, **invalid})

    def test_latest_accepts_tested_main_dispatch_and_ignores_pr(self):
        run = {
            "repository": {"full_name": release.REPO},
            "path": release.WORKFLOW,
            "event": "workflow_dispatch",
            "head_branch": "main",
            "head_sha": SHA,
            "id": 1,
            "run_attempt": 1,
        }
        for result in ("success", "failure", None):
            with self.subTest(result=result), patch.object(
                release,
                "gh",
                side_effect=[
                    {"workflow_runs": [{**run, "event": "pull_request"}, run]},
                    {"jobs": [{"name": "release-tests", "conclusion": result}]},
                ],
            ):
                self.assertEqual(
                    release.latest(), TARGET if result == "success" else None
                )

    def test_no_rebuild_of_exact_active_source(self):
        with tempfile.TemporaryDirectory() as root, patch.object(
            release, "provider", return_value=app(deployment())
        ) as provider:
            self.assertEqual(release.deploy(TARGET, Path(root) / "state"), "fixture")
            provider.assert_called_once_with("get", release.APP)

    def test_resume_verifies_actual_active_source(self):
        with tempfile.TemporaryDirectory() as root:
            path = Path(root) / "state"
            release.save(path, {"target": TARGET, "id": "fixture"})
            with patch.object(
                release,
                "provider",
                side_effect=[app(), deployment(), app(deployment())],
            ):
                self.assertEqual(release.deploy(TARGET, path), "fixture")
            with patch.object(
                release,
                "provider",
                side_effect=[app(), deployment("b" * 40), app(deployment("b" * 40))],
            ):
                with self.assertRaisesRegex(RuntimeError, "exact main source"):
                    release.deploy(TARGET, path)

    def test_newer_main_prevents_stale_create(self):
        with tempfile.TemporaryDirectory() as root, patch.object(
            release, "provider", return_value=app()
        ) as provider, patch.object(
            release, "gh", return_value={"object": {"sha": "b" * 40}}
        ):
            with self.assertRaisesRegex(RuntimeError, "superseded"):
                release.deploy(TARGET, Path(root) / "state")
            self.assertEqual(provider.call_count, 1)

    def test_unrelated_source_is_not_modified(self):
        value = app()
        value["spec"]["static_sites"][0]["git"]["branch"] = "staging"
        with self.assertRaises(RuntimeError):
            release.verify_app(value)


if __name__ == "__main__":
    unittest.main()
