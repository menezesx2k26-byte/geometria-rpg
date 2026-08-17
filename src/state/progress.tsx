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

export const STORAGE_KEY = 'geometria-rpg:progress:v3';
const LEGACY_STORAGE_KEYS = ['geometria-rpg:progress:v2', 'geometria-rpg:progress:v1'];
const MAX_ANALYTICS_EVENTS = 250;

interface AttemptMetadata {
  skillIds?: string[];
  masteryDimensions?: MasteryDimension[];
  hintsUsed?: number;
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
    version: 3,
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
  };
}

function scoreTo100(value: unknown) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value <= 1 ? value * 100 : value));
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function yesterdayKey(date: Date) {
  const previous = new Date(date);
  previous.setUTCDate(previous.getUTCDate() - 1);
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
  const attempts = progress.attempts.filter((attempt) =>
    attempt.encounterId === completionId
    && new Date(attempt.attemptedAt).getTime() >= lastPlayedAt,
  );
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
      lastPosition: completionId.startsWith('proof:') ? `/proof/${completionId.slice(6)}` : `/encounter/${completionId}`,
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
    completedMissionCount >= 5 ? 'five-missions' : undefined,
  ].filter(Boolean) as string[];
  const streak = firstCompletion ? updateStreak(progress, now) : progress.streak;
  if (streak.current >= 7) achievementsToCheck.push('seven-day-streak');
  for (const achievementId of achievementsToCheck) {
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
  const attempts = (stored.attempts ?? []).map((attempt) => ({
    ...attempt,
    skillIds: attempt.skillIds ?? [],
    masteryDimensions: attempt.masteryDimensions ?? [],
    hintsUsed: attempt.hintsUsed ?? 0,
  }));
  const completedEncounterIds = stored.completedEncounterIds ?? [];
  const missionProgress = stored.missionProgress ?? Object.fromEntries(
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
  const inferredXp = Object.keys(missionProgress).reduce((total, id) => {
    const node = campaignNodes.find((candidate) => candidate.id === id);
    return total + (node?.reward.xp ?? 0);
  }, 0);
  return {
    ...initial,
    ...stored,
    version: 3,
    skills: nextSkills,
    attempts,
    completedEncounterIds,
    discoveredSkillIds: stored.discoveredSkillIds ?? initial.discoveredSkillIds,
    discoveredCodexEntryIds: stored.discoveredCodexEntryIds ?? initial.discoveredCodexEntryIds,
    errorTagCounts: stored.errorTagCounts ?? {},
    hintsUsed: stored.hintsUsed ?? 0,
    lastPosition: stored.lastPosition ?? '/map',
    recommendedMicroquestIds: stored.recommendedMicroquestIds ?? [],
    completedMicroquestIds: stored.completedMicroquestIds ?? [],
    xp: stored.xp ?? inferredXp,
    level: stored.level ?? Math.floor((stored.xp ?? inferredXp) / 100) + 1,
    missionProgress,
    streak: stored.streak ?? initial.streak,
    quests: { ...initial.quests, ...(stored.quests ?? {}) },
    achievements: stored.achievements ?? [],
    reviewSchedule: stored.reviewSchedule ?? {},
    analyticsEvents: stored.analyticsEvents ?? [],
    ...(stored.lastMissionReward ? { lastMissionReward: stored.lastMissionReward } : {}),
  };
}

function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return createInitialProgress();
  try {
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current) return migrateProgress(JSON.parse(current));
    for (const key of LEGACY_STORAGE_KEYS) {
      const legacy = window.localStorage.getItem(key);
      if (legacy) return migrateProgress(JSON.parse(legacy));
    }
    return createInitialProgress();
  } catch {
    return createInitialProgress();
  }
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
  completeEncounter: (encounterId: string, skillIds: string[], codexEntryIds: string[]) => void;
  completeMicroquest: (microquestId: string) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(loadProgress);

  const commit = (update: UserProgress | ((current: UserProgress) => UserProgress)) => {
    setProgress((current) => {
      const next = typeof update === 'function' ? update(current) : update;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
            return {
              ...dimension,
              score: correct ? Math.min(100, dimension.score + 16 * autonomyMultiplier) : dimension.score,
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
        };
      });
    },
    completeEncounter(encounterId, skillIds, codexEntryIds) {
      commit((current) => applyMissionCompletion(current, encounterId, skillIds, codexEntryIds));
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
