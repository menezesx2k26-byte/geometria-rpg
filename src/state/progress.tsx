import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { skills } from '../data/bootstrap';
import {
  achievementDefinitions,
  campaignNodes,
  findCampaignNodeByCompletionId,
  gameQuests,
  getNextCampaignNode,
  initialQuestProgress,
} from '../data/gameCampaign';
import { microquestForTag } from '../data/microquests';
import { buildAdaptiveAttempt } from '../engine/adaptiveAttempt';
import { trimBehaviorObservations } from '../engine/behaviorObservations';
import { createInitialAdaptiveState, normalizeCompetencyStates, replayLegacyAttempts } from '../engine/competencyMigration';
import { applyEvidenceToStates, createInitialCompetencyStates } from '../engine/evidenceEngine';
import type { AssessmentComponents, HintTier } from '../types/competency';
import type {
  Attempt,
  DiagnosticTag,
  GameAnalyticsEvent,
  GameAnalyticsEventType,
  MasteryDimension,
  MasteryProfile,
  MissionProgress,
  ReviewSchedule,
  UserProgress,
} from '../types/domain';

export const STORAGE_KEY = 'geometria-rpg:progress:v4';
const LEGACY_STORAGE_KEYS = ['geometria-rpg:progress:v3', 'geometria-rpg:progress:v2', 'geometria-rpg:progress:v1'];
const MAX_ANALYTICS_EVENTS = 250;

interface AttemptMetadata {
  skillIds?: string[];
  masteryDimensions?: MasteryDimension[];
  hintsUsed?: number;
  hintTier?: HintTier | undefined;
  selfConfidence?: number | null | undefined;
  durationMs?: number | null | undefined;
  assessment?: Partial<AssessmentComponents> | undefined;
  position?: string;
}

function createProfile(skillId: string, dimensions: MasteryDimension[], available: boolean): MasteryProfile {
  return {
    skillId,
    state: available ? 'available' : 'locked',
    mastery: 0,
    dimensions: dimensions.map((dimension) => ({ dimension, score: 0, attempts: 0 })),
    correctAttempts: 0,
    totalAttempts: 0,
  };
}

export function createInitialProgress(): UserProgress {
  const roots = skills.filter((skill) => skill.prerequisites.length === 0);
  return {
    version: 4,
    skills: Object.fromEntries(
      skills.map((skill) => [
        skill.id,
        createProfile(skill.id, skill.masteryDimensions, skill.prerequisites.length === 0),
      ]),
    ),
    attempts: [],
    completedEncounterIds: [],
    discoveredSkillIds: roots.map((skill) => skill.id),
    discoveredCodexEntryIds: roots.map((skill) => skill.codexEntryId),
    errorTagCounts: {},
    hintsUsed: 0,
    lastPosition: '/map',
    recommendedMicroquestIds: [],
    completedMicroquestIds: [],
    xp: 0,
    level: 1,
    missionProgress: {},
    streak: { current: 0, best: 0 },
    quests: initialQuestProgress(),
    achievements: [],
    reviewSchedule: {},
    analyticsEvents: [],
    competencyStates: createInitialCompetencyStates(),
    attemptsV4: [],
    recentBehaviorObservations: [],
    adaptiveState: createInitialAdaptiveState(),
  };
}

function scoreTo100(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value <= 1 ? value * 100 : value));
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function yesterdayKey(date: Date) {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return dateKey(previous);
}

function updateStreak(progress: UserProgress, now: Date) {
  const today = dateKey(now);
  if (progress.streak.lastActivityDate === today) return progress.streak;
  const current = progress.streak.lastActivityDate === yesterdayKey(now) ? progress.streak.current + 1 : 1;
  return { current, best: Math.max(progress.streak.best, current), lastActivityDate: today };
}

