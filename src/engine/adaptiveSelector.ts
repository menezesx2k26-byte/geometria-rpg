import { challengeProfiles } from '../data/challengeProfiles';
import { confidenceLabel, findHardCompetency, masteryBand } from '../data/competencies';
import type {
  AdaptiveRecommendation,
  AttemptV4,
  ChallengeLevel,
  ChallengeProfile,
  CompetencyState,
  HardCompetencyId,
  MasteryBand,
} from '../types/competency';

const actionLabels: Record<MasteryBand, string> = {
  remediation: 'Reforçar fundamento',
  practice: 'Consolidar estratégia',
  transfer: 'Transferir conhecimento',
  proof: 'Enfrentar uma prova',
};

const desiredLevel: Record<MasteryBand, ChallengeLevel> = {
  remediation: 'iniciante',
  practice: 'intermediario',
  transfer: 'intermediario',
  proof: 'avancado',
};

function latestEvidenceScore(attempts: AttemptV4[], competencyId: HardCompetencyId) {
  for (const attempt of [...attempts].reverse()) {
    const evidence = attempt.evidence.find((item) => item.competencyId === competencyId);
    if (evidence) return evidence.score;
  }
  return 0.5;
}

function selectTarget(states: Record<HardCompetencyId, CompetencyState>, attempts: AttemptV4[]) {
  const practiced = Object.values(states).filter((state) => state.evidenceCount > 0);
  if (!practiced.length) return undefined;
  return [...practiced].sort((left, right) => {
    const leftRecent = latestEvidenceScore(attempts, left.competencyId);
    const rightRecent = latestEvidenceScore(attempts, right.competencyId);
    const leftNeedsWork = left.mastery < 0.85 ? 0 : 1;
    const rightNeedsWork = right.mastery < 0.85 ? 0 : 1;
    return leftNeedsWork - rightNeedsWork
      || left.mastery - right.mastery
      || leftRecent - rightRecent
      || left.confidence - right.confidence
      || (left.lastPracticedAt ?? '').localeCompare(right.lastPracticedAt ?? '')
      || left.competencyId.localeCompare(right.competencyId);
  })[0];
}

function challengeRank(
  profile: ChallengeProfile,
  targetId: HardCompetencyId,
  band: MasteryBand,
  states: Record<HardCompetencyId, CompetencyState>,
) {
  const binding = profile.hardSkills.find((item) => item.id === targetId && item.role !== 'context');
  if (!binding || profile.status !== 'ready' || profile.source.sourceStatus !== 'defined') return undefined;
  const strongContext = profile.hardSkills
    .filter((item) => item.role === 'context')
    .reduce((score, item) => {
      const state = states[item.id];
      return score + (state.evidenceCount > 0 && state.mastery >= 0.85 ? state.mastery * state.confidence : 0);
    }, 0);
  return [
    profile.rpg.questType === 'revisao' ? 0 : 1,
    profile.level === desiredLevel[band] ? 0 : 1,
    -strongContext,
    binding.role === 'primary' ? 0 : 1,
    -binding.weight,
    profile.id,
  ] as const;
}

function compareRank(left: ReturnType<typeof challengeRank>, right: ReturnType<typeof challengeRank>) {
  if (!left) return 1;
  if (!right) return -1;
  for (let index = 0; index < left.length; index += 1) {
    const a = left[index];
    const b = right[index];
    if (a === b) continue;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b));
  }
  return 0;
}

export function selectAdaptiveRecommendation(
  states: Record<HardCompetencyId, CompetencyState>,
  attempts: AttemptV4[],
  profiles = challengeProfiles,
): AdaptiveRecommendation | undefined {
  const target = selectTarget(states, attempts);
  if (!target) return undefined;
  const band = masteryBand(target.mastery);
  const candidates = profiles
    .filter((profile) => challengeRank(profile, target.competencyId, band, states))
    .sort((left, right) => compareRank(
      challengeRank(left, target.competencyId, band, states),
      challengeRank(right, target.competencyId, band, states),
    ));
  const selected = candidates[0];
  const definition = findHardCompetency(target.competencyId);
  if (!selected || !definition) return undefined;
  const confidence = confidenceLabel(target.evidenceCount, target.confidence);
  const reason = band === 'remediation'
    ? `Evidências recentes sugerem retomar ${definition.name.toLowerCase()}; confiança ${confidence}.`
    : band === 'practice'
      ? `A competência está em desenvolvimento e já permite uma variação guiada; confiança ${confidence}.`
      : band === 'transfer'
        ? `O domínio permite combinar representações com menos apoio; confiança ${confidence}.`
        : `O domínio está forte o bastante para uma prova ou revisão espaçada; confiança ${confidence}.`;
  return {
    id: `${target.competencyId}:${selected.id}:${band}`,
    competencyId: target.competencyId,
    competencyName: definition.name,
    rpgName: definition.rpgName ?? definition.name,
    challengeId: selected.id,
    title: selected.title,
    route: selected.rpg.route,
    actionLabel: actionLabels[band],
    reason,
    mastery: target.mastery,
    confidence: target.confidence,
    band,
  };
}
