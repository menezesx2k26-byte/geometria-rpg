export interface Point {
  x: number;
  y: number;
  label?: string;
}

export interface Line {
  a: number;
  b: number;
  c: number;
  label?: string;
}

export interface Fraction {
  numerator: number;
  denominator: number;
}

export interface RationalPoint {
  x: Fraction;
  y: Fraction;
  label?: string;
}

export type LinearSystemType = 'SPD' | 'SI' | 'SPI';

export interface LinearSystemResult {
  systemType: LinearSystemType;
  solutions: 'one' | 'none' | 'infinite';
  intersection: RationalPoint | null | 'same-line';
  relativePosition: 'concurrent' | 'parallel-distinct' | 'coincident';
  methodUsed: 'determinant-and-proportionality';
  canonicalExplanation: string;
  alternativeExplanation: string;
}

export interface ExactRadical {
  coefficient: number;
  radicand: number;
  denominator: number;
  text: string;
}

const EPSILON = 1e-9;

function gcd(left: number, right: number): number {
  let a = Math.abs(Math.trunc(left));
  let b = Math.abs(Math.trunc(right));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function gcdMany(values: number[]) {
  return values.reduce((current, value) => gcd(current, value), 0) || 1;
}

export function fraction(numerator: number, denominator = 1): Fraction {
  if (Math.abs(denominator) < EPSILON) throw new Error('O denominador não pode ser zero.');
  const sign = denominator < 0 ? -1 : 1;
  const divisor = gcd(numerator, denominator);
  return {
    numerator: sign * numerator / divisor,
    denominator: Math.abs(denominator) / divisor,
  };
}

export function fractionToNumber(value: Fraction) {
  return value.numerator / value.denominator;
}

export function formatFraction(value: Fraction) {
  return value.denominator === 1 ? String(value.numerator) : `${value.numerator}/${value.denominator}`;
}

export function normalizeLine(line: Line): Line {
  if (Math.abs(line.a) < EPSILON && Math.abs(line.b) < EPSILON) {
    throw new Error('Uma reta precisa de (a,b) ≠ (0,0).');
  }
  if (![line.a, line.b, line.c].every(Number.isInteger)) return { ...line };
  const divisor = gcdMany([line.a, line.b, line.c]);
  let a = line.a / divisor;
  let b = line.b / divisor;
  let c = line.c / divisor;
  const firstNonZero = [a, b, c].find((value) => value !== 0) ?? 1;
  if (firstNonZero < 0) [a, b, c] = [-a, -b, -c];
  a = Object.is(a, -0) ? 0 : a;
  b = Object.is(b, -0) ? 0 : b;
  c = Object.is(c, -0) ? 0 : c;
  return { a, b, c, ...(line.label ? { label: line.label } : {}) };
}

export function lineThroughPoints(first: Point, second: Point, label?: string): Line {
  if (Math.abs(first.x - second.x) < EPSILON && Math.abs(first.y - second.y) < EPSILON) {
    throw new Error('Dois pontos distintos são necessários para determinar uma reta.');
  }
  return normalizeLine({
    a: first.y - second.y,
    b: second.x - first.x,
    c: first.x * second.y - second.x * first.y,
    ...(label ? { label } : {}),
  });
}

export function midpoint(first: Point, second: Point, label?: string): Point {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
    ...(label ? { label } : {}),
  };
}

export function determinantForCollinearity(first: Point, second: Point, third: Point) {
  return first.x * (second.y - third.y) - first.y * (second.x - third.x) + second.x * third.y - second.y * third.x;
}

export function areCollinear(first: Point, second: Point, third: Point) {
  return Math.abs(determinantForCollinearity(first, second, third)) < EPSILON;
}

export function satisfies(line: Line, point: Point) {
  return Math.abs(line.a * point.x + line.b * point.y + line.c) < EPSILON;
}

export function equivalentLines(first: Line, second: Line) {
  return Math.abs(first.a * second.b - second.a * first.b) < EPSILON
    && Math.abs(first.a * second.c - second.a * first.c) < EPSILON
    && Math.abs(first.b * second.c - second.b * first.c) < EPSILON;
}

