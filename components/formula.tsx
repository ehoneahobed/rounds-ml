import katex from "katex";

/** Render a trusted LaTeX string. Concept copy is authored here, not taken from visitors. */
export function Formula({ latex, display = false }: { latex: string; display?: boolean }) {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: display,
    output: "html",
  });
  if (display) {
    return <div className="my-4 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
