"use client";

import katex from "katex";

type MathProps = {
  children: string;
  display?: boolean;
  className?: string;
};

export function Math({ children, display = false, className = "" }: MathProps) {
  let html = children;
  try {
    html = katex.renderToString(children, { throwOnError: false, displayMode: display, strict: "ignore" });
  } catch {
    // O texto original permanece como fallback acessível.
  }
  const Tag = display ? "div" : "span";
  return <Tag className={`math ${display ? "math--display" : ""} ${className}`} aria-label={children} dangerouslySetInnerHTML={{ __html: html }} />;
}
