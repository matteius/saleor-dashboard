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
