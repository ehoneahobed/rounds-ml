/** Structured blocks for concept pages and task briefs. All fields are plain data. */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "math"; latex: string }
  | { type: "code"; code: string; caption?: string }
  | { type: "terminal"; text: string }
  | { type: "table"; caption?: string; headers: string[]; rows: string[][] }
  | { type: "callout"; tone: "note" | "warn" | "practice"; title: string; text: string }
  | { type: "reveal"; title: string; prompt: string; answer: string }
  | { type: "bench"; which: "impurity" | "confusion" }
  | { type: "searchTable" }
  | { type: "countedTable" }
  | { type: "partition" }
  | { type: "paths" }
  | { type: "lab" };

export type Concept = {
  slug: string;
  number: string;
  title: string;
  minutes: number;
  summary: string;
  blocks: Block[];
};

export type TaskLevel = 0 | 1 | 2 | 3;

export type Task = {
  slug: string;
  file: string;
  number: number;
  level: TaskLevel;
  title: string;
  points: number;
  minutes: number;
  summary: string;
  blocks: Block[];
  starter: string;
  /** Checker script served from /grader/tests. */
  testFile: string;
  needsCohorts: boolean;
  timeoutMs: number;
};
