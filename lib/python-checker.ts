/**
 * Owns the Pyodide worker for one task page.
 *
 * A run that exceeds its time limit terminates the worker. The next run boots
 * a fresh runtime, which re-downloads nothing if the browser cached Pyodide.
 */

export type CheckResult = {
  name: string;
  passed: boolean;
  detail: string;
};

export type GradeResult = {
  status: "ok" | "error";
  error: string | null;
  stdout: string;
  results: CheckResult[];
};

export type CohortFile = {
  path: string;
  contents: string;
};

type Pending = {
  resolve: (result: GradeResult) => void;
  reject: (error: Error) => void;
};

export type RuntimeStatus = "loading" | "ready" | "error";

export class PythonChecker {
  private worker: Worker | null = null;
  private nextId = 1;
  private pending = new Map<number, Pending>();

  constructor(private readonly onStatus: (status: RuntimeStatus, detail?: string) => void) {}

  /** Boot Pyodide. Safe to call again after a timeout killed the worker. */
  start(): void {
    this.stop();
    this.onStatus("loading");
    const worker = new Worker("/pyodide-worker.js", { type: "module" });
    this.worker = worker;
    worker.onmessage = (event: MessageEvent<Record<string, unknown>>) => {
      const data = event.data;
      if (data.type === "ready") {
        this.onStatus("ready");
        return;
      }
      if (data.type === "boot-error") {
        this.onStatus("error", String(data.error ?? "Python failed to start."));
        return;
      }
      if (data.type === "result" || data.type === "run-error") {
        const id = Number(data.id);
        const waiting = this.pending.get(id);
        if (!waiting) return;
        this.pending.delete(id);
        if (data.type === "run-error") {
          waiting.reject(new Error(String(data.error ?? "The checker failed.")));
          return;
        }
        waiting.resolve(data.payload as GradeResult);
      }
    };
    worker.onerror = () => {
      this.onStatus("error", "The Python worker crashed while starting.");
    };
    worker.postMessage({ type: "warmup" });
  }

  /**
   * Run student code against a checker script.
   * Rejects with an Error whose message is `timeout` when the run is killed.
   */
  run(
    studentCode: string,
    testCode: string,
    files: CohortFile[],
    timeoutMs: number,
  ): Promise<GradeResult> {
    if (!this.worker) {
      return Promise.reject(new Error("Python is not running."));
    }
    const id = this.nextId;
    this.nextId += 1;
    const worker = this.worker;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        this.stop();
        reject(new Error("timeout"));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (result) => {
          clearTimeout(timer);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
      worker.postMessage({ type: "run", id, studentCode, testCode, files });
    });
  }

  /** Terminate the worker and drop in-flight runs. */
  stop(): void {
    this.worker?.terminate();
    this.worker = null;
    for (const waiting of this.pending.values()) {
      waiting.reject(new Error("The Python runtime was restarted."));
    }
    this.pending.clear();
  }
}
