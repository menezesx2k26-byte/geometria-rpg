import { describe, expect, it } from 'vitest';
import { skills } from './bootstrap';
import { didacticLessons } from './didacticLessons';
import { checksForDidacticLesson } from './didacticPracticeChecks';
import { didacticCoverageReport, validateDidacticSequence } from './didacticValidation';
import { campaignNodes, validateGameCampaign } from './gameCampaign';

describe('didactic campaign sequence', () => {
  it('keeps structural and temporal pedagogy valid', () => {
    expect(validateGameCampaign()).toEqual([]);
    expect(validateDidacticSequence(campaignNodes, skills)).toEqual([]);
  });

  it('gives every lesson route a concrete non-empty lesson', () => {
    const lessonNodes = campaignNodes.filter((node) => node.route.startsWith('/lesson/'));
    const completionIds = new Set(didacticLessons.map((lesson) => lesson.completionId));
    expect(lessonNodes.length).toBeGreaterThan(0);
    for (const node of lessonNodes) expect(completionIds.has(node.completionId)).toBe(true);
    for (const lesson of didacticLessons) {
      expect(lesson.sections.length).toBeGreaterThan(0);
      expect(checksForDidacticLesson(lesson).length).toBeGreaterThan(0);
      expect(lesson.introduces.length).toBeGreaterThan(0);
      expect(lesson.guidedPractice.length).toBeGreaterThan(0);
    }
  });

  it('requires a concrete guided check for every practiced skill', () => {
    for (const lesson of didacticLessons) {
      const checks = checksForDidacticLesson(lesson);
      const covered = new Set(checks.flatMap((check) => check.skillIds));
      for (const skillId of lesson.guidedPractice) {
        expect(covered.has(skillId), `${lesson.id} must concretely practice ${skillId}`).toBe(true);
      }
      for (const check of checks) {
        expect(check.skillIds.length, `${lesson.id}/${check.id} must have skill coverage`).toBeGreaterThan(0);
      }
    }
  });

  it('rejects an assessment moved before its teaching bridge', () => {
    const broken = campaignNodes.map((node) => ({ ...node }));
    const lesson = broken.find((node) => node.id === 'lesson-opv-lal-foundations');
    const assessment = broken.find((node) => node.id === 'mission-opv-sas');
    if (!lesson || !assessment) throw new Error('Fixture didática ausente.');
    const originalLessonOrder = lesson.order;
    lesson.order = assessment.order;
    assessment.order = originalLessonOrder;

    const errors = validateDidacticSequence(broken, skills);
    expect(errors.some((error) => error.includes('mission-opv-sas') && error.includes('antes de prática guiada'))).toBe(true);
  });

  it('makes first contact precede independent assessment for every assessed skill', () => {
    const report = didacticCoverageReport(campaignNodes);
    const firstPractice = new Map<string, number>();
    for (const row of report) {
      for (const skillId of [...row.introduces, ...row.practices]) {
        if (!firstPractice.has(skillId)) firstPractice.set(skillId, row.order);
      }
      for (const skillId of row.assesses) {
        expect(firstPractice.get(skillId)).toBeLessThan(row.order);
      }
    }
  });
});
