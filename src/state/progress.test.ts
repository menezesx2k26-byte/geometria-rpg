import { describe, expect, it } from 'vitest';
import { getCampaignNodeState, getDueAdaptiveReview } from '../data/gameCampaign';
import { applyMissionCompletion, createInitialProgress, migrateProgress } from './progress';

describe('game progress V3', () => {
  it('migrates V2 progress without losing attempts or completed encounters', () => {
    const legacy = {
      ...createInitialProgress(),
      version: 2,
      xp: undefined,
      level: undefined,
      missionProgress: undefined,
      completedEncounterIds: ['ordered-correspondence'],
      attempts: [{
        encounterId: 'ordered-correspondence',
        stepId: 'order-correspondence',
        selectedIds: ['vertex-a', 'vertex-d'],
        correct: true,
        diagnosticTags: [],
        skillIds: ['triangle-congruence'],
        masteryDimensions: ['recognition'],
        hintsUsed: 0,
        attemptedAt: '2026-08-15T12:00:00.000Z',
      }],
    };

    const migrated = migrateProgress(legacy);

    expect(migrated.version).toBe(3);
    expect(migrated.attempts).toHaveLength(1);
    expect(migrated.completedEncounterIds).toContain('ordered-correspondence');
    expect(migrated.missionProgress['mission-vertex-order']?.bestStars).toBe(1);
    expect(migrated.xp).toBe(25);
  });

  it('awards stars, XP, a quest and achievements on a perfect first mission', () => {
    const now = new Date('2026-08-16T12:00:00.000Z');
    const completed = applyMissionCompletion(
      createInitialProgress(),
      'ordered-correspondence',
      ['triangle-congruence'],
      ['codex-triangle-congruence'],
      now,
    );

    expect(completed.xp).toBe(40);
    expect(completed.level).toBe(1);
    expect(completed.missionProgress['mission-vertex-order']?.bestStars).toBe(3);
    expect(completed.quests['quest-perfect-mission']?.completed).toBe(true);
    expect(completed.achievements.map((entry) => entry.achievementId)).toEqual(
      expect.arrayContaining(['first-mission', 'first-perfect']),
    );
    expect(completed.streak.current).toBe(1);
  });

  it('advances the streak and unlocks the next mission after two meaningful completions', () => {
    const first = applyMissionCompletion(
      createInitialProgress(),
      'ordered-correspondence',
      [],
      [],
      new Date('2026-08-16T12:00:00.000Z'),
    );
    const second = applyMissionCompletion(
      first,
      'crossroads-opv',
      [],
      [],
      new Date('2026-08-17T12:00:00.000Z'),
    );
    const thirdNode = {
      id: 'mission-mirror-review', chapterId: 'chapter-congruence', order: 3,
      title: '', subtitle: '', narrativeLabel: '', type: 'review' as const,
      route: '', completionId: 'microquest:correspondence-pairs', prerequisites: ['mission-opv-sas'], concepts: [], reward: { xp: 15 },
    };

    expect(second.streak.current).toBe(2);
    expect(second.quests['quest-two-missions']?.completed).toBe(true);
    expect(second.lastMissionReward?.bonusXp).toBe(20);
    expect(getCampaignNodeState(second, thirdNode)).toBe('current');
  });

  it('surfaces a due review from learning history without changing campaign order', () => {
    const progress = createInitialProgress();
    progress.reviewSchedule['triangle-congruence'] = {
      conceptId: 'triangle-congruence', consecutiveCorrect: 2, recentErrors: 1, intervalDays: 2,
      lastSeen: '2026-08-10T12:00:00.000Z', nextReview: '2026-08-12T12:00:00.000Z',
    };

    expect(getDueAdaptiveReview(progress, new Date('2026-08-17T12:00:00.000Z'))).toMatchObject({
      route: '/microquest/correspondence-pairs',
      conceptId: 'triangle-congruence',
    });
  });
});
