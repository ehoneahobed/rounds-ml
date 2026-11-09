/**
 * Build a flat-file ZIP of a learner's module drafts for a personal GitHub repo.
 */

import type { Task } from "@/lib/content/types";
import type { ModuleMeta } from "@/lib/modules";
import { loadTaskCode, type Progress } from "@/lib/progress";
import { buildStoreZip, type ZipEntry } from "@/lib/zip-store";

export type ModuleRepoExport = {
  blob: Blob;
  fileName: string;
  fileCount: number;
};

function moduleSiteUrl(module: ModuleMeta): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${module.basePath}`;
  }
  return module.basePath;
}

/** README shipped with the export so the repo explains itself. */
export function buildExportReadme(
  module: ModuleMeta,
  tasks: Task[],
  progress: Progress,
): string {
  const github = module.github;
  const passed = new Set(progress.tasksPassed);
  const lines = [
    `# ${github?.suggestedName ?? module.id}`,
    "",
    github?.description ?? module.summary,
    "",
    `Studied in [Rounds · ${module.code} ${module.title}](${moduleSiteUrl(module)}).`,
    "",
    "## Layout",
    "",
    "Flat files at the repo root, one per task (the Rounds export shape).",
    "You may rearrange into per-task directories later if you want notes or local tests;",
    "keep the same Python body Rounds graded.",
    "",
    "## Tasks",
    "",
  ];
  for (const task of tasks) {
    const mark = passed.has(task.slug) ? "passed" : "in progress";
    lines.push(`- \`${task.file}\` — Task ${task.number}: ${task.title} (${mark})`);
  }
  lines.push(
    "",
    "## Note",
    "",
    "Drafts came from this browser's localStorage. The Rounds checker still runs in the browser;",
    "pushing to GitHub is for backup and portfolio, not for remote grading.",
    "",
  );
  return lines.join("\n");
}

/**
 * Collect task files from drafts (starter if missing) plus README, then ZIP them.
 */
export function exportModuleRepoZip(
  module: ModuleMeta,
  tasks: Task[],
  progress: Progress,
): ModuleRepoExport {
  if (!module.github) {
    throw new Error("This module has no GitHub export identity.");
  }
  if (tasks.length === 0) {
    throw new Error("This module has no tasks to export.");
  }

  const entries: ZipEntry[] = [
    {
      path: "README.md",
      content: buildExportReadme(module, tasks, progress),
    },
  ];

  for (const task of tasks) {
    const draft = loadTaskCode(task.slug, module.taskCodePrefix);
    const content = draft && draft.trim() ? draft : task.starter;
    entries.push({ path: task.file, content });
  }

  return {
    blob: buildStoreZip(entries),
    fileName: `${module.github.suggestedName}.zip`,
    fileCount: entries.length,
  };
}

/** Trigger a browser download for a Blob. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
