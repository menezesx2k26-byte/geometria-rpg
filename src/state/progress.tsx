import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { skills } from '../data/bootstrap';
import type { Attempt, DiagnosticTag, UserProgress } from '../types/domain';

const STORAGE_KEY = 'geometria-rpg:progress:v1';

function createInitialProgress(): UserProgress {
  return {
    version: 1,
    skills: Object.fromEntries(
      skills.map((skill, index) => [
        skill.id,
        {
          skillId: skill.id,
          state: index === 0 ? 'available' : 'locked',
          mastery: 0,
          correctAttempts: 0,
          totalAttempts: 0,
        },
      ]),
    ),
    attempts: [],
    completedEncounterIds: [],
    discoveredCodexEntryIds: ['codex-opv'],
  };
}

function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return createInitialProgress();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as UserProgress) : createInitialProgress();
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
  completeEncounter: (encounterId: string, skillId: string, codexEntryId: string) => void;
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
      completeEncounter(encounterId, skillId, codexEntryId) {
        const profile = progress.skills[skillId];
        if (!profile) return;
        const nextSkills = {
          ...progress.skills,
          [skillId]: {
            ...profile,
            state: 'mastered' as const,
            mastery: 1,
            lastPracticedAt: new Date().toISOString(),
          },
        };
        const nextSkill = skills.find((skill) => skill.prerequisites.includes(skillId));
        const nextProfile = nextSkill ? nextSkills[nextSkill.id] : undefined;
        if (nextSkill && nextProfile) {
          nextSkills[nextSkill.id] = { ...nextProfile, state: 'available' };
        }
        commit({
          ...progress,
          skills: nextSkills,
          completedEncounterIds: [...new Set([...progress.completedEncounterIds, encounterId])],
          discoveredCodexEntryIds: [
            ...new Set([...progress.discoveredCodexEntryIds, codexEntryId]),
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