function analyticsEvent(
  type: GameAnalyticsEventType,
  now: Date,
  values: Omit<GameAnalyticsEvent, 'id' | 'type' | 'occurredAt'> = {},
): GameAnalyticsEvent {
  return {
    id: `${now.getTime()}-${type}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    occurredAt: now.toISOString(),
    ...values,
  };
}

function appendEvents(progress: UserProgress, events: GameAnalyticsEvent[]) {
  return [...progress.analyticsEvents, ...events].slice(-MAX_ANALYTICS_EVENTS);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}

function updateReviewSchedule(
  schedule: Record<string, ReviewSchedule>,
  conceptIds: string[],
  correct: boolean,
  now: Date,
) {
  const next = { ...schedule };
  for (const conceptId of conceptIds) {
    const current = next[conceptId];
    const consecutiveCorrect = correct ? (current?.consecutiveCorrect ?? 0) + 1 : 0;
    const recentErrors = correct ? Math.max(0, (current?.recentErrors ?? 0) - 1) : (current?.recentErrors ?? 0) + 1;
    const intervalDays = correct ? Math.min(30, Math.max(1, 2 ** Math.min(4, consecutiveCorrect - 1))) : 1;
    next[conceptId] = {
      conceptId,
      consecutiveCorrect,
      recentErrors,
      intervalDays,
      lastSeen: now.toISOString(),
      nextReview: addDays(now, intervalDays),
    };
  }
  return next;
}

function starsForCompletion(progress: UserProgress, completionId: string, previous?: MissionProgress): 1 | 2 | 3 {
  const lastPlayedAt = previous?.lastPlayedAt ? new Date(previous.lastPlayedAt).getTime() : 0;
  const attempts = progress.attempts.filter((attempt) => {
    if (attempt.encounterId !== completionId) return false;
    const attemptedAt = new Date(attempt.attemptedAt).getTime();
    return previous?.lastPlayedAt ? attemptedAt > lastPlayedAt : true;
  });
  if (!attempts.length) return 1;
  const errors = attempts.filter((attempt) => !attempt.correct).length;
  const hints = attempts.reduce((total, attempt) => total + attempt.hintsUsed, 0);
  if (errors === 0 && hints === 0) return 3;
  if (errors + hints <= 2) return 2;
  return 1;
}

function unlockAchievement(progress: UserProgress, achievementId: string, now: Date) {
  if (progress.achievements.some((entry) => entry.achievementId === achievementId)) {
    return { achievements: progress.achievements, title: undefined as string | undefined };
  }
  const definition = achievementDefinitions.find((entry) => entry.id === achievementId);
  return {
    achievements: [...progress.achievements, { achievementId, unlockedAt: now.toISOString() }],
    title: definition?.title,
  };
}

export function applyMissionCompletion(
  progress: UserProgress,
  completionId: string,
  skillIds: string[],
  codexEntryIds: string[],
  now = new Date(),
  completionPosition?: string,
): UserProgress {
  const node = findCampaignNodeByCompletionId(completionId);
  const nextSkills = { ...progress.skills };
  for (const skillId of skillIds) {
    const profile = nextSkills[skillId];
    if (profile) nextSkills[skillId] = { ...profile, state: profile.mastery >= 80 ? 'mastered' : 'practicing' };
  }

  const completedEncounterIds = [...new Set([...progress.completedEncounterIds, completionId])];
  if (!node) {
    return {
      ...progress,
      skills: nextSkills,
      completedEncounterIds,
      discoveredSkillIds: [...new Set([...progress.discoveredSkillIds, ...skillIds])],
      discoveredCodexEntryIds: [...new Set([...progress.discoveredCodexEntryIds, ...codexEntryIds])],
      lastPosition: completionPosition
        ?? (completionId.startsWith('proof:') ? `/proof/${completionId.slice(6)}` : progress.lastPosition),
    };
  }

  const previousMission = progress.missionProgress[node.id];
  const stars = starsForCompletion(progress, completionId, previousMission);
  const firstCompletion = !previousMission?.completions;
  const missionProgress = {
    ...progress.missionProgress,
    [node.id]: {
      missionId: node.id,
      bestStars: Math.max(previousMission?.bestStars ?? 0, stars) as 1 | 2 | 3,
      completions: (previousMission?.completions ?? 0) + 1,
      completedAt: previousMission?.completedAt ?? now.toISOString(),
      lastPlayedAt: now.toISOString(),
    },
  };
  const completedMissionCount = Object.values(missionProgress).filter((entry) => entry.completions > 0).length;
  const quests = { ...progress.quests };
  let bonusXp = 0;
  let questCompleted: string | undefined;
  const questEvents: GameAnalyticsEvent[] = [];
  for (const definition of gameQuests) {
    const current = quests[definition.id] ?? { questId: definition.id, value: 0, target: definition.target, completed: false };
    if (current.completed) continue;
    const qualifies = definition.kind === 'missions'
      ? firstCompletion
      : definition.kind === 'perfect'
        ? stars === 3
        : node.type === 'boss' && firstCompletion;
    if (!qualifies) continue;
    const value = Math.min(definition.target, current.value + 1);
    const completed = value >= definition.target;
    quests[definition.id] = {
      ...current,
      value,
      completed,
      ...(completed ? { rewardedAt: now.toISOString() } : {}),
    };
    if (completed) {
      bonusXp += definition.rewardXp;
      questCompleted ??= definition.title;
      questEvents.push(analyticsEvent('quest_completed', now, { missionId: node.id, value: definition.rewardXp }));
    }
  }

  let achievements = progress.achievements;
  let achievementUnlocked: string | undefined;
  const achievementsToCheck = [
    firstCompletion && completedMissionCount >= 1 ? 'first-mission' : undefined,
    stars === 3 ? 'first-perfect' : undefined,
    node.type === 'boss' && firstCompletion ? 'first-boss' : undefined,
    firstCompletion ? node.reward.achievementId : undefined,
    completedMissionCount >= 5 ? 'five-missions' : undefined,
  ].filter(Boolean) as string[];
  const streak = firstCompletion ? updateStreak(progress, now) : progress.streak;
  if (streak.current >= 7) achievementsToCheck.push('seven-day-streak');
  for (const achievementId of [...new Set(achievementsToCheck)]) {
    const result = unlockAchievement({ ...progress, achievements }, achievementId, now);
    achievements = result.achievements;
    achievementUnlocked ??= result.title;
  }

  const earnedXp = firstCompletion ? node.reward.xp : Math.max(5, Math.round(node.reward.xp * 0.2));
  const xp = progress.xp + earnedXp + bonusXp;
  const previewProgress: UserProgress = {
    ...progress,
    skills: nextSkills,
    completedEncounterIds,
    discoveredSkillIds: [...new Set([...progress.discoveredSkillIds, ...skillIds, ...node.concepts])],
    discoveredCodexEntryIds: [...new Set([...progress.discoveredCodexEntryIds, ...codexEntryIds])],
    xp,
    level: Math.floor(xp / 100) + 1,
    missionProgress,
    streak,
    quests,
    achievements,
    lastPosition: node.route,
    analyticsEvents: appendEvents(progress, [
      analyticsEvent(node.type === 'boss' ? 'boss_completed' : 'mission_completed', now, {
        missionId: node.id,
        conceptIds: node.concepts,
        value: earnedXp,
      }),
      ...questEvents,
    ]),
  };
  const nextMission = getNextCampaignNode(previewProgress);
  return {
    ...previewProgress,
    lastMissionReward: {
      missionId: node.id,
      completionId,
      xp: earnedXp,
      bonusXp,
      stars,
      conceptLabel: node.subtitle,
      ...(questCompleted ? { questCompleted } : {}),
      ...(achievementUnlocked ? { achievementUnlocked } : {}),
      ...(nextMission?.title ? { nextMissionTitle: nextMission.title } : {}),
    },
  };
}

export function migrateProgress(value: unknown): UserProgress {
  const initial = createInitialProgress();
  if (!value || typeof value !== 'object') return initial;
  const stored = value as Partial<UserProgress>;
  const storedVersion = (value as { version?: number }).version;
  const storedSkills = stored.skills ?? {};
  const nextSkills = Object.fromEntries(
    skills.map((skill) => {
      const fallback = initial.skills[skill.id] ?? createProfile(skill.id, skill.masteryDimensions, skill.prerequisites.length === 0);
      const existing = storedSkills[skill.id];
      if (!existing) return [skill.id, fallback];
      const dimensions = skill.masteryDimensions.map((dimension) => {
        const previous = existing.dimensions?.find((item) => item.dimension === dimension);
        return { dimension, score: scoreTo100(previous?.score), attempts: previous?.attempts ?? 0 };
      });
      return [skill.id, { ...fallback, ...existing, mastery: scoreTo100(existing.mastery), dimensions }];
    }),
  );
  const attempts = (Array.isArray(stored.attempts) ? stored.attempts : [])
    .filter((attempt) => attempt && typeof attempt === 'object' && typeof attempt.encounterId === 'string' && typeof attempt.stepId === 'string')
    .map((attempt) => ({
      ...attempt,
      selectedIds: Array.isArray(attempt.selectedIds) ? attempt.selectedIds.filter((id): id is string => typeof id === 'string') : [],
      diagnosticTags: Array.isArray(attempt.diagnosticTags) ? attempt.diagnosticTags : [],
      skillIds: Array.isArray(attempt.skillIds) ? attempt.skillIds.filter((id): id is string => typeof id === 'string') : [],
      masteryDimensions: Array.isArray(attempt.masteryDimensions) ? attempt.masteryDimensions : [],
      hintsUsed: typeof attempt.hintsUsed === 'number' && Number.isFinite(attempt.hintsUsed) ? Math.max(0, Math.floor(attempt.hintsUsed)) : 0,
      attemptedAt: typeof attempt.attemptedAt === 'string' ? attempt.attemptedAt : new Date(0).toISOString(),
    }));
  const completedEncounterIds = Array.isArray(stored.completedEncounterIds)
    ? [...new Set(stored.completedEncounterIds.filter((id): id is string => typeof id === 'string'))]
    : [];
  const inferredMissionProgress = Object.fromEntries(
    campaignNodes
      .filter((node) => completedEncounterIds.includes(node.completionId))
      .map((node) => {
        const completedAt = attempts.find((attempt) => attempt.encounterId === node.completionId)?.attemptedAt;
        return [node.id, {
          missionId: node.id,
          bestStars: 1 as const,
          completions: 1,
          ...(completedAt ? { completedAt } : {}),
        }];
      }),
  );
  const rawMissionProgress = stored.missionProgress && typeof stored.missionProgress === 'object' && !Array.isArray(stored.missionProgress)
    ? stored.missionProgress
    : {};
  const normalizedStoredMissionProgress = Object.fromEntries(campaignNodes.flatMap((node) => {
    const raw = rawMissionProgress[node.id];
    if (!raw || typeof raw !== 'object') return [];
    const completions = typeof raw.completions === 'number' && Number.isFinite(raw.completions)
      ? Math.max(0, Math.floor(raw.completions))
      : 0;
    const rawStars = typeof raw.bestStars === 'number' && Number.isFinite(raw.bestStars) ? Math.floor(raw.bestStars) : 0;
    const bestStars = Math.max(0, Math.min(3, rawStars)) as 0 | 1 | 2 | 3;
    if (completions === 0 && bestStars === 0) return [];
    return [[node.id, {
      missionId: node.id,
      bestStars: bestStars || 1,
      completions: Math.max(1, completions),
      ...(typeof raw.completedAt === 'string' ? { completedAt: raw.completedAt } : {}),
      ...(typeof raw.lastPlayedAt === 'string' ? { lastPlayedAt: raw.lastPlayedAt } : {}),
    }]];
  }));
  const missionProgress = { ...inferredMissionProgress, ...normalizedStoredMissionProgress };
  const inferredXp = Object.keys(missionProgress).reduce((total, id) => {
    const node = campaignNodes.find((candidate) => candidate.id === id);
    return total + (node?.reward.xp ?? 0);
  }, 0);
  const storedXp = typeof stored.xp === 'number' && Number.isFinite(stored.xp) ? stored.xp : inferredXp;
  const normalizedXp = Math.max(0, Math.round(storedXp));
  const replayed = storedVersion === 4
    ? undefined
    : replayLegacyAttempts(attempts);
  const competencyStates = storedVersion === 4
    ? normalizeCompetencyStates(stored.competencyStates)
    : replayed?.states ?? initial.competencyStates;
  const attemptsV4 = storedVersion === 4 && Array.isArray(stored.attemptsV4)
    ? stored.attemptsV4.filter((attempt) => attempt && typeof attempt === 'object' && Array.isArray(attempt.evidence) && Array.isArray(attempt.behaviorObservations))
    : replayed?.attempts ?? [];
  const discoveredSkillIds = Array.isArray(stored.discoveredSkillIds)
    ? [...new Set(stored.discoveredSkillIds.filter((id): id is string => typeof id === 'string' && Boolean(nextSkills[id])))]
    : initial.discoveredSkillIds;
  const codexIds = new Set(skills.map((skill) => skill.codexEntryId));
  const discoveredCodexEntryIds = Array.isArray(stored.discoveredCodexEntryIds)
    ? [...new Set(stored.discoveredCodexEntryIds.filter((id): id is string => typeof id === 'string' && codexIds.has(id)))]
    : initial.discoveredCodexEntryIds;
  const rawStreak = stored.streak && typeof stored.streak === 'object' ? stored.streak : initial.streak;
  const streak = {
    current: typeof rawStreak.current === 'number' && Number.isFinite(rawStreak.current) ? Math.max(0, Math.floor(rawStreak.current)) : 0,
    best: typeof rawStreak.best === 'number' && Number.isFinite(rawStreak.best) ? Math.max(0, Math.floor(rawStreak.best)) : 0,
    ...(typeof rawStreak.lastActivityDate === 'string' ? { lastActivityDate: rawStreak.lastActivityDate } : {}),
  };
  streak.best = Math.max(streak.best, streak.current);
  const quests = Object.fromEntries(gameQuests.map((definition) => {
    const raw = stored.quests?.[definition.id];
    const value = raw && typeof raw.value === 'number' && Number.isFinite(raw.value)
      ? Math.max(0, Math.min(definition.target, Math.floor(raw.value)))
      : 0;
    const completed = Boolean(raw?.completed) || value >= definition.target;
    return [definition.id, {
      questId: definition.id,
      value: completed ? definition.target : value,
      target: definition.target,
      completed,
      ...(completed && typeof raw?.rewardedAt === 'string' ? { rewardedAt: raw.rewardedAt } : {}),
    }];
  }));
  const reviewSchedule: Record<string, ReviewSchedule> = {};
  if (stored.reviewSchedule && typeof stored.reviewSchedule === 'object' && !Array.isArray(stored.reviewSchedule)) {
    for (const [conceptId, raw] of Object.entries(stored.reviewSchedule)) {
      if (!nextSkills[conceptId] || !raw || typeof raw !== 'object') continue;
      if (typeof raw.lastSeen !== 'string' || typeof raw.nextReview !== 'string') continue;
      if (!Number.isFinite(Date.parse(raw.lastSeen)) || !Number.isFinite(Date.parse(raw.nextReview))) continue;
      reviewSchedule[conceptId] = {
        conceptId,
        consecutiveCorrect: typeof raw.consecutiveCorrect === 'number' && Number.isFinite(raw.consecutiveCorrect) ? Math.max(0, Math.floor(raw.consecutiveCorrect)) : 0,
        recentErrors: typeof raw.recentErrors === 'number' && Number.isFinite(raw.recentErrors) ? Math.max(0, Math.floor(raw.recentErrors)) : 0,
        intervalDays: typeof raw.intervalDays === 'number' && Number.isFinite(raw.intervalDays) ? Math.max(1, Math.floor(raw.intervalDays)) : 1,
        lastSeen: raw.lastSeen,
        nextReview: raw.nextReview,
      };
    }
  }
  return {
    ...initial,
    ...stored,
    version: 4,
    skills: nextSkills,
    attempts,
    completedEncounterIds,
    discoveredSkillIds,
    discoveredCodexEntryIds,
    errorTagCounts: stored.errorTagCounts ?? {},
    hintsUsed: typeof stored.hintsUsed === 'number' && Number.isFinite(stored.hintsUsed) ? Math.max(0, Math.floor(stored.hintsUsed)) : 0,
    lastPosition: typeof stored.lastPosition === 'string' && stored.lastPosition.startsWith('/') ? stored.lastPosition : '/map',
    recommendedMicroquestIds: Array.isArray(stored.recommendedMicroquestIds) ? [...new Set(stored.recommendedMicroquestIds.filter((id): id is string => typeof id === 'string'))] : [],
    completedMicroquestIds: Array.isArray(stored.completedMicroquestIds) ? [...new Set(stored.completedMicroquestIds.filter((id): id is string => typeof id === 'string'))] : [],
    xp: normalizedXp,
    level: Math.floor(normalizedXp / 100) + 1,
    missionProgress,
    streak,
    quests,
    achievements: Array.isArray(stored.achievements)
      ? stored.achievements.filter((entry) => entry && typeof entry.achievementId === 'string' && typeof entry.unlockedAt === 'string')
      : [],
    reviewSchedule,
    analyticsEvents: Array.isArray(stored.analyticsEvents) ? stored.analyticsEvents.slice(-MAX_ANALYTICS_EVENTS) : [],
    competencyStates,
    attemptsV4,
    recentBehaviorObservations: storedVersion === 4 && Array.isArray(stored.recentBehaviorObservations)
      ? trimBehaviorObservations(stored.recentBehaviorObservations)
      : trimBehaviorObservations(attemptsV4.flatMap((attempt) => attempt.behaviorObservations)),
    adaptiveState: storedVersion === 4
      ? { ...initial.adaptiveState, ...(stored.adaptiveState ?? {}) }
      : initial.adaptiveState,
    ...(stored.lastMissionReward ? { lastMissionReward: stored.lastMissionReward } : {}),
  };
}

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return createInitialProgress();
  const current = readStorage(STORAGE_KEY);
  if (current) {
    try {
      return migrateProgress(JSON.parse(current));
    } catch {
      // A origem V3 permanece intacta e pode recuperar uma gravação V4 inválida.
    }
  }
  for (const key of LEGACY_STORAGE_KEYS) {
    const legacy = readStorage(key);
    if (!legacy) continue;
    try {
      const migrated = migrateProgress(JSON.parse(legacy));
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      } catch {
        // A migração continua válida em memória quando o storage não aceita escrita.
      }
      return migrated;
    } catch {
      // Tenta a próxima versão legada sem remover nenhuma chave.
    }
  }
  return createInitialProgress();
}

interface ProgressContextValue {
  progress: UserProgress;
  recordAttempt: (
    encounterId: string,
    stepId: string,
    selectedIds: string[],
    correct: boolean,
    diagnosticTags?: DiagnosticTag[],
    metadata?: AttemptMetadata,
  ) => void;
  completeEncounter: (encounterId: string, skillIds: string[], codexEntryIds: string[], position?: string) => void;
  completeMicroquest: (microquestId: string) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(loadProgress);

  const commit = (update: UserProgress | ((current: UserProgress) => UserProgress)) => {
    setProgress((current) => {
      const next = typeof update === 'function' ? update(current) : update;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // O estado em memória continua funcional mesmo se o navegador bloquear ou lotar o storage.
      }
      return next;
    });
  };

  const value = useMemo<ProgressContextValue>(() => ({
    progress,
    recordAttempt(encounterId, stepId, selectedIds, correct, diagnosticTags = [], metadata = {}) {
      const skillIds = metadata.skillIds ?? [];
      const masteryDimensions = metadata.masteryDimensions ?? [];
      const hintsUsed = metadata.hintsUsed ?? 0;
      const now = new Date();
      const attempt: Attempt = {
        encounterId,
        stepId,
        selectedIds,
        correct,
        diagnosticTags: correct ? [] : diagnosticTags,
        skillIds,
        masteryDimensions,
        hintsUsed,
        attemptedAt: now.toISOString(),
      };
      commit((current) => {
        const adaptiveAttempt = buildAdaptiveAttempt({
          id: `${now.getTime()}-${encounterId}-${stepId}-${Math.random().toString(36).slice(2, 8)}`,
          encounterId,
          stepId,
          response: selectedIds,
          correct,
          masteryDimensions,
          hintsUsed,
          hintTier: metadata.hintTier,
          selfConfidence: metadata.selfConfidence,
          durationMs: metadata.durationMs,
          assessmentOverrides: metadata.assessment,
          attemptedAt: now.toISOString(),
        }, current.attemptsV4);
        const competencyStates = applyEvidenceToStates(
          current.competencyStates,
          adaptiveAttempt.evidence,
          current.attemptsV4,
        );
        const errorTagCounts = { ...current.errorTagCounts };
        if (!correct) for (const tag of diagnosticTags) errorTagCounts[tag] = (errorTagCounts[tag] ?? 0) + 1;
        const recommendations = new Set(current.recommendedMicroquestIds);
        for (const [tag, count] of Object.entries(errorTagCounts) as [DiagnosticTag, number][]) {
          const microquestId = microquestForTag(tag);
          if (count >= 2 && microquestId && !current.completedMicroquestIds.includes(microquestId)) recommendations.add(microquestId);
        }
        const nextSkills = { ...current.skills };
        for (const skillId of skillIds) {
          const profile = nextSkills[skillId];
          if (!profile) continue;
          const dimensions = profile.dimensions.map((dimension) => {
            if (!masteryDimensions.includes(dimension.dimension)) return dimension;
            const autonomyMultiplier = ['reproduction', 'transfer'].includes(dimension.dimension)
              ? Math.max(.45, 1 - hintsUsed * .2)
              : 1;
            const target = correct ? 100 * autonomyMultiplier : 0;
            const score = Math.max(0, Math.min(100, dimension.score + .25 * (target - dimension.score)));
            return {
              ...dimension,
              score,
              attempts: dimension.attempts + 1,
            };
          });
          const mastery = dimensions.reduce((sum, dimension) => sum + dimension.score, 0) / Math.max(1, dimensions.length);
          nextSkills[skillId] = {
            ...profile,
            state: mastery >= 80 ? 'mastered' : 'practicing',
            mastery,
            dimensions,
            correctAttempts: profile.correctAttempts + (correct ? 1 : 0),
            totalAttempts: profile.totalAttempts + 1,
            lastPracticedAt: now.toISOString(),
          };
        }
        const newlyAvailable = skills.filter(
          (skill) => skill.prerequisites.length > 0 && skill.prerequisites.every((id) => nextSkills[id]?.state === 'mastered'),
        );
        for (const skill of newlyAvailable) {
          const profile = nextSkills[skill.id];
          if (profile?.state === 'locked') nextSkills[skill.id] = { ...profile, state: 'available' };
        }
        const reviewSchedule = updateReviewSchedule(current.reviewSchedule, skillIds, correct, now);
        const events = [
          analyticsEvent('lesson_step_answered', now, { missionId: encounterId, stepId, conceptIds: skillIds, correct }),
          ...(hintsUsed > 0 ? [analyticsEvent('hint_used', now, { missionId: encounterId, stepId, value: hintsUsed })] : []),
        ];
        return {
          ...current,
          skills: nextSkills,
          attempts: [...current.attempts, attempt],
          errorTagCounts,
          hintsUsed: current.hintsUsed + hintsUsed,
          lastPosition: metadata.position ?? `/encounter/${encounterId}`,
          recommendedMicroquestIds: [...recommendations],
          discoveredSkillIds: [...new Set([...current.discoveredSkillIds, ...skillIds, ...newlyAvailable.map((skill) => skill.id)])],
          reviewSchedule,
          analyticsEvents: appendEvents(current, events),
          competencyStates,
          attemptsV4: [...current.attemptsV4, adaptiveAttempt],
          recentBehaviorObservations: trimBehaviorObservations([
            ...current.recentBehaviorObservations,
            ...adaptiveAttempt.behaviorObservations,
          ], now),
          adaptiveState: {
            ...current.adaptiveState,
            lastTargetIds: [...new Set(adaptiveAttempt.evidence.map((item) => item.competencyId))],
          },
        };
      });
    },
    completeEncounter(encounterId, skillIds, codexEntryIds, position) {
      commit((current) => applyMissionCompletion(current, encounterId, skillIds, codexEntryIds, new Date(), position));
    },
    completeMicroquest(microquestId) {
      commit((current) => {
        const completed = applyMissionCompletion(current, `microquest:${microquestId}`, [], []);
        return {
          ...completed,
          recommendedMicroquestIds: completed.recommendedMicroquestIds.filter((id) => id !== microquestId),
          completedMicroquestIds: [...new Set([...completed.completedMicroquestIds, microquestId])],
          lastPosition: `/microquest/${microquestId}`,
        };
      });
    },
    resetProgress() {
      commit(createInitialProgress());
    },
  }), [progress]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be used inside ProgressProvider');
  return value;
}
