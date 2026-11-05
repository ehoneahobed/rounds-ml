"use client";

import { python } from "@codemirror/lang-python";
import { Prec } from "@codemirror/state";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { useEffect, useRef } from "react";

const theme = EditorView.theme(
  {
    "&": {
      height: "100%",
      maxWidth: "100%",
      backgroundColor: "#141c27",
      color: "#e7e1d4",
      fontSize: "13.5px",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-plex), ui-monospace, monospace",
      lineHeight: "1.55",
      overflow: "auto",
      maxWidth: "100%",
    },
    ".cm-content": { padding: "12px 0" },
    ".cm-gutters": { backgroundColor: "#101820", color: "#8d877c", border: "none" },
    ".cm-activeLine": { backgroundColor: "rgba(255,255,255,0.04)" },
    ".cm-activeLineGutter": { backgroundColor: "rgba(255,255,255,0.04)" },
    ".cm-cursor": { borderLeftColor: "#f3efe6" },
    "&.cm-focused": { outline: "none" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": { backgroundColor: "#245246" },
  },
  { dark: true },
);

/**
 * A Python editor that reports every change and runs on Cmd/Ctrl+Enter.
 * The parent remounts it, via `key`, when the draft should be replaced.
 */
export function CodeEditor({
  initialCode,
  onChange,
  onRun,
}: {
  initialCode: string;
  onChange: (code: string) => void;
  onRun: () => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);

  useEffect(() => {
    onChangeRef.current = onChange;
    onRunRef.current = onRun;
  });

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;
    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc: initialCode,
        extensions: [
          Prec.high(
            keymap.of([
              {
                key: "Mod-Enter",
                run: () => {
                  onRunRef.current();
                  return true;
                },
              },
            ]),
          ),
          basicSetup,
          python(),
          theme,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          }),
        ],
      }),
    });
    return () => view.destroy();
    // The editor is created once per mount. The parent changes `key` to remount it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={parentRef} className="h-full max-w-full min-h-[460px] min-w-0" />;
}
