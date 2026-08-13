import katex from 'katex';

interface MathProps {
  expression: string;
  display?: boolean;
  label?: string;
}

export function Math({ expression, display = false, label }: MathProps) {
  const html = katex.renderToString(expression, {
    displayMode: display,
    throwOnError: false,
    strict: 'warn',
  });

  return (
    <span
      className={display ? 'math math--display' : 'math'}
      aria-label={label ?? expression}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
