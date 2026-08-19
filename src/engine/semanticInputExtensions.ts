import type { Line } from './analyticGeometryEngine';
import {
  angleEquivalent,
  keywordEquivalent,
  lineEquivalent,
  normalizeMathText,
  parseNumericExpression,
  pointEquivalent,
} from './mathAnswerEngine';

const EPSILON = 1e-8;

function normalizeWords(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function keywordEquivalentFlexible(input: string, aliases: readonly string[]) {
  if (keywordEquivalent(input, aliases)) return true;
  const inputWords = normalizeWords(input);
  const acceptedLeadWords = new Set(['caso', 'criterio', 'e', 'uma', 'um', 'resposta', 'tipo']);

  return aliases.some((alias) => {
    const aliasWords = normalizeWords(alias);
    if (inputWords.length !== aliasWords.length + 1) return false;
    if (!acceptedLeadWords.has(inputWords[0] ?? '')) return false;
    return aliasWords.every((word, index) => inputWords[index + 1] === word);
  });
}

export function angleCongruenceEquivalentFlexible(input: string, first: string, second: string) {
  const normalized = normalizeMathText(input).toUpperCase().replace(/ANGULO/g, '');
  const candidates = normalized.match(/[A-Z]{3}/g) ?? [];

  for (let i = 0; i < candidates.length; i += 1) {
    for (let j = i + 1; j < candidates.length; j += 1) {
      const left = candidates[i] ?? '';
      const right = candidates[j] ?? '';
      if (
        (angleEquivalent(left, first) && angleEquivalent(right, second)) ||
        (angleEquivalent(left, second) && angleEquivalent(right, first))
      ) return true;
    }
  }
  return false;
}

function parseAssignedPoint(input: string) {
  const chunks = input
    .replace(/[()]/g, '')
    .split(/;|\n|\be\b/i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (chunks.length !== 2) return null;
  const values: Partial<Record<'x' | 'y', number>> = {};
  for (const chunk of chunks) {
    const match = chunk.match(/^([xy])\s*=\s*(.+)$/i);
    if (!match?.[1] || !match[2]) return null;
    const variable = match[1].toLowerCase() as 'x' | 'y';
    const parsed = parseNumericExpression(match[2]);
    if (parsed === null) return null;
    values[variable] = parsed;
  }

  return values.x === undefined || values.y === undefined ? null : { x: values.x, y: values.y };
}

export function pointEquivalentFlexible(input: string, expected: { x: number; y: number }) {
  if (pointEquivalent(input, expected)) return true;
  const parsed = parseAssignedPoint(input);
  return Boolean(
    parsed &&
    Math.abs(parsed.x - expected.x) < EPSILON &&
    Math.abs(parsed.y - expected.y) < EPSILON,
  );
}

function unwrapNonZeroScalarTimesParenthesizedZero(input: string) {
  const compact = input.trim().replace(/\s+/g, '').replace(/,/g, '.');
  const direct = compact.match(/^([+-]?(?:\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?)?)\((.+)\)=0$/);
  const reverse = compact.match(/^0=([+-]?(?:\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?)?)\((.+)\)$/);
  const match = direct ?? reverse;
  if (!match?.[2]) return null;

  const rawScalar = match[1] ?? '';
  const scalarText = rawScalar === '' || rawScalar === '+' ? '1' : rawScalar === '-' ? '-1' : rawScalar;
  const scalar = parseNumericExpression(scalarText);
  if (scalar === null || Math.abs(scalar) < EPSILON) return null;
  return `${match[2]}=0`;
}

export function lineEquivalentFlexible(input: string, expected: Line) {
  if (lineEquivalent(input, expected)) return true;
  const unwrapped = unwrapNonZeroScalarTimesParenthesizedZero(input);
  return Boolean(unwrapped && lineEquivalent(unwrapped, expected));
}
