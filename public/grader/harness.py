"""Run student code and a checker script. Used by the browser and by unit tests.

``grade`` returns a JSON string so the worker does not have to convert nested
Python objects by hand. Student code cannot replace ``check``: it is bound
after the student module executes and before the checker runs.
"""

from __future__ import annotations

import io
import json
import sys
import traceback


def grade(student_code: str, test_code: str) -> str:
    """Execute ``student_code`` then ``test_code`` and collect ``check`` calls.

    Returns JSON with ``status`` (``ok`` or ``error``), ``error`` (traceback or
    null), ``stdout`` (at most 4000 characters), and ``results`` (a list of
    ``{name, passed, detail}``).
    """
    stdout = io.StringIO()
    previous_stdout = sys.stdout
    namespace: dict = {"__name__": "student"}
    try:
        sys.stdout = stdout
        exec(student_code, namespace, namespace)  # noqa: S102 — the student runtime is the point
    except Exception:
        sys.stdout = previous_stdout
        return json.dumps(
            {
                "status": "error",
                "error": traceback.format_exc(),
                "stdout": stdout.getvalue()[-4000:],
                "results": [],
            }
        )

    results: list[dict] = []

    def check(name: str, cond: object, detail: str = "") -> None:
        results.append({"name": str(name), "passed": bool(cond), "detail": str(detail)})

    namespace["check"] = check
    namespace["RESULTS"] = results
    try:
        exec(test_code, namespace, namespace)  # noqa: S102
    except Exception:
        sys.stdout = previous_stdout
        return json.dumps(
            {
                "status": "error",
                "error": traceback.format_exc(),
                "stdout": stdout.getvalue()[-4000:],
                "results": results,
            }
        )
    finally:
        sys.stdout = previous_stdout
    return json.dumps(
        {
            "status": "ok",
            "error": None,
            "stdout": stdout.getvalue()[-4000:],
            "results": results,
        }
    )
