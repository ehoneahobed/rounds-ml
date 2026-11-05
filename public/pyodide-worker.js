/**
 * In-browser Python for the task checker.
 *
 * Student code never leaves the browser. The worker loads Pyodide once, then
 * runs the shared harness against the task's checker script.
 */

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.mjs";

let pyodideReady = null;

async function getPyodide() {
  if (!pyodideReady) {
    pyodideReady = (async () => {
      const { loadPyodide } = await import(PYODIDE_URL);
      const pyodide = await loadPyodide();
      const response = await fetch("/grader/harness.py");
      if (!response.ok) {
        throw new Error(`Could not load the checker harness (${response.status}).`);
      }
      await pyodide.runPythonAsync(await response.text());
      return pyodide;
    })();
  }
  return pyodideReady;
}

self.onmessage = async (event) => {
  const message = event.data;
  if (message.type === "warmup") {
    try {
      await getPyodide();
      self.postMessage({ type: "ready" });
    } catch (error) {
      pyodideReady = null;
      self.postMessage({ type: "boot-error", error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  if (message.type !== "run") return;

  try {
    const pyodide = await getPyodide();
    const files = Array.isArray(message.files) ? message.files : [];
    if (files.length > 0) {
      pyodide.FS.mkdirTree("/data");
      for (const file of files) {
        pyodide.FS.writeFile(file.path, file.contents);
      }
      await pyodide.runPythonAsync('import os\nos.environ["ROUNDS_DATA"] = "/data"');
    }
    const grade = pyodide.globals.get("grade");
    const raw = grade(message.studentCode, message.testCode);
    grade.destroy();
    self.postMessage({ type: "result", id: message.id, payload: JSON.parse(String(raw)) });
  } catch (error) {
    self.postMessage({
      type: "run-error",
      id: message.id,
      error: error instanceof Error ? error.stack || error.message : String(error),
    });
  }
};
