function hashString(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(values: readonly T[], seed: number) {
  const output = [...values];
  const random = mulberry32(seed);
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [output[index], output[swapIndex]] = [output[swapIndex] as T, output[index] as T];
  }
  return output;
}

function canonicalPairs(canonicalIds: readonly string[]) {
  const pairs: Array<readonly [string, string]> = [];
  for (let index = 0; index < canonicalIds.length; index += 2) {
    const left = canonicalIds[index];
    const right = canonicalIds[index + 1];
    if (left && right) pairs.push([left, right]);
  }
  return pairs;
}

function isSamePair(left: string, right: string, pairs: readonly (readonly [string, string])[]) {
  return pairs.some(([a, b]) => (left === a && right === b) || (left === b && right === a));
}

export function hasHorizontalAnswerLeak(layoutIds: readonly string[], canonicalIds: readonly string[]) {
  const pairs = canonicalPairs(canonicalIds);
  for (let index = 0; index < layoutIds.length; index += 2) {
    const left = layoutIds[index];
    const right = layoutIds[index + 1];
    if (left && right && isSamePair(left, right, pairs)) return true;
  }
  return false;
}

/**
 * Produces a stable order for one encounter stage while avoiding the visual shortcut
 * of placing mathematically corresponding objects side by side in a two-column palette.
 * The caller should include a per-session seed in seedKey so repeated sessions vary.
 */
export function arrangePairingOptions(canonicalIds: readonly string[], seedKey: string) {
  if (canonicalIds.length < 4 || canonicalIds.length % 2 !== 0) return [...canonicalIds];

  const baseSeed = hashString(`${seedKey}:${canonicalIds.join('|')}`);
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const candidate = shuffled(canonicalIds, (baseSeed + attempt * 0x9e3779b9) >>> 0);
    if (!hasHorizontalAnswerLeak(candidate, canonicalIds)) return candidate;
  }

  // Guaranteed fallback for the six-item / three-pair layouts used by correspondence.
  const pairs = canonicalPairs(canonicalIds);
  if (pairs.length >= 2) {
    const firstMembers = pairs.map(([left]) => left);
    const secondMembers = pairs.map(([, right]) => right);
    const candidate = [...firstMembers, ...secondMembers];
    if (!hasHorizontalAnswerLeak(candidate, canonicalIds)) return candidate;
  }

  return [...canonicalIds];
}
