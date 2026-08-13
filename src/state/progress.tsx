import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { skills } from '../data/bootstrap';
import { microquestForTag } from '../data/microquests';
import type {
  Attempt,
  DiagnosticTag,
  MasteryDimension,
  MasteryProfile,
  UserProgress,
} from '../types/domain';

const STORAGE_KEY = 'geometria-rpg:progress:v2';

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

function createInitialProgress(): UserProgress {
  const roots = skills.filter((skill) => skill.prerequisites.length === 0);
  return {
    version: 2,
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
  };
}

function scoreTo100(value: unknown) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value <= 1 ? value * 100 : value));
}

function migrateProgress(value: unknown): UserProgress {
  const initial = createInitialProgress();
  if (!value || typeof value !== 'object') return initial;
  const stored = value as Partial<UserProgress>;
  const storedSkills = stored.skills ?? {};
  const nextSkills = Object.fromEntries(
    skills.map((skill) => {
      const fallback = initial.skills[skill.id] ?? createProfile(
        skill.id,
        skill.masteryDimensions,
        skill.prerequisites.length === 0,
      );
      const existing = storedSkills[skill.id];
      if (!existing) return [skill.id, fallback];
      const dimensions = skill.masteryDimensions.map((dimension) => {
        const previous = existing.dimensions?.find((item) => item.dimension === dimension);
        return {
          dimension,
          score: scoreTo100(previous?.score),
          attempts: previous?.attempts ?? 0,
        };
      });
      return [skill.id, {
        ...fallback,
        ...existing,
        mastery: scoreTo100(existing.mastery),
        dimensions,
      }];
    }),
  );

  const attempts = (stored.attempts ?? []).map((attempt) => ({
    ...attempt,
    skillIds: attempt.skillIds ?? [],
    masteryDimensions: attempt.masteryDimensions ?? [],
    hintsUsed: attempt.hintsUsed ?? 0,
  }));

  return {
    ...initial,
    ...stored,
    version: 2,
    skills: nextSkills,
    attempts,
    discoveredSkillIds: stored.discoveredSkillIds ?? initial.discoveredSkillIds,
    discoveredCodexEntryIds: stored.discoveredCodexEntryIds ?? initial.discoveredCodexEntryIds,
    errorTagCounts: stored.errorTagCounts ?? {},
    hintsUsed: stored.hintsUsed ?? 0,
    lastPosition: stored.lastPosition ?? '/map',
    recommendedMicroquestIds: stored.recommendedMicroquestIds ?? [],
    completedMicroquestIds: stored.completedMicroquestIds ?? [],
  };
}

function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return createInitialProgress();
  try {
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current) return migrateProgress(JSON.parse(current));
    const legacy = window.localStorage.getItem('geometria-rpg:progress:v1');
    return legacy ? migrateProgress(JSON.parse(legacy)) : createInitialProgress();
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

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      recordAttempt(encounterId, stepId, selectedIds, correct, diagnosticTags = [], metadata = {}) {
        const skillIds = metadata.skillIds ?? [];
        const masteryDimensions = metadata.masteryDimensions ?? [];
        const hintsUsed = metadata.hintsUsed ?? 0;
        const attempt: Attempt = {
          encounterId,
          stepId,
          selectedIds,
          correct,
          diagnosticTags: correct ? [] : diagnosticTags,
          skillIds,
          masteryDimensions,
          hintsUsed,
          attemptedAt: new Date().toISOString(),
        };

        commit((current) => {
          const errorTagCounts = { ...current.errorTagCounts };
          if (!correct) {
            for (const tag of diagnosticTags) errorTagCounts[tag] = (errorTagCounts[tag] ?? 0) + 1;
          }
          const recommendations = new Set(current.recommendedMicroquestIds);
          for (const [tag, count] of Object.entries(errorTagCounts) as [DiagnosticTag, number][]) {
            const microquestId = microquestForTag(tag);
            if (count >= 2 && microquestId && !current.completedMicroquestIds.includes(microquestId)) {
              recommendations.add(microquestId);
            }
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
            const mastery = dimensions.reduce((sum, dimension) => sum + dimension.score, 0) / dimensions.length;
            nextSkills[skillId] = {
              ...profile,
              state: mastery >= 80 ? 'mastered' : 'practicing',
              mastery,
              dimensions,
              correctAttempts: profile.correctAttempts + (correct ? 1 : 0),
              totalAttempts: profile.totalAttempts + 1,
              lastPracticedAt: new Date().toISOString(),
            };
          }

          const newlyAvailable = skills.filter(
            (skill) => skill.prerequisites.length > 0 && skill.prerequisites.every((id) => nextSkills[id]?.state === 'mastered'),
          );
          for (const skill of newlyAvailable) {
            const profile = nextSkills[skill.id];
            if (profile?.state === 'locked') nextSkills[skill.id] = { ...profile, state: 'available' };
          }

          return {
            ...current,
            skills: nextSkills,
            attempts: [...current.attempts, attempt],
            errorTagCounts,
            hintsUsed: current.hintsUsed + hintsUsed,
            lastPosition: metadata.position ?? `/encounter/${encounterId}`,
            recommendedMicroquestIds: [...recommendations],
            discoveredSkillIds: [...new Set([...current.discoveredSkillIds, ...skillIds, ...newlyAvailable.map((skill) => skill.id)])],
          };
        });
      },
      completeEncounter(encounterId, skillIds, codexEntryIds) {
        commit((current) => {
          const nextSkills = { ...current.skills };
          for (const skillId of skillIds) {
            const profile = nextSkills[skillId];
            if (!profile) continue;
            nextSkills[skillId] = { ...profile, state: profile.mastery >= 80 ? 'mastered' : 'practicing' };
          }
          return {
            ...current,
            skills: nextSkills,
            completedEncounterIds: [...new Set([...current.completedEncounterIds, encounterId])],
            discoveredSkillIds: [...new Set([...current.discoveredSkillIds, ...skillIds])],
            discoveredCodexEntryIds: [...new Set([...current.discoveredCodexEntryIds, ...codexEntryIds])],
            lastPosition: encounterId.startsWith('proof:') ? `/proof/${encounterId.slice(6)}` : `/encounter/${encounterId}`,
          };
        });
      },
      completeMicroquest(microquestId) {
        commit((current) => ({
          ...current,
          recommendedMicroquestIds: current.recommendedMicroquestIds.filter((id) => id !== microquestId),
          completedMicroquestIds: [...new Set([...current.completedMicroquestIds, microquestId])],
          lastPosition: `/microquest/${microquestId}`,
        }));
      },
      resetProgress() {
        commit(createInitialProgress());
      },
    }),
    [progress],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be used inside ProgressProvider');
  return value;
}
