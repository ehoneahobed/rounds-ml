/**
 * Local study progress for this browser.
 *
 * Nothing is uploaded. Clearing site data for this origin resets the module.
 * React reads the snapshot through useSyncExternalStore so a saved draft
 * survives hydration without a setState call inside an effect.
 */

import { useSyncExternalStore } from "react";

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

const STORAGE_KEY = "rounds-decision-trees-v1";

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

/** Read progress, falling back to empty when storage is missing or unreadable. */
export function loadProgress(): Progress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
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

/** Persist progress. Storage failures are ignored so a locked-down browser still runs. */
export function saveProgress(progress: Progress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    window.dispatchEvent(new Event("rounds-progress"));
  } catch {
    // Private mode and full disks should not block studying.
  }
}

/** Draft code for one task file. */
export function taskCodeKey(slug: string): string {
  return `rounds-task-code:${slug}`;
}

export function loadTaskCode(slug: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(taskCodeKey(slug));
  } catch {
    return null;
  }
}

export function saveTaskCode(slug: string, code: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(taskCodeKey(slug), code);
  } catch {
    // Same as saveProgress: the editor still holds the draft in memory.
  }
}

/** A ward note counts once each answer is a real sentence and the hand-work box is ticked. */
export function wardNoteComplete(note: WardNote | null): boolean {
  if (!note || !note.computedByHand) return false;
  return [note.refused, note.threshold, note.failure].every((text) => text.trim().length >= 40);
}

const SERVER_PROGRESS = emptyProgress();
let progressCache: { raw: string | null; value: Progress } = { raw: null, value: SERVER_PROGRESS };

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

function progressSnapshot(): Progress {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (progressCache.raw === raw) return progressCache.value;
  progressCache = { raw, value: raw ? loadProgress() : emptyProgress() };
  return progressCache.value;
}

/** Live progress for client components. The server render sees an empty module. */
export function useStudyProgress(): Progress {
  return useSyncExternalStore(subscribeProgress, progressSnapshot, serverProgress);
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
