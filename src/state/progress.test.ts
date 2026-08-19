import { describe, expect, it } from 'vitest';
import { campaignNodes, getCampaignNodeState, getDueAdaptiveReview } from '../data/gameCampaign';
import { applyMissionCompletion, createInitialProgress, migrateProgress } from './progress';

describe('game progress V4', () => {
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

    expect(migrated.version).toBe(4);
    expect(migrated.attempts).toHaveLength(1);
    expect(migrated.attemptsV4).toHaveLength(1);
    expect(migrated.attemptsV4[0]?.assessment.justification).toBeNull();
    expect(migrated.attemptsV4[0]?.assessment.verification).toBeNull();
    expect(migrated.competencyStates.H5.evidenceCount).toBe(1);
    expect(migrated.completedEncounterIds).toContain('ordered-correspondence');
    expect(migrated.missionProgress['mission-vertex-order']?.bestStars).toBe(1);
    expect(migrated.xp).toBe(25);
  });

  it('awards stars, XP, a quest and achievements on a perfect first mission', () => {
    const now = new Date('2026-08-16T12:00:00.000Z');
    const progress = createInitialProgress();
    progress.attempts.push({
      encounterId: 'ordered-correspondence',
      stepId: 'order-correspondence',
      selectedIds: ['vertex-a', 'vertex-d', 'vertex-b', 'vertex-e', 'vertex-c', 'vertex-f'],
      correct: true,
      diagnosticTags: [],
      skillIds: ['triangle-congruence'],
      masteryDimensions: ['recognition'],
      hintsUsed: 0,
      attemptedAt: '2026-08-16T11:59:00.000Z',
    });
    const completed = applyMissionCompletion(
      progress,
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

  it('does not invent a perfect score when a legacy completion has no attempts', () => {
    const completed = applyMissionCompletion(
      createInitialProgress(),
      'ordered-correspondence',
      [],
      [],
      new Date('2026-08-16T12:00:00.000Z'),
    );

    expect(completed.missionProgress['mission-vertex-order']?.bestStars).toBe(1);
    expect(completed.quests['quest-perfect-mission']?.completed).toBe(false);
  });

  it('normalizes inconsistent XP/level and merges inferred mission history', () => {
    const migrated = migrateProgress({
      ...createInitialProgress(),
      version: 3,
      xp: 245.4,
      level: 99,
      missionProgress: {},
      completedEncounterIds: ['ordered-correspondence'],
    });

    expect(migrated.xp).toBe(245);
    expect(migrated.level).toBe(3);
    expect(migrated.missionProgress['mission-vertex-order']?.completions).toBe(1);
  });

  it('repairs malformed persisted fields instead of discarding valid progress', () => {
    const migrated = migrateProgress({
      version: 4,
      xp: Number.POSITIVE_INFINITY,
      level: -10,
      attempts: { corrupted: true },
      completedEncounterIds: ['ordered-correspondence', 'ordered-correspondence', 42],
      discoveredSkillIds: ['triangle-congruence', 'ghost-skill'],
      discoveredCodexEntryIds: ['codex-triangle-congruence', 'ghost-codex'],
      streak: { current: -4, best: 2 },
      missionProgress: {
        'mission-vertex-order': { missionId: 'wrong', bestStars: 99, completions: 2 },
        ghost: { missionId: 'ghost', bestStars: 3, completions: 1 },
      },
      quests: {
        'quest-two-missions': { questId: 'wrong', value: 999, target: 999, completed: false },
      },
      reviewSchedule: {
        'triangle-congruence': {
          conceptId: 'wrong', consecutiveCorrect: 2, recentErrors: 1, intervalDays: 2,
          lastSeen: '2026-08-10T12:00:00.000Z', nextReview: '2026-08-12T12:00:00.000Z',
        },
        ghost: { conceptId: 'ghost', consecutiveCorrect: 1, recentErrors: 0, intervalDays: 1, lastSeen: 'x', nextReview: 'y' },
      },
    });

    expect(migrated.xp).toBe(25);
    expect(migrated.level).toBe(1);
    expect(migrated.attempts).toEqual([]);
    expect(migrated.completedEncounterIds).toEqual(['ordered-correspondence']);
    expect(migrated.discoveredSkillIds).toEqual(['triangle-congruence']);
    expect(migrated.discoveredCodexEntryIds).toEqual(['codex-triangle-congruence']);
    expect(migrated.streak).toMatchObject({ current: 0, best: 2 });
    expect(migrated.missionProgress['mission-vertex-order']).toMatchObject({ missionId: 'mission-vertex-order', bestStars: 3, completions: 2 });
    expect(migrated.missionProgress.ghost).toBeUndefined();
    expect(migrated.quests['quest-two-missions']).toMatchObject({ value: 2, target: 2, completed: true });
    expect(migrated.reviewSchedule['triangle-congruence']?.conceptId).toBe('triangle-congruence');
    expect(migrated.reviewSchedule.ghost).toBeUndefined();
  });

  it('advances the streak and unlocks the next mission after two meaningful completions', () => {
    const first = applyMissionCompletion(
      createInitialProgress(),
      'lesson:congruence-foundations',
      ['triangle-congruence'],
      ['codex-triangle-congruence'],
      new Date('2026-08-16T12:00:00.000Z'),
    );
    const second = applyMissionCompletion(
      first,
      'ordered-correspondence',
      ['triangle-congruence'],
      ['codex-triangle-congruence'],
      new Date('2026-08-17T12:00:00.000Z'),
    );
    const thirdNode = campaignNodes.find((node) => node.id === 'lesson-opv-lal-foundations');
    if (!thirdNode) throw new Error('Ponte didática esperada ausente.');

    expect(second.streak.current).toBe(2);
    expect(second.quests['quest-two-missions']?.completed).toBe(true);
    expect(second.lastMissionReward?.bonusXp).toBe(20);
    expect(getCampaignNodeState(second, thirdNode)).toBe('current');
  });

  it('keeps a valid route after completing a focused adaptive activity outside the main campaign', () => {
    const completed = applyMissionCompletion(
      createInitialProgress(),
      'adaptive:parallelism-bridge:parallelogram-boss',
      ['parallelogram-characterization'],
      [],
      new Date('2026-08-17T12:00:00.000Z'),
      '/lab/parallelism?focus=parallelogram-boss',
    );

    expect(completed.lastPosition).toBe('/lab/parallelism?focus=parallelogram-boss');
    expect(completed.completedEncounterIds).toContain('adaptive:parallelism-bridge:parallelogram-boss');
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
