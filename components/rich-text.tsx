import { Fragment, type ReactNode } from "react";
import { Formula } from "@/components/formula";

/** Inline `code`, **bold**, and \\(latex\\) in authored concept strings. */
export function RichText({ text }: { text: string }) {
  const mathParts = text.split(/(\\\([\s\S]*?\\\))/g);
  return (
    <>
      {mathParts.map((part, index) => {
        if (part.startsWith("\\(") && part.endsWith("\\)")) {
          return <Formula key={`math-${index}`} latex={part.slice(2, -2)} />;
        }
        return <Fragment key={`text-${index}`}>{renderMarks(part, index)}</Fragment>;
      })}
    </>
  );
}

function renderMarks(text: string, bucket: number): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("`")) {
      nodes.push(
        <code key={`${bucket}-${index}`} className="rounded bg-secondary px-1 py-0.5 font-mono text-[0.92em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(
        <strong key={`${bucket}-${index}`} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    }
    last = match.index + token.length;
    index += 1;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
