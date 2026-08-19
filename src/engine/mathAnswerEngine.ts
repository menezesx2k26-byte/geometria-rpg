import { equivalentLines, type Line } from './analyticGeometryEngine';

const EPSILON = 1e-8;

function stripDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeMathText(value: string) {
  return stripDiacritics(value)
    .replace(/[−–—]/g, '-')
    .replace(/[×·⋅]/g, '*')
    .replace(/÷/g, '/')
    .replace(/≅/g, '~')
    .replace(/∥/g, '||')
    .replace(/⊥/g, '_|_')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function numericSource(value: string) {
  let source = normalizeMathText(value)
    .replace(/,/g, '.')
    .replace(/raizquadradade/g, 'sqrt')
    .replace(/raizde/g, 'sqrt')
    .replace(/raiz/g, 'sqrt')
    .replace(/√/g, 'sqrt');
  source = source.replace(/(\d|\))(?=sqrt|\()/g, '$1*');
  source = source.replace(/sqrt(?=\d|\()/g, 'sqrt');
  return source;
}

type NumericToken = { kind: 'number'; value: number } | { kind: 'op'; value: string } | { kind: 'sqrt'; value: 'sqrt' };

function tokenizeNumeric(value: string): NumericToken[] | null {
  const source = numericSource(value);
  if (!source) return null;
  const tokens: NumericToken[] = [];
  let index = 0;
  while (index < source.length) {
    const rest = source.slice(index);
    if (rest.startsWith('sqrt')) {
      tokens.push({ kind: 'sqrt', value: 'sqrt' });
      index += 4;
      continue;
    }
    const number = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
    if (number) {
      tokens.push({ kind: 'number', value: Number(number[0]) });
      index += number[0].length;
      continue;
    }
    const char = source[index];
    if ('+-*/()'.includes(char)) {
      tokens.push({ kind: 'op', value: char });
      index += 1;
      continue;
    }
    return null;
  }
  return tokens;
}

export function parseNumericExpression(value: string): number | null {
  const tokens = tokenizeNumeric(value);
  if (!tokens) return null;
  let cursor = 0;
  const peek = () => tokens[cursor];
  const consumeOp = (op: string) => {
    const token = peek();
    if (token?.kind === 'op' && token.value === op) {
      cursor += 1;
      return true;
    }
    return false;
  };

  const parsePrimary = (): number | null => {
    const token = peek();
    if (!token) return null;
    if (token.kind === 'number') {
      cursor += 1;
      return token.value;
    }
    if (token.kind === 'sqrt') {
      cursor += 1;
      const inner = parsePrimary();
      if (inner === null || inner < 0) return null;
      return Math.sqrt(inner);
    }
    if (consumeOp('(')) {
      const inner = parseExpression();
      if (inner === null || !consumeOp(')')) return null;
      return inner;
    }
    return null;
  };

  const parseUnary = (): number | null => {
    if (consumeOp('+')) return parseUnary();
    if (consumeOp('-')) {
      const value = parseUnary();
      return value === null ? null : -value;
    }
    return parsePrimary();
  };

  const parseTerm = (): number | null => {
    let left = parseUnary();
    if (left === null) return null;
    while (true) {
      if (consumeOp('*')) {
        const right = parseUnary();
        if (right === null) return null;
        left *= right;
      } else if (consumeOp('/')) {
        const right = parseUnary();
        if (right === null || Math.abs(right) < EPSILON) return null;
        left /= right;
      } else break;
    }
    return left;
  };

  function parseExpression(): number | null {
    let left = parseTerm();
    if (left === null) return null;
    while (true) {
      if (consumeOp('+')) {
        const right = parseTerm();
        if (right === null) return null;
        left += right;
      } else if (consumeOp('-')) {
        const right = parseTerm();
        if (right === null) return null;
        left -= right;
      } else break;
    }
    return left;
  }

  const result = parseExpression();
  if (result === null || cursor !== tokens.length || !Number.isFinite(result)) return null;
  return result;
}

export function scalarEquivalent(input: string, expected: number, variable?: string) {
  const normalized = normalizeMathText(input);
  let expression = input;
  if (normalized.includes('=')) {
    const rawParts = input.split('=').map((part) => part.trim());
    if (rawParts.length !== 2) return false;
    const [left, right] = rawParts;
    const leftNorm = normalizeMathText(left);
    const rightNorm = normalizeMathText(right);
    if (variable && leftNorm === variable.toLowerCase()) expression = right;
    else if (variable && rightNorm === variable.toLowerCase()) expression = left;
    else if (/^[a-z0-9₁₂_/]+$/i.test(leftNorm) && !/[a-z]/i.test(rightNorm.replace(/sqrt/g, ''))) expression = right;
    else return false;
  }
  const parsed = parseNumericExpression(expression);
  return parsed !== null && Math.abs(parsed - expected) < EPSILON;
}

interface LinearCoefficients { x: number; y: number; c: number }

function parseLinearTerm(term: string): LinearCoefficients | null {
  if (!term) return null;
  const variableMatch = term.match(/^([+-]?)(?:(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?)\*?)?([xy])(?:\/(\d+(?:\.\d+)?))?$/);
  if (variableMatch) {
    const sign = variableMatch[1] === '-' ? -1 : 1;
    const base = variableMatch[2] ? parseNumericExpression(variableMatch[2]) : 1;
    const denominator = variableMatch[4] ? Number(variableMatch[4]) : 1;
    if (base === null || Math.abs(denominator) < EPSILON) return null;
    const coefficient = sign * base / denominator;
    return variableMatch[3] === 'x' ? { x: coefficient, y: 0, c: 0 } : { x: 0, y: coefficient, c: 0 };
  }
  const constant = parseNumericExpression(term);
  return constant === null ? null : { x: 0, y: 0, c: constant };
}

function parseLinearSide(value: string): LinearCoefficients | null {
  let source = numericSource(value).replace(/\*/g, '');
  if (!source) return { x: 0, y: 0, c: 0 };
  if (!/^[+-]/.test(source)) source = `+${source}`;
  const terms = source.match(/[+-][^+-]+/g);
  if (!terms || terms.join('') !== source) return null;
  const result: LinearCoefficients = { x: 0, y: 0, c: 0 };
  for (const term of terms) {
    const parsed = parseLinearTerm(term);
    if (!parsed) return null;
    result.x += parsed.x;
    result.y += parsed.y;
    result.c += parsed.c;
  }
  return result;
}

export function parseLinearEquation(value: string): Line | null {
  const source = value.trim().replace(/^[rs]\s*:\s*/i, '');
  const parts = source.split('=');
  if (parts.length !== 2) return null;
  const left = parseLinearSide(parts[0]);
  const right = parseLinearSide(parts[1]);
  if (!left || !right) return null;
  const line = { a: left.x - right.x, b: left.y - right.y, c: left.c - right.c };
  if (Math.abs(line.a) < EPSILON && Math.abs(line.b) < EPSILON) return null;
  return line;
}

export function lineEquivalent(input: string, expected: Line) {
  const parsed = parseLinearEquation(input);
  return parsed ? equivalentLines(parsed, expected) : false;
}

export function parsePoint(value: string): { x: number; y: number } | null {
  const cleaned = value.trim().replace(/^[a-z][a-z0-9_]*\s*=\s*/i, '').replace(/^\(/, '').replace(/\)$/, '');
  const separator = cleaned.includes(';') ? ';' : ',';
  const parts = cleaned.split(separator).map((part) => part.trim());
  if (parts.length !== 2) return null;
  const x = parseNumericExpression(parts[0]);
  const y = parseNumericExpression(parts[1]);
  if (x === null || y === null) return null;
  return { x, y };
}

export function pointEquivalent(input: string, expected: { x: number; y: number }) {
  const parsed = parsePoint(input);
  return Boolean(parsed && Math.abs(parsed.x - expected.x) < EPSILON && Math.abs(parsed.y - expected.y) < EPSILON);
}

function lettersOnly(value: string) {
  return stripDiacritics(value).toUpperCase().replace(/TRIANGULO|SEGMENTO|ANGULO|RETA/g, '').replace(/[^A-Z]/g, '');
}

export function segmentEquivalent(input: string, first: string, second: string) {
  const letters = lettersOnly(input);
  if (letters.length !== 2) return false;
  return (letters[0] === first.toUpperCase() && letters[1] === second.toUpperCase()) ||
    (letters[0] === second.toUpperCase() && letters[1] === first.toUpperCase());
}

export function angleEquivalent(input: string, canonical: string) {
  const actual = lettersOnly(input);
  const expected = lettersOnly(canonical);
  if (expected.length === 1) return actual === expected || (actual.length === 3 && actual[1] === expected);
  if (expected.length !== 3 || actual.length !== 3) return false;
  return actual[1] === expected[1] && new Set([actual[0], actual[2]]).size === new Set([expected[0], expected[2]]).size &&
    [actual[0], actual[2]].every((letter) => [expected[0], expected[2]].includes(letter));
}

function extractTrianglePair(value: string): [string, string] | null {
  const normalized = stripDiacritics(value).toUpperCase().replace(/TRIANGULO/g, '').replace(/CONGRUENTEA/g, '~').replace(/\s+/g, '');
  const matches = normalized.match(/[A-Z]{3}/g);
  if (!matches || matches.length !== 2) return null;
  return [matches[0], matches[1]];
}

export function triangleCorrespondenceEquivalent(input: string, canonicalLeft: string, canonicalRight: string) {
  const pair = extractTrianglePair(input);
  if (!pair) return false;
  const [left, right] = pair;
  const expectedLeft = canonicalLeft.toUpperCase();
  const expectedRight = canonicalRight.toUpperCase();
  const direct = new Map(expectedLeft.split('').map((letter, index) => [letter, expectedRight[index]]));
  const inverse = new Map(expectedRight.split('').map((letter, index) => [letter, expectedLeft[index]]));
  const preserves = (a: string, b: string, map: Map<string, string>) =>
    new Set(a).size === 3 && new Set(b).size === 3 && a.split('').every((letter, index) => map.get(letter) === b[index]);
  return preserves(left, right, direct) || preserves(left, right, inverse);
}

export function angleCongruenceEquivalent(input: string, first: string, second: string) {
  const normalized = stripDiacritics(input).toUpperCase().replace(/ANGULO/g, '');
  const matches = normalized.match(/[A-Z]{3}/g);
  if (!matches || matches.length < 2) return false;
  return (angleEquivalent(matches[0], first) && angleEquivalent(matches[1], second)) ||
    (angleEquivalent(matches[0], second) && angleEquivalent(matches[1], first));
}

export function keywordEquivalent(input: string, aliases: readonly string[]) {
  const normalized = normalizeMathText(input).replace(/[^a-z0-9_|]/g, '');
  return aliases.some((alias) => normalizeMathText(alias).replace(/[^a-z0-9_|]/g, '') === normalized);
}

export function unorderedPairEquivalent<T>(left: readonly T[], right: readonly T[], equals: (a: T, b: T) => boolean) {
  return left.length === 2 && right.length === 2 &&
    ((equals(left[0], right[0]) && equals(left[1], right[1])) || (equals(left[0], right[1]) && equals(left[1], right[0])));
}