export function classifyLinearSystem(first: Line, second: Line): LinearSystemResult {
  const determinant = first.a * second.b - second.a * first.b;
  if (Math.abs(determinant) >= EPSILON) {
    const x = fraction(first.b * second.c - second.b * first.c, determinant);
    const y = fraction(first.c * second.a - second.c * first.a, determinant);
    const point = `(${formatFraction(x)}, ${formatFraction(y)})`;
    return {
      systemType: 'SPD',
      solutions: 'one',
      intersection: { x, y, label: 'P' },
      relativePosition: 'concurrent',
      methodUsed: 'determinant-and-proportionality',
      canonicalExplanation: `O sistema tem uma solução ${point}; logo r∩s={${point}} e as retas são concorrentes.`,
      alternativeExplanation: 'O determinante dos coeficientes é não nulo, então existe uma única solução.',
    };
  }
  if (equivalentLines(first, second)) {
    return {
      systemType: 'SPI',
      solutions: 'infinite',
      intersection: 'same-line',
      relativePosition: 'coincident',
      methodUsed: 'determinant-and-proportionality',
      canonicalExplanation: 'O sistema tem infinitas soluções; logo r∩s=r=s e as retas são coincidentes.',
      alternativeExplanation: 'Todos os coeficientes são proporcionais, inclusive os termos constantes.',
    };
  }
  return {
    systemType: 'SI',
    solutions: 'none',
    intersection: null,
    relativePosition: 'parallel-distinct',
    methodUsed: 'determinant-and-proportionality',
    canonicalExplanation: 'O sistema não tem solução; logo r∩s=∅ e as retas são paralelas distintas.',
    alternativeExplanation: 'Os coeficientes de x e y são proporcionais, mas os termos constantes não são.',
  };
}

function largestSquareFactor(value: number) {
  for (let candidate = Math.floor(Math.sqrt(value)); candidate >= 2; candidate -= 1) {
    if (value % (candidate * candidate) === 0) return candidate;
  }
  return 1;
}

export function exactSquareRoot(value: Fraction): ExactRadical {
  if (value.numerator < 0) throw new Error('Distância ao quadrado não pode ser negativa.');
  const denominatorRoot = Math.sqrt(value.denominator);
  if (!Number.isInteger(denominatorRoot)) throw new Error('O denominador precisa ser um quadrado perfeito.');
  const factor = largestSquareFactor(value.numerator);
  const coefficient = factor;
  const radicand = value.numerator / (factor * factor);
  const denominator = denominatorRoot;
  const numeratorText = radicand === 1
    ? String(coefficient)
    : `${coefficient === 1 ? '' : coefficient}√${radicand}`;
  return {
    coefficient,
    radicand,
    denominator,
    text: denominator === 1 ? numeratorText : `${numeratorText}/${denominator}`,
  };
}

function subtract(left: Fraction, right: Fraction) {
  return fraction(
    left.numerator * right.denominator - right.numerator * left.denominator,
    left.denominator * right.denominator,
  );
}

function add(left: Fraction, right: Fraction) {
  return fraction(
    left.numerator * right.denominator + right.numerator * left.denominator,
    left.denominator * right.denominator,
  );
}

function square(value: Fraction) {
  return fraction(value.numerator * value.numerator, value.denominator * value.denominator);
}

export function squaredDistanceExact(first: RationalPoint, second: RationalPoint) {
  return add(square(subtract(first.x, second.x)), square(subtract(first.y, second.y)));
}

export function buildExercise48Model() {
  const O: Point = { x: 0, y: 0, label: 'O' };
  const B: Point = { x: 0, y: 2, label: 'B' };
  const C: Point = { x: 2, y: 0, label: 'C' };
  const M = midpoint(O, B, 'M');
  const N = midpoint(O, C, 'N');
  const r = lineThroughPoints(B, N, 'r');
  const s = lineThroughPoints(M, C, 's');
  const system = classifyLinearSystem(r, s);
  if (system.systemType !== 'SPD' || !system.intersection || system.intersection === 'same-line') {
    throw new Error('O modelo do exercício 48 deveria produzir uma única interseção.');
  }
  const rationalB: RationalPoint = { x: fraction(B.x), y: fraction(B.y), label: 'B' };
  const rationalN: RationalPoint = { x: fraction(N.x), y: fraction(N.y), label: 'N' };
  const distancePB = exactSquareRoot(squaredDistanceExact(system.intersection, rationalB));
  const distancePN = exactSquareRoot(squaredDistanceExact(system.intersection, rationalN));
  return {
    points: { O, B, C, M, N, P: system.intersection },
    lines: { r, s },
    system,
    distances: { PB: distancePB, PN: distancePN },
    metricEquality: distancePB.radicand === distancePN.radicand
      && distancePB.denominator === distancePN.denominator
      && distancePB.coefficient === 2 * distancePN.coefficient,
  };
}
