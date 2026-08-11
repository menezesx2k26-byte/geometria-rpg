"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { UserProgress } from "../types/geometry";
import { skills } from "../content/geometry";

const STORAGE_KEY = "geometria-rpg-progress-v1";

const initialProgress: UserProgress = {
  mastery: {},
  studiedSections: [],
  questions: {},
  proofAttempts: {},
  lastSection: "fundamentals",
  updatedAt: new Date(0).toISOString(),
};

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(initialProgress);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setProgress({ ...initialProgress, ...(JSON.parse(stored) as UserProgress) });
      } catch {
        // A aplicação permanece funcional mesmo se o armazenamento estiver indisponível.
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Não interrompe a sessão de estudo por falha de armazenamento.
    }
  }, [progress, ready]);

  const changeMastery = useCallback((skillId: string, amount: number) => {
    setProgress((current) => ({
      ...current,
      mastery: { ...current.mastery, [skillId]: clamp((current.mastery[skillId] ?? 0) + amount) },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const studySection = useCallback((sectionId: string, skillId: string) => {
    setProgress((current) => {
      const firstContact = !current.studiedSections.includes(sectionId);
      return {
        ...current,
        studiedSections: firstContact ? [...current.studiedSections, sectionId] : current.studiedSections,
        mastery: firstContact
          ? { ...current.mastery, [skillId]: clamp((current.mastery[skillId] ?? 0) + 20) }
          : current.mastery,
        lastSection: sectionId,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const recordQuestion = useCallback((questionId: string, skillId: string, correct: boolean) => {
    setProgress((current) => {
      const record = current.questions[questionId] ?? { attempts: 0, correct: 0 };
      return {
        ...current,
        questions: {
          ...current.questions,
          [questionId]: { attempts: record.attempts + 1, correct: record.correct + (correct ? 1 : 0) },
        },
        mastery: { ...current.mastery, [skillId]: clamp((current.mastery[skillId] ?? 0) + (correct ? 10 : -5)) },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const recordProof = useCallback((proofId: string, skillId: string, correct: boolean, withoutHelp = false) => {
    setProgress((current) => {
      const record = current.proofAttempts[proofId] ?? { attempts: 0, correct: 0 };
      const delta = correct ? (withoutHelp ? 20 : 10) : -5;
      return {
        ...current,
        proofAttempts: {
          ...current.proofAttempts,
          [proofId]: { attempts: record.attempts + 1, correct: record.correct + (correct ? 1 : 0) },
        },
        mastery: { ...current.mastery, [skillId]: clamp((current.mastery[skillId] ?? 0) + delta) },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const overallMastery = useMemo(() => {
    const total = skills.reduce((sum, skill) => sum + (progress.mastery[skill.id] ?? 0), 0);
    return Math.round(total / skills.length);
  }, [progress.mastery]);

  return { progress, ready, overallMastery, changeMastery, studySection, recordQuestion, recordProof };
}
