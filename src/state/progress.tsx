import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { skills } from '../data/bootstrap';
import type { Attempt, DiagnosticTag, UserProgress } from '../types/domain';

const STORAGE_KEY = 'geometria-rpg:progress:v1';

function createInitialProgress(): UserProgress {
  const discoveredSkillIds = skills
    .filter((skill) => skill.prerequisites.length === 0)
    .map((skill) => skill.id);
  return {
    version: 1,
    skills: Object.fromEntries(
      skills.map((skill) => [
        skill.id,
        {
          skillId: skill.id,
          state: skill.prerequisites.length === 0 ? 'available' : 'locked',
          mastery: 0,
          dimensions: skill.masteryDimensions.map((dimension) => ({
            dimension,
            score: 0,
            attempts: 0,
          })),
          correctAttempts: 0,
          totalAttempts: 0,
        },
      ]),
    ),
    attempts: [],
    completedEncounterIds: [],
    discoveredSkillIds,
    discoveredCodexEntryIds: skills
      .filter((skill) => skill.prerequisites.length === 0)
      .map((skill) => skill.codexEntryId),
  };
}

function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return createInitialProgress();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return createInitialProgress();
    const parsed = JSON.parse(stored) as Partial<UserProgress>;
    if (!parsed.skills || !parsed.discoveredSkillIds) return createInitialProgress();
    return parsed as UserProgress;
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
  ) => void;
  completeEncounter: (encounterId: string, skillIds: string[], codexEntryIds: string[]) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(loadProgress);

  const commit = (next: UserProgress) => {
    setProgress(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      recordAttempt(encounterId, stepId, selectedIds, correct, diagnosticTags = []) {
        const attempt: Attempt = {
          encounterId,
          stepId,
          selectedIds,
          correct,
          diagnosticTags,
          attemptedAt: new Date().toISOString(),
        };
        commit({ ...progress, attempts: [...progress.attempts, attempt] });
      },
      completeEncounter(encounterId, skillIds, codexEntryIds) {
        const nextSkills = { ...progress.skills };
        for (const skillId of skillIds) {
          const profile = nextSkills[skillId];
          if (!profile) continue;
          nextSkills[skillId] = {
            ...profile,
            state: 'mastered' as const,
            mastery: 1,
            dimensions: profile.dimensions.map((dimension) => ({ ...dimension, score: 1 })),
            lastPracticedAt: new Date().toISOString(),
          };
        }
        const newlyAvailable = skills.filter(
          (skill) =>
            skill.prerequisites.some((id) => skillIds.includes(id)) &&
            skill.prerequisites.every((id) => nextSkills[id]?.state === 'mastered'),
        );
        for (const nextSkill of newlyAvailable) {
          const nextProfile = nextSkills[nextSkill.id];
          if (nextProfile) nextSkills[nextSkill.id] = { ...nextProfile, state: 'available' };
        }
        commit({
          ...progress,
          skills: nextSkills,
          completedEncounterIds: [...new Set([...progress.completedEncounterIds, encounterId])],
          discoveredSkillIds: [
            ...new Set([
              ...progress.discoveredSkillIds,
              ...skillIds,
              ...newlyAvailable.map((skill) => skill.id),
            ]),
          ],
          discoveredCodexEntryIds: [
            ...new Set([...progress.discoveredCodexEntryIds, ...codexEntryIds]),
          ],
        });
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
