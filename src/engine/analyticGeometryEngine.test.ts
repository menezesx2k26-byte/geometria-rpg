import { describe, expect, it } from 'vitest';
import {
  areCollinear,
  buildExercise48Model,
  classifyLinearSystem,
  equivalentLines,
  lineThroughPoints,
  midpoint,
  satisfies,
} from './analyticGeometryEngine';

describe('analytic geometry engine', () => {
  it('derives midpoint, collinearity and a line through two points', () => {
    expect(midpoint({ x: 0, y: -1 }, { x: -3, y: 2 })).toEqual({ x: -1.5, y: 0.5 });
    expect(areCollinear({ x: 0, y: 0 }, { x: 1, y: 3 }, { x: 2, y: 6 })).toBe(true);
    const line = lineThroughPoints({ x: 0, y: 0 }, { x: 1, y: 3 });
    expect(line).toMatchObject({ a: 3, b: -1, c: 0 });
    expect(satisfies(line, { x: 4, y: 12 })).toBe(true);
  });

  it('recognizes equivalent equations without comparing strings', () => {
    expect(equivalentLines({ a: 3, b: -1, c: 0 }, { a: -6, b: 2, c: 0 })).toBe(true);
  });

  it('classifies concurrent, parallel-distinct and coincident lines', () => {
    const concurrent = classifyLinearSystem({ a: 1, b: 1, c: -4 }, { a: 1, b: -1, c: -2 });
    expect(concurrent).toMatchObject({ systemType: 'SPD', solutions: 'one', relativePosition: 'concurrent' });
    expect(concurrent.intersection).toMatchObject({ x: { numerator: 3, denominator: 1 }, y: { numerator: 1, denominator: 1 } });

    expect(classifyLinearSystem({ a: 1, b: 1, c: -3 }, { a: 1, b: 1, c: -5 }))
      .toMatchObject({ systemType: 'SI', solutions: 'none', intersection: null, relativePosition: 'parallel-distinct' });

    expect(classifyLinearSystem({ a: 1, b: 2, c: -3 }, { a: 2, b: 4, c: -6 }))
      .toMatchObject({ systemType: 'SPI', solutions: 'infinite', intersection: 'same-line', relativePosition: 'coincident' });
  });

  it('reconstructs the complete exact model for exercise 48', () => {
    const model = buildExercise48Model();
    expect(model.points.M).toMatchObject({ x: 0, y: 1 });
    expect(model.points.N).toMatchObject({ x: 1, y: 0 });
    expect(model.lines.r).toMatchObject({ a: 2, b: 1, c: -2 });
    expect(model.lines.s).toMatchObject({ a: 1, b: 2, c: -2 });
    expect(model.points.P).toMatchObject({ x: { numerator: 2, denominator: 3 }, y: { numerator: 2, denominator: 3 } });
    expect(model.distances.PB.text).toBe('2√5/3');
    expect(model.distances.PN.text).toBe('√5/3');
    expect(model.metricEquality).toBe(true);
  });
});
