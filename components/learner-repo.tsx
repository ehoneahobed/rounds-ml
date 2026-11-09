"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { contentFor } from "@/lib/module-content";
import { useModule } from "@/lib/module-context";
import { downloadBlob, exportModuleRepoZip } from "@/lib/export-module-repo";
import {
  loadProgress,
  normalizeGithubRepoUrl,
  saveProgress,
  useClientReady,
  useStudyProgress,
} from "@/lib/progress";

/**
 * Module-home panel: suggested GitHub repo, flat export, and optional pasted URL.
 * Only renders when the active module declares github metadata and has tasks.
 */
export function LearnerRepo() {
  const activeModule = useModule();
  const content = contentFor(activeModule);
  const progress = useStudyProgress();
  const ready = useClientReady();
  const github = activeModule.github;
  /** null means “show whatever progress currently has”. */
  const [urlDraft, setUrlDraft] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [exportNote, setExportNote] = useState<string | null>(null);
  const urlValue = urlDraft ?? progress.githubRepoUrl ?? "";

  if (!github || content.tasks.length === 0) return null;

  const treePreview = content.tasks
    .slice(0, 3)
    .map((task) => `  ${task.file}`)
    .concat(content.tasks.length > 3 ? ["  …", `  ${content.tasks[content.tasks.length - 1]!.file}`] : []);

  function saveUrl() {
    const normalized = normalizeGithubRepoUrl(urlValue);
    if (urlValue.trim() && !normalized) {
      setUrlError("Paste a github.com owner/repo URL (https).");
      return;
    }
    const current = loadProgress(activeModule.storageKey);
    saveProgress({ ...current, githubRepoUrl: normalized }, activeModule.storageKey);
    setUrlDraft(null);
    setUrlError(null);
  }

  function clearUrl() {
    const current = loadProgress(activeModule.storageKey);
    saveProgress({ ...current, githubRepoUrl: null }, activeModule.storageKey);
    setUrlDraft(null);
    setUrlError(null);
  }

  function onExport() {
    if (!ready) return;
    try {
      const pack = exportModuleRepoZip(activeModule, content.tasks, progress);
      downloadBlob(pack.blob, pack.fileName);
      setExportNote(`Downloaded ${pack.fileName} (${pack.fileCount} files). Unzip, then git init and push.`);
    } catch (error) {
      setExportNote(error instanceof Error ? error.message : "Export failed.");
    }
  }

  const createUrl = `https://github.com/new?name=${encodeURIComponent(github.suggestedName)}&description=${encodeURIComponent(github.description)}&visibility=${github.defaultVisibility}`;

  return (
    <section id="github-repo" className="mt-12 border-t border-line pt-10" aria-labelledby="learner-repo-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Your GitHub repo</p>
      <h2 id="learner-repo-heading" className="mt-2 font-serif text-3xl tracking-tight">
        One private repo for this module
      </h2>
      <p className="mt-3 text-base leading-relaxed text-muted">
        Keep a backup and a portfolio trail. Rounds still grades in this browser; nothing is uploaded from
        here. Create an empty repo on your account, export your drafts as flat files, then push with git
        on your machine.
      </p>

      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="font-semibold">Suggested name</dt>
          <dd className="mt-1 font-mono text-base">{github.suggestedName}</dd>
        </div>
        <div>
          <dt className="font-semibold">Visibility</dt>
          <dd className="mt-1 text-muted">
            Start {github.defaultVisibility}; open it later if you want it on your profile.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Layout</dt>
          <dd className="mt-1 text-muted">
            Flat files at the root (Rounds export). You may later use one directory per task if you want
            notes or local tests.
          </dd>
        </div>
      </dl>

      <pre className="mt-4 overflow-x-auto rounded-md border border-line bg-secondary/40 p-4 font-mono text-xs leading-relaxed text-[#1a1a1a]">
        {`${github.suggestedName}/\n  README.md\n${treePreview.join("\n")}`}
      </pre>

      <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
        <li>
          <a
            href={createUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-green hover:underline"
          >
            Create an empty repo on GitHub
          </a>{" "}
          named <span className="font-mono text-[#1a1a1a]">{github.suggestedName}</span> (no README).
        </li>
        <li>Export your drafts below, unzip them into a folder, then:</li>
      </ol>

      <pre className="mt-3 overflow-x-auto rounded-md border border-line bg-secondary/40 p-4 font-mono text-xs leading-relaxed">{`cd ${github.suggestedName}
git init
git add .
git commit -m "Rounds ${activeModule.code} progress"
git branch -M main
git remote add origin git@github.com:YOU/${github.suggestedName}.git
git push -u origin main`}</pre>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={onExport} disabled={!ready}>
          Export drafts as ZIP
        </Button>
        {exportNote ? <p className="text-sm text-muted">{exportNote}</p> : null}
      </div>

      <div className="mt-8">
        <label htmlFor="github-repo-url" className="text-sm font-semibold">
          Your repo URL (optional)
        </label>
        <p className="mt-1 text-sm text-muted">
          After the first push, paste the link so this page can open your copy. Stays in this browser only.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            id="github-repo-url"
            type="url"
            inputMode="url"
            placeholder="https://github.com/you/rounds-0x04-decision-trees"
            value={urlValue}
            onChange={(event) => {
              setUrlDraft(event.target.value);
              setUrlError(null);
            }}
            className="h-9 w-full flex-1 rounded-md border border-border bg-transparent px-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={saveUrl}>
              Save
            </Button>
            {progress.githubRepoUrl ? (
              <Button type="button" variant="ghost" onClick={clearUrl}>
                Clear
              </Button>
            ) : null}
          </div>
        </div>
        {urlError ? <p className="mt-2 text-sm text-rust">{urlError}</p> : null}
        {progress.githubRepoUrl ? (
          <p className="mt-2 text-sm">
            Saved:{" "}
            <a
              href={progress.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-green hover:underline"
            >
              {progress.githubRepoUrl}
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}
