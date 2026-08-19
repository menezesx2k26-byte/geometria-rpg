import { describe, expect, it } from 'vitest';
import { acceptedJourneyOptionIds, isAcceptedOption, matchesUnorderedGroups, sameMembers } from './answerAcceptance';

describe('semantic answer acceptance', () => {
  it('accepts canonical and explicit equivalent option ids', () => {
    expect(isAcceptedOption('a', 'a', ['b'])).toBe(true);
    expect(isAcceptedOption('b', 'a', ['b'])).toBe(true);
    expect(isAcceptedOption('c', 'a', ['b'])).toBe(false);
  });

  it('compares members as a multiset', () => {
    expect(sameMembers(['A', 'B', 'C'], ['C', 'A', 'B'])).toBe(true);
    expect(sameMembers(['A', 'A'], ['A', 'B'])).toBe(false);
  });

  it('accepts correct correspondence pairs in any pair order and orientation', () => {
    const groups = [['A', 'D'], ['B', 'E'], ['C', 'F']];
    expect(matchesUnorderedGroups(['D', 'A', 'F', 'C', 'E', 'B'], groups)).toBe(true);
    expect(matchesUnorderedGroups(['B', 'E', 'A', 'D', 'C', 'F'], groups)).toBe(true);
    expect(matchesUnorderedGroups(['A', 'B', 'D', 'E', 'C', 'F'], groups)).toBe(false);
  });

  it('marks the existing valid-but-inefficient distance strategy as accepted', () => {
    expect(acceptedJourneyOptionIds('choose-distances')).toContain('distance-all');
  });
});
