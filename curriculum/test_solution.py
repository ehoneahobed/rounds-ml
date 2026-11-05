"""Confirm the reference solution passes every checker the studio ships.

Run from the repository root:

    python3 -m unittest curriculum.test_solution
"""

from __future__ import annotations

import importlib.util
import json
import os
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REFERENCE = (ROOT / "curriculum" / "reference_solution.py").read_text(encoding="utf-8")
TESTS = sorted((ROOT / "public" / "grader" / "tests").glob("*.py"))


def _load_grade():
    path = ROOT / "public" / "grader" / "harness.py"
    spec = importlib.util.spec_from_file_location("rounds_harness", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load harness at {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.grade


class ReferenceSolutionTest(unittest.TestCase):
    """The answer key has to clear the same bar as a student."""

    @classmethod
    def setUpClass(cls) -> None:
        os.environ["ROUNDS_DATA"] = str(ROOT / "public" / "data")
        # Keep the function off the instance so unittest does not bind self into it.
        cls.grade_student = staticmethod(_load_grade())

    def test_every_checker_passes(self) -> None:
        self.assertGreaterEqual(len(TESTS), 11)
        for path in TESTS:
            with self.subTest(checker=path.name):
                payload = json.loads(self.grade_student(REFERENCE, path.read_text(encoding="utf-8")))
                failed = [item for item in payload["results"] if not item["passed"]]
                self.assertEqual(
                    payload["status"],
                    "ok",
                    payload.get("error"),
                )
                self.assertEqual(failed, [], json.dumps(failed, indent=2))
                self.assertGreater(len(payload["results"]), 0)

    def test_figures_file_matches_reference(self) -> None:
        from curriculum.figures import build

        on_disk = json.loads((ROOT / "data" / "figures.json").read_text(encoding="utf-8"))
        self.assertEqual(build(), on_disk)

    def test_broken_gini_fails(self) -> None:
        student = "def gini_impurity(labels):\n    return 0.0\n"
        checker = (ROOT / "public" / "grader" / "tests" / "00_gini.py").read_text(encoding="utf-8")
        payload = json.loads(self.grade_student(student, checker))
        self.assertEqual(payload["status"], "ok")
        self.assertTrue(any(not item["passed"] for item in payload["results"]))


if __name__ == "__main__":
    unittest.main()
