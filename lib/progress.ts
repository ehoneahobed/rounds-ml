/**
 * Local study progress for this browser.
 *
 * Nothing is uploaded. Clearing site data for this origin resets the module.
 * React reads the snapshot through useSyncExternalStore so a saved draft
 * survives hydration without a setState call inside an effect.
 */

import { useCallback, useSyncExternalStore } from "react";
import { DECISION_TREES } from "@/lib/modules";
import { useModule } from "@/lib/module-context";

export type WardNote = {
  refused: string;
  threshold: string;
  failure: string;
  computedByHand: boolean;
};

export type Progress = {
  conceptsRead: string[];
  quizBest: number | null;
  quizPassed: boolean;
  tasksPassed: string[];
  wardNote: WardNote | null;
};

const DEFAULT_KEY = DECISION_TREES.storageKey;
const DEFAULT_TASK_PREFIX = DECISION_TREES.taskCodePrefix;

/** A module with nothing recorded yet. */
export function emptyProgress(): Progress {
  return {
    conceptsRead: [],
    quizBest: null,
    quizPassed: false,
    tasksPassed: [],
    wardNote: null,
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress();
  try {
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const note = parsed.wardNote;
    const wardNote =
      note &&
      typeof note.refused === "string" &&
      typeof note.threshold === "string" &&
      typeof note.failure === "string" &&
      typeof note.computedByHand === "boolean"
        ? note
        : null;
    return {
      conceptsRead: isStringArray(parsed.conceptsRead) ? parsed.conceptsRead : [],
      quizBest: typeof parsed.quizBest === "number" ? parsed.quizBest : null,
      quizPassed: parsed.quizPassed === true,
      tasksPassed: isStringArray(parsed.tasksPassed) ? parsed.tasksPassed : [],
      wardNote,
    };
  } catch {
    return emptyProgress();
  }
}

/** Read progress for one module storage key. */
export function loadProgress(storageKey: string = DEFAULT_KEY): Progress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    return parseProgress(window.localStorage.getItem(storageKey));
  } catch {
    return emptyProgress();
  }
}

/** Persist progress for one module. Storage failures are ignored. */
export function saveProgress(progress: Progress, storageKey: string = DEFAULT_KEY): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(progress));
    window.dispatchEvent(new Event("rounds-progress"));
  } catch {
    // Private mode and full disks should not block studying.
  }
}

/** Draft code key for one task file inside a module. */
export function taskCodeKey(slug: string, prefix: string = DEFAULT_TASK_PREFIX): string {
  return `${prefix}:${slug}`;
}

export function loadTaskCode(slug: string, prefix: string = DEFAULT_TASK_PREFIX): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(taskCodeKey(slug, prefix));
  } catch {
    return null;
  }
}

export function saveTaskCode(slug: string, code: string, prefix: string = DEFAULT_TASK_PREFIX): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(taskCodeKey(slug, prefix), code);
  } catch {
    // The editor still holds the draft in memory.
  }
}

/** A ward note counts once each answer is a real sentence and the hand-work box is ticked. */
export function wardNoteComplete(note: WardNote | null): boolean {
  if (!note || !note.computedByHand) return false;
  return [note.refused, note.threshold, note.failure].every((text) => text.trim().length >= 40);
}

const SERVER_PROGRESS = emptyProgress();
const progressCaches = new Map<string, { raw: string | null; value: Progress }>();

function serverProgress(): Progress {
  return SERVER_PROGRESS;
}

function subscribeProgress(onStoreChange: () => void): () => void {
  window.addEventListener("rounds-progress", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("rounds-progress", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function progressSnapshotFor(storageKey: string): Progress {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(storageKey);
  } catch {
    raw = null;
  }
  const cached = progressCaches.get(storageKey);
  if (cached && cached.raw === raw) return cached.value;
  const value = parseProgress(raw);
  progressCaches.set(storageKey, { raw, value });
  return value;
}

/** Live progress for the active module from ModuleProvider. */
export function useStudyProgress(): Progress {
  const module = useModule();
  const getSnapshot = useCallback(() => progressSnapshotFor(module.storageKey), [module.storageKey]);
  return useSyncExternalStore(subscribeProgress, getSnapshot, serverProgress);
}

function subscribeReady(): () => void {
  return () => {};
}

function clientReady(): boolean {
  return true;
}

function serverReady(): boolean {
  return false;
}

/** True only after hydration, so browser-only drafts are not rendered on the server. */
export function useClientReady(): boolean {
  return useSyncExternalStore(subscribeReady, clientReady, serverReady);
}
