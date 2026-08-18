import { describe, expect, it } from 'vitest';
import { validateCompetencyData } from '../data/competencyValidation';
import { challengeProfiles } from '../data/challengeProfiles';
import { assessAttempt } from './assessmentEngine';
import { buildAdaptiveAttempt } from './adaptiveAttempt';
import { selectAdaptiveRecommendation } from './adaptiveSelector';
import { applyEvidenceToStates, createInitialCompetencyStates } from './evidenceEngine';
import type { AttemptV4 } from '../types/competency';

describe('adaptive competency engine', () => {
  it('validates the complete H/S/P catalog and every ready challenge profile', () => {
    expect(validateCompetencyData()).toEqual([]);
  });

  it('renormalizes a partial C/J/I/V assessment without treating missing dimensions as zero', () => {
    const result = assessAttempt({
      correct: true,
      masteryDimensions: [],
      hintsUsed: 0,
    });

    expect(result.components).toEqual({
      correctness: 1,
      justification: null,
      independence: 1,
      verification: null,
    });
    expect(result.coverage).toBeCloseTo(0.65);
    expect(result.score).toBeCloseTo(1);
  });

  it('reduces independence for a tier 2 hint while preserving a correct answer', () => {
    const result = assessAttempt({
      correct: true,
      masteryDimensions: ['application'],
      hintsUsed: 1,
      hintTier: 2,
    });

    expect(result.components.independence).toBe(0.85);
    expect(result.status).toBe('accepted');
  });

  it('applies the PDF evidence update Mnew = 0.75 Mprev + 0.25 E', () => {
    const attempts: AttemptV4[] = [];
    const adaptiveAttempt = buildAdaptiveAttempt({
      id: 'attempt-1',
      encounterId: 'microquest:correspondence-pairs',
      stepId: 'single-competency',
      response: ['df'],
      correct: true,
      masteryDimensions: ['recognition', 'application'],
      hintsUsed: 0,
      attemptedAt: '2026-08-18T12:00:00.000Z',
    }, attempts);
    const next = applyEvidenceToStates(createInitialCompetencyStates(), adaptiveAttempt.evidence, attempts);

    expect(next.H5.mastery).toBeCloseTo(0.625);
    expect(next.H5.evidenceCount).toBe(1);
    expect(next.H5.confidence).toBeGreaterThan(0);
  });

  it('preserves strong H10 and targets proof H6/H15 instead of elementary angle recognition', () => {
    const states = createInitialCompetencyStates();
    states.H10 = { ...states.H10, mastery: 0.90, confidence: 0.8, evidenceCount: 8, distinctChallengeCount: 3, meanCoverage: 1 };
    states.H6 = { ...states.H6, mastery: 0.35, confidence: 0.5, evidenceCount: 5, distinctChallengeCount: 2, meanCoverage: 0.9 };
    states.H15 = { ...states.H15, mastery: 0.41, confidence: 0.5, evidenceCount: 5, distinctChallengeCount: 2, meanCoverage: 0.9 };

    const recommendation = selectAdaptiveRecommendation(states, [], challengeProfiles);

    expect(recommendation?.competencyId).toBe('H6');
    expect(recommendation?.challengeId).toBe('adaptive:parallelism-bridge:parallelogram-boss');
    expect(recommendation?.route).toContain('focus=parallelogram-boss');
  });

  it('does not generate evidence for a competency marked only as context', () => {
    const attempt = buildAdaptiveAttempt({
      id: 'attempt-proof',
      encounterId: 'adaptive:parallelism-bridge:parallelogram-boss',
      stepId: 'parallelogram-boss',
      response: ['diagonal-proof'],
      correct: false,
      masteryDimensions: ['justification', 'transfer'],
      hintsUsed: 0,
      attemptedAt: '2026-08-18T12:00:00.000Z',
    }, []);

    expect(attempt.evidence.map((item) => item.competencyId)).not.toContain('H10');
    expect(attempt.evidence.map((item) => item.competencyId)).toEqual(expect.arrayContaining(['H6', 'H15']));
  });
});
