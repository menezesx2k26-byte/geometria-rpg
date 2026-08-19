import { describe, expect, it } from 'vitest';
import {
  angleEquivalent,
  lineEquivalent,
  parseNumericExpression,
  pointEquivalent,
  scalarEquivalent,
  segmentEquivalent,
  triangleCorrespondenceEquivalent,
} from './mathAnswerEngine';
import { validateFreeTextAnswer } from './answerAcceptance';

describe('mathematical answer engine', () => {
  it('evaluates safe numeric expressions and equivalent scalar forms', () => {
    expect(parseNumericExpression('28/2')).toBe(14);
    expect(parseNumericExpression('2√5/3')).toBeCloseTo(2 * Math.sqrt(5) / 3);
    expect(scalarEquivalent('x = 28/2', 14, 'x')).toBe(true);
    expect(scalarEquivalent('14 = x', 14, 'x')).toBe(true);
    expect(scalarEquivalent('x = 8', 14, 'x')).toBe(false);
  });

  it('accepts algebraically equivalent line equations instead of string equality', () => {
    const expected = { a: 1, b: 1, c: 1 };
    expect(lineEquivalent('x+y+1=0', expected)).toBe(true);
    expect(lineEquivalent('2x+2y+2=0', expected)).toBe(true);
    expect(lineEquivalent('y=-x-1', expected)).toBe(true);
    expect(lineEquivalent('-3x-3y-3=0', expected)).toBe(true);
    expect(lineEquivalent('x+y-1=0', expected)).toBe(false);
  });

  it('accepts equivalent point, segment and angle notation', () => {
    expect(pointEquivalent('M=(-3/2;1/2)', { x: -1.5, y: 0.5 })).toBe(true);
    expect(segmentEquivalent('FD', 'D', 'F')).toBe(true);
    expect(segmentEquivalent('DE', 'D', 'F')).toBe(false);
    expect(angleEquivalent('∠CBA', 'ABC')).toBe(true);
    expect(angleEquivalent('∠BAC', 'ABC')).toBe(false);
  });

  it('accepts every synchronized permutation and reverse-side congruence notation', () => {
    const valid = [
      '△CBA ≅ △CDE',
      '△CAB ≅ △CED',
      '△BCA ≅ △DCE',
      '△BAC ≅ △DEC',
      '△ACB ≅ △ECD',
      '△ABC ≅ △EDC',
      '△EDC ≅ △ABC',
    ];
    for (const answer of valid) expect(triangleCorrespondenceEquivalent(answer, 'CBA', 'CDE')).toBe(true);
    expect(triangleCorrespondenceEquivalent('△ABC ≅ △CDE', 'CBA', 'CDE')).toBe(false);
  });

  it('routes free-form validators through the same deterministic engine', () => {
    expect(validateFreeTextAnswer('journey', 'generic-point-line', '2x+2y+2=0').correct).toBe(true);
    expect(validateFreeTextAnswer('journey', 'generic-point-line', 'x+y-1=0').correct).toBe(false);
    expect(validateFreeTextAnswer('official-q15', 'q15-x', 'x=7+7').correct).toBe(true);
    expect(validateFreeTextAnswer('official-q15', 'q15-order', '△ABC ≅ △EDC').correct).toBe(true);
    expect(validateFreeTextAnswer('microquest', 'correspondence-pairs', 'FD').correct).toBe(true);
  });
});
