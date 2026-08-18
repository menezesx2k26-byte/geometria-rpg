import {
  BASE_EVIDENCE_ALPHA,
  CONFIDENCE_CHALLENGE_DIVERSITY_TARGET,
  CONFIDENCE_EVIDENCE_TARGET,
} from '../data/competencyConfig';
import { hardCompetencyIds } from '../data/competencies';
import type {
  AttemptV4,
  ChallengeProfile,
  CompetencyEvidence,
  CompetencyState,
  HardCompetencyId,
} from '../types/competency';

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function createInitialCompetencyStates(): Record<HardCompetencyId, CompetencyState> {
  return hardCompetencyIds.reduce((states, competencyId) => {
    states[competencyId] = {
      competencyId,
      mastery: 0.5,
      confidence: 0,
      evidenceCount: 0,
      distinctChallengeCount: 0,
      meanCoverage: 0,
      lastEvidenceIds: [],
    };
    return states;
  }, {} as Record<HardCompetencyId, CompetencyState>);
}

export function buildCompetencyEvidence(
  profile: ChallengeProfile,
  attemptId: string,
  score: number | null,
  coverage: number,
  createdAt: string,
  evaluator: CompetencyEvidence['evaluator'] = 'deterministic',
  rationale = 'assessment_components',
): CompetencyEvidence[] {
  if (score === null || coverage <= 0) return [];
  return profile.hardSkills
    .filter((skill): skill is typeof skill & { role: 'primary' | 'supporting' } => skill.role !== 'context')
    .map((skill) => ({
      id: `${attemptId}:${skill.id}`,
      attemptId,
      challengeId: profile.id,
      competencyId: skill.id,
      challengeWeight: skill.weight,
      role: skill.role,
      score,
      coverage,
      evaluator,
      rationale,
      createdAt,
    }));
}

function historicChallengeIds(attempts: AttemptV4[], competencyId: HardCompetencyId) {
  return new Set(attempts.flatMap((attempt) => attempt.evidence)
    .filter((evidence) => evidence.competencyId === competencyId)
    .map((evidence) => evidence.challengeId));
}

export function applyEvidenceToStates(
  states: Record<HardCompetencyId, CompetencyState>,
  evidence: CompetencyEvidence[],
  previousAttempts: AttemptV4[],
) {
  const next = { ...states };
  const maxWeight = Math.max(0.000001, ...evidence.map((item) => item.challengeWeight));

  for (const item of evidence) {
    const previous = next[item.competencyId] ?? createInitialCompetencyStates()[item.competencyId];
    const relativeWeight = item.challengeWeight / maxWeight;
    const alpha = BASE_EVIDENCE_ALPHA * relativeWeight;
    const mastery = clamp01((1 - alpha) * previous.mastery + alpha * item.score);
    const evidenceCount = previous.evidenceCount + 1;
    const meanCoverage = ((previous.meanCoverage * previous.evidenceCount) + item.coverage) / evidenceCount;
    const challenges = historicChallengeIds(previousAttempts, item.competencyId);
    challenges.add(item.challengeId);
    const distinctChallengeCount = Math.max(previous.distinctChallengeCount, challenges.size);
    const volume = Math.min(1, evidenceCount / CONFIDENCE_EVIDENCE_TARGET);
    const breadth = Math.min(1, distinctChallengeCount / CONFIDENCE_CHALLENGE_DIVERSITY_TARGET);
    const confidence = clamp01(volume * breadth * meanCoverage);
    next[item.competencyId] = {
      ...previous,
      mastery,
      confidence,
      evidenceCount,
      distinctChallengeCount,
      meanCoverage,
      lastPracticedAt: item.createdAt,
      lastEvidenceIds: [...previous.lastEvidenceIds, item.id].slice(-20),
    };
  }

  return next;
}
