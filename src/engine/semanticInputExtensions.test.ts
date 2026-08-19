import { describe, expect, it } from 'vitest';
import {
  angleCongruenceEquivalentFlexible,
  keywordEquivalentFlexible,
  lineEquivalentFlexible,
  pointEquivalentFlexible,
} from './semanticInputExtensions';

describe('residual semantic equivalence forms', () => {
  it('accepts angle congruence even when OPV appears before the relation', () => {
    expect(angleCongruenceEquivalentFlexible('OPV: ∠BCA ≅ ∠DCE', 'BCA', 'DCE')).toBe(true);
    expect(angleCongruenceEquivalentFlexible('por OPV, ∠ACB = ∠ECD', 'BCA', 'DCE')).toBe(true);
  });

  it('does not let unrelated three-letter words create a false positive', () => {
    expect(angleCongruenceEquivalentFlexible('OPV: ∠BCA ≅ ∠CDE', 'BCA', 'DCE')).toBe(false);
  });

  it('accepts common positive wrapper phrases without accepting negation', () => {
    expect(keywordEquivalentFlexible('caso ALA', ['ala'])).toBe(true);
    expect(keywordEquivalentFlexible('critério ALA', ['ala'])).toBe(true);
    expect(keywordEquivalentFlexible('é mediana', ['mediana'])).toBe(true);
    expect(keywordEquivalentFlexible('uma mediana', ['mediana'])).toBe(true);
    expect(keywordEquivalentFlexible('não é mediana', ['mediana'])).toBe(false);
  });

  it('accepts system solutions written as x/y assignments', () => {
    expect(pointEquivalentFlexible('x=2/3; y=2/3', { x: 2 / 3, y: 2 / 3 })).toBe(true);
    expect(pointEquivalentFlexible('y=2/3 e x=2/3', { x: 2 / 3, y: 2 / 3 })).toBe(true);
    expect(pointEquivalentFlexible('x=2/3; y=1/3', { x: 2 / 3, y: 2 / 3 })).toBe(false);
  });

  it('accepts a nonzero scalar multiplying an equivalent line in parentheses', () => {
    const expected = { a: 1, b: 1, c: 1 };
    expect(lineEquivalentFlexible('2(x+y+1)=0', expected)).toBe(true);
    expect(lineEquivalentFlexible('0=-3(x+y+1)', expected)).toBe(true);
    expect(lineEquivalentFlexible('0(x+y+1)=0', expected)).toBe(false);
    expect(lineEquivalentFlexible('2(x+y-1)=0', expected)).toBe(false);
  });
});
