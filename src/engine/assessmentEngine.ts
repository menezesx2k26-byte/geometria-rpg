import { DEFAULT_RUBRIC, HINT_INDEPENDENCE } from '../data/competencyConfig';
import type {
  AssessmentComponents,
  HintEvent,
  HintTier,
  RubricWeights,
} from '../types/competency';
import type { MasteryDimension } from '../types/domain';

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export interface AssessmentInput {
  correct: boolean;
  masteryDimensions: MasteryDimension[];
  hintsUsed: number;
  hintTier?: HintTier | undefined;
  overrides?: Partial<AssessmentComponents> | undefined;
}

export interface AssessmentResult {
  components: AssessmentComponents;
  score: number | null;
  coverage: number;
  status: 'accepted' | 'rejected' | 'studied';
  highestHintTier: 0 | HintTier;
}

export function inferHighestHintTier(hintsUsed: number, explicitTier?: HintTier): 0 | HintTier {
  if (explicitTier) return explicitTier;
  if (hintsUsed <= 0) return 0;
  return Math.min(4, Math.max(1, Math.round(hintsUsed))) as HintTier;
}

export function scoreAssessment(components: AssessmentComponents, rubric: RubricWeights = DEFAULT_RUBRIC) {
  let numerator = 0;
  let denominator = 0;
  for (const dimension of Object.keys(rubric) as (keyof RubricWeights)[]) {
    const value = components[dimension];
    if (value === null) continue;
    numerator += rubric[dimension] * clamp01(value);
    denominator += rubric[dimension];
  }
  return {
    score: denominator > 0 ? numerator / denominator : null,
    coverage: denominator,
  };
}

export function assessAttempt(input: AssessmentInput, rubric: RubricWeights = DEFAULT_RUBRIC): AssessmentResult {
  const highestHintTier = inferHighestHintTier(input.hintsUsed, input.hintTier);
  const expectsJustification = input.masteryDimensions.includes('justification');
  const expectsVerification = input.masteryDimensions.includes('transfer');
  const components: AssessmentComponents = {
    correctness: input.correct ? 1 : 0,
    justification: expectsJustification ? (input.correct ? 1 : 0) : null,
    independence: HINT_INDEPENDENCE[highestHintTier],
    verification: expectsVerification ? (input.correct ? 1 : 0) : null,
    ...input.overrides,
  };
  const { score, coverage } = scoreAssessment(components, rubric);
  return {
    components,
    score,
    coverage,
    status: highestHintTier === 5 ? 'studied' : input.correct ? 'accepted' : 'rejected',
    highestHintTier,
  };
}

export function createHintEvents(tier: 0 | HintTier, attemptedAt: string): HintEvent[] {
  if (tier === 0) return [];
  return [{ tier, requestedAt: attemptedAt, hintId: `tier-${tier}` }];
}
