import { hardCompetencyIds } from '../data/competencies';
import type {
  AdaptiveState,
  AttemptV4,
  CompetencyState,
  HardCompetencyId,
  HintTier,
} from '../types/competency';
import type { MasteryDimension } from '../types/domain';
import { buildAdaptiveAttempt } from './adaptiveAttempt';
import { applyEvidenceToStates, createInitialCompetencyStates } from './evidenceEngine';

export interface LegacyAttemptLike {
  encounterId: string;
  stepId: string;
  selectedIds?: string[];
  correct: boolean;
  masteryDimensions?: MasteryDimension[];
  hintsUsed?: number;
  attemptedAt: string;
}

export function createInitialAdaptiveState(): AdaptiveState {
  return { lastTargetIds: [], recommendationHistory: [] };
}

function finiteNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function normalizeCompetencyStates(value: unknown) {
  const initial = createInitialCompetencyStates();
  if (!value || typeof value !== 'object') return initial;
  const stored = value as Partial<Record<HardCompetencyId, Partial<CompetencyState>>>;
  for (const id of hardCompetencyIds) {
    const current = stored[id];
    if (!current) continue;
    initial[id] = {
      ...initial[id],
      ...current,
      competencyId: id,
      mastery: clamp01(finiteNumber(current.mastery, initial[id].mastery)),
      confidence: clamp01(finiteNumber(current.confidence, initial[id].confidence)),
      evidenceCount: Math.max(0, Math.floor(finiteNumber(current.evidenceCount, 0))),
      distinctChallengeCount: Math.max(0, Math.floor(finiteNumber(current.distinctChallengeCount, 0))),
      meanCoverage: clamp01(finiteNumber(current.meanCoverage, 0)),
      lastEvidenceIds: Array.isArray(current.lastEvidenceIds)
        ? current.lastEvidenceIds.filter((entry): entry is string => typeof entry === 'string').slice(-20)
        : [],
    };
  }
  return initial;
}

function clamp01(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

export function replayLegacyAttempts(legacyAttempts: LegacyAttemptLike[]) {
  let states = createInitialCompetencyStates();
  const attempts: AttemptV4[] = [];
  legacyAttempts.forEach((legacy, index) => {
    const hintsUsed = legacy.hintsUsed ?? 0;
    const hintTier = hintsUsed > 0 ? Math.min(4, Math.max(1, hintsUsed)) as HintTier : undefined;
    const attempt = buildAdaptiveAttempt({
      id: `migration:${index}:${legacy.attemptedAt}`,
      encounterId: legacy.encounterId,
      stepId: legacy.stepId,
      response: legacy.selectedIds ?? [],
      correct: legacy.correct,
      // V3 did not record C/J/I/V rubrics. Only correctness and known hint use
      // can be replayed without inventing justification or verification.
      masteryDimensions: [],
      hintsUsed,
      hintTier,
      attemptedAt: legacy.attemptedAt,
      evaluator: 'deterministic',
      rationale: 'migrated_from_v3',
    }, attempts);
    states = applyEvidenceToStates(states, attempt.evidence, attempts);
    attempts.push(attempt);
  });
  return { states, attempts };
}
