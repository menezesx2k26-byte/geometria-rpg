import { DEFAULT_RUBRIC } from '../data/competencyConfig';
import { resolveChallengeProfile } from '../data/challengeProfiles';
import type {
  AssessmentComponents,
  AttemptV4,
  HintTier,
} from '../types/competency';
import type { MasteryDimension } from '../types/domain';
import { assessAttempt, createHintEvents } from './assessmentEngine';
import { inferBehaviorObservations } from './behaviorObservations';
import { buildCompetencyEvidence } from './evidenceEngine';

export interface AdaptiveAttemptInput {
  id: string;
  encounterId: string;
  stepId: string;
  response: unknown;
  correct: boolean;
  masteryDimensions: MasteryDimension[];
  hintsUsed: number;
  hintTier?: HintTier | undefined;
  selfConfidence?: number | null | undefined;
  durationMs?: number | null | undefined;
  assessmentOverrides?: Partial<AssessmentComponents> | undefined;
  attemptedAt: string;
  evaluator?: 'deterministic' | 'rubric' | 'manual' | 'model-assisted' | undefined;
  rationale?: string | undefined;
}

export function buildAdaptiveAttempt(input: AdaptiveAttemptInput, previousAttempts: AttemptV4[]): AttemptV4 {
  const profile = resolveChallengeProfile(input.encounterId, input.stepId);
  const assessment = assessAttempt({
    correct: input.correct,
    masteryDimensions: input.masteryDimensions,
    hintsUsed: input.hintsUsed,
    hintTier: input.hintTier,
    overrides: input.assessmentOverrides,
  }, profile?.rubric ?? DEFAULT_RUBRIC);
  const challengeId = profile?.id ?? `${input.encounterId}:${input.stepId}`;
  const evidence = profile
    ? buildCompetencyEvidence(
      profile,
      input.id,
      assessment.score,
      assessment.coverage,
      input.attemptedAt,
      input.evaluator,
      input.rationale,
    )
    : [];
  const attempt: AttemptV4 = {
    id: input.id,
    challengeId,
    legacyEncounterId: input.encounterId,
    stepId: input.stepId,
    response: input.response,
    assessment: assessment.components,
    assessmentScore: assessment.score,
    coverage: assessment.coverage,
    hintEvents: createHintEvents(assessment.highestHintTier, input.attemptedAt),
    selfConfidence: input.selfConfidence ?? null,
    durationMs: input.durationMs ?? null,
    status: assessment.status,
    evidence,
    behaviorObservations: [],
    attemptedAt: input.attemptedAt,
  };
  attempt.behaviorObservations = inferBehaviorObservations(attempt, previousAttempts);
  return attempt;
}
