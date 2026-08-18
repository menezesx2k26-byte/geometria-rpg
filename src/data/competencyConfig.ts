import type { HintTier, RubricWeights } from '../types/competency';

export const DEFAULT_RUBRIC: RubricWeights = {
  correctness: 0.50,
  justification: 0.25,
  independence: 0.15,
  verification: 0.10,
};

export const BASE_EVIDENCE_ALPHA = 0.25;
export const CONFIDENCE_EVIDENCE_TARGET = 8;
export const CONFIDENCE_CHALLENGE_DIVERSITY_TARGET = 3;

export const HINT_INDEPENDENCE: Record<0 | HintTier, number> = {
  0: 1,
  1: 1,
  2: 0.85,
  3: 0.65,
  4: 0.40,
  5: 0,
};
