import type {
  AchievementProgress,
  CampaignChapter,
  CampaignNode,
  CampaignNodeState,
  QuestProgress,
  UserProgress,
} from '../types/domain';

export interface GameQuestDefinition {
  id: string;
  title: string;
  description: string;
  target: number;
  rewardXp: number;
  kind: 'missions' | 'perfect' | 'boss';
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: 'scroll' | 'star' | 'crown' | 'flame' | 'shield';
}

export const campaignChapters: CampaignChapter[] = [
  {
    id: 'chapter-congruence', order: 1, title: 'Ala da Congruência',
    subtitle: 'Correspondências e provas',
    description: 'Leia a ordem dos vértices, aplique critérios e encerre com uma Boss Proof.',
    accent: '#c084fc',
    nodeIds: ['mission-vertex-order', 'mission-opv-sas', 'mission-mirror-review', 'mission-official-q15', 'checkpoint-isosceles', 'boss-cevian'],
  },
  {
    id: 'chapter-parallelism', order: 2, title: 'Passagem das Paralelas',
    subtitle: 'Ângulos, conversas e diagonais',
    description: 'Prove paralelismo e use as diagonais para reconhecer um paralelogramo.',
    accent: '#55c7e8',
    nodeIds: ['mission-parallelism'],
  },
  {
    id: 'chapter-analytic', order: 3, title: 'Forja Analítica',
    subtitle: 'Do plano à prova métrica',
    description: 'Converta figuras em coordenadas, retas, sistemas e distâncias exatas.',
    accent: '#e5b958',
    nodeIds: ['mission-coordinate-map', 'mission-line-forge', 'mission-language-bridge', 'boss-exercise-48'],
  },
];

export const campaignNodes: CampaignNode[] = [
  {
    id: 'mission-vertex-order', chapterId: 'chapter-congruence', order: 1,
    title: 'A Ordem dos Vértices', subtitle: 'Correspondência ordenada', narrativeLabel: 'Primeiro pergaminho', type: 'lesson',
    route: '/mission/ordered-correspondence', completionId: 'ordered-correspondence', prerequisites: [], concepts: ['triangle-congruence'],
    reward: { xp: 25, unlockTitle: 'Correspondência Ordenada' },
  },
  {
    id: 'mission-opv-sas', chapterId: 'chapter-congruence', order: 2,
    title: 'A Encruzilhada', subtitle: 'OPV → LAL → consequência', narrativeLabel: 'Duelo de relações', type: 'practice',
    route: '/encounter/crossroads-opv', completionId: 'crossroads-opv', prerequisites: ['mission-vertex-order'], concepts: ['opv', 'sas', 'cpctc'],
    reward: { xp: 30, unlockTitle: 'Lado–Ângulo–Lado' },
  },
  {
    id: 'mission-mirror-review', chapterId: 'chapter-congruence', order: 3,
    title: 'Sala dos Espelhos', subtitle: 'Recuperação de correspondência', narrativeLabel: 'Encontro de memória', type: 'review',
    route: '/microquest/correspondence-pairs', completionId: 'microquest:correspondence-pairs', prerequisites: ['mission-opv-sas'], concepts: ['triangle-congruence'],
    reward: { xp: 15 },
  },
  {
    id: 'mission-official-q15', chapterId: 'chapter-congruence', order: 4,
    title: 'O Selo da Questão 15', subtitle: 'ALA, álgebra e perímetros', narrativeLabel: 'Aplicação oficial', type: 'application',
    route: '/encounter/official-q15', completionId: 'official-euclid-q15', prerequisites: ['mission-mirror-review'], concepts: ['asa', 'triangle-congruence'],
    reward: { xp: 40, unlockTitle: 'Ângulo–Lado–Ângulo' },
  },
  {
    id: 'checkpoint-isosceles', chapterId: 'chapter-congruence', order: 5,
    title: 'Espelho do Isósceles', subtitle: 'Reconstrua o teorema', narrativeLabel: 'Checkpoint', type: 'checkpoint',
    route: '/proof/isosceles-base-angles?mode=training', completionId: 'proof:isosceles-base-angles', prerequisites: ['mission-official-q15'], concepts: ['isosceles-theorem', 'sas'],
    reward: { xp: 50, unlockTitle: 'Teorema do Isósceles' },
  },
  {
    id: 'boss-cevian', chapterId: 'chapter-congruence', order: 6,
    title: 'Guardião das Cevianas', subtitle: 'Bissetriz ⇒ mediana e altura', narrativeLabel: 'Boss Proof', type: 'boss',
    route: '/proof/isosceles-cevian?mode=training', completionId: 'proof:isosceles-cevian', prerequisites: ['checkpoint-isosceles'], concepts: ['isosceles-special-cevian', 'midpoint', 'perpendicularity'],
    reward: { xp: 75, achievementId: 'first-boss', unlockTitle: 'Título: Guardião das Cevianas' },
  },
  {
    id: 'mission-parallelism', chapterId: 'chapter-parallelism', order: 7,
    title: 'Ponte das Paralelas', subtitle: 'Famílias, conversas e paralelogramo', narrativeLabel: 'Challenge do capítulo', type: 'challenge',
    route: '/lab/parallelism', completionId: 'parallelism-bridge', prerequisites: ['boss-cevian'], concepts: ['parallel-angle-families', 'parallel-converse-skill', 'parallelogram-characterization'],
    reward: { xp: 55, unlockTitle: 'Insígnia das Paralelas' },
  },
  {
    id: 'mission-coordinate-map', chapterId: 'chapter-analytic', order: 8,
    title: 'Cartografia de Sinais', subtitle: 'Eixos, quadrantes e diagonais', narrativeLabel: 'Mapa do plano', type: 'lesson',
    route: '/lab/coordinates', completionId: 'coordinate-sign-lab', prerequisites: ['mission-parallelism'], concepts: ['cartesian-coordinates', 'quadrants-signs'],
    reward: { xp: 25, unlockTitle: 'Cartógrafo do Plano' },
  },
  {
    id: 'mission-line-forge', chapterId: 'chapter-analytic', order: 9,
    title: 'Forja das Retas', subtitle: 'Pontos → equações → sistemas', narrativeLabel: 'Oficina analítica', type: 'practice',
    route: '/lab/line-forge', completionId: 'line-forge', prerequisites: ['mission-coordinate-map'], concepts: ['general-line-equation', 'linear-system-classification'],
    reward: { xp: 65, unlockTitle: 'Forjador de Retas' },
  },
  {
    id: 'mission-language-bridge', chapterId: 'chapter-analytic', order: 10,
    title: 'Ponte das Duas Linguagens', subtitle: 'Sintética ↔ analítica', narrativeLabel: 'Missão de transferência', type: 'review',
    route: '/lab/crossover', completionId: 'synthetic-analytic-crossover', prerequisites: ['mission-line-forge'], concepts: ['coordinate-median', 'system-intersection-interpretation'],
    reward: { xp: 35, unlockTitle: 'Tradutor Geométrico' },
  },
  {
    id: 'boss-exercise-48', chapterId: 'chapter-analytic', order: 11,
    title: 'O Enigma das Duas Cevianas', subtitle: 'Figura → sistema → prova métrica', narrativeLabel: 'Boss analítico', type: 'boss',
    route: '/lab/exercise-48', completionId: 'exercise-48-modeling', prerequisites: ['mission-language-bridge'], concepts: ['figure-to-equation', 'exact-distance-proof'],
    reward: { xp: 90, unlockTitle: 'Título: Modelador Métrico' },
  },
];

export const gameQuests: GameQuestDefinition[] = [
  { id: 'quest-two-missions', title: 'Ritual de Estudo', description: 'Conclua 2 missões da jornada.', target: 2, rewardXp: 20, kind: 'missions' },
  { id: 'quest-perfect-mission', title: 'Precisão do Escriba', description: 'Conquiste 3 estrelas em uma missão.', target: 1, rewardXp: 15, kind: 'perfect' },
  { id: 'quest-first-boss', title: 'Provação da Ala', description: 'Derrote um boss da campanha.', target: 1, rewardXp: 30, kind: 'boss' },
];

export const achievementDefinitions: AchievementDefinition[] = [
  { id: 'first-mission', title: 'Primeiro Pergaminho', description: 'Concluiu a primeira missão.', icon: 'scroll' },
  { id: 'first-perfect', title: 'Geômetra Impecável', description: 'Conquistou três estrelas em uma missão.', icon: 'star' },
  { id: 'first-boss', title: 'Quebra-Selos', description: 'Derrotou o primeiro boss.', icon: 'crown' },
  { id: 'five-missions', title: 'Explorador da Academia', description: 'Concluiu cinco missões.', icon: 'shield' },
  { id: 'seven-day-streak', title: 'Chama Constante', description: 'Estudou em sete dias consecutivos.', icon: 'flame' },
];

export function initialQuestProgress(): Record<string, QuestProgress> {
  return Object.fromEntries(gameQuests.map((quest) => [quest.id, { questId: quest.id, value: 0, target: quest.target, completed: false }]));
}

export function findCampaignNodeByCompletionId(completionId: string) {
  return campaignNodes.find((node) => node.completionId === completionId);
}

export function isNodeCompleted(progress: UserProgress, node: CampaignNode) {
  return Boolean(progress.missionProgress[node.id]?.bestStars) || progress.completedEncounterIds.includes(node.completionId);
}

export function getNextCampaignNode(progress: UserProgress) {
  return campaignNodes.find((node) => !isNodeCompleted(progress, node));
}

export function getCampaignNodeState(progress: UserProgress, node: CampaignNode): CampaignNodeState {
  if (isNodeCompleted(progress, node)) return (progress.missionProgress[node.id]?.bestStars ?? 1) === 3 ? 'perfect' : 'completed';
  const prerequisitesMet = node.prerequisites.every((id) => {
    const prerequisite = campaignNodes.find((candidate) => candidate.id === id);
    return prerequisite ? isNodeCompleted(progress, prerequisite) : false;
  });
  if (!prerequisitesMet) return 'locked';
  return getNextCampaignNode(progress)?.id === node.id ? 'current' : 'available';
}

export function activeQuest(progress: UserProgress) {
  return gameQuests.find((quest) => !progress.quests[quest.id]?.completed) ?? gameQuests.at(-1);
}

export function unlockedAchievement(progress: UserProgress, achievementId: string) {
  return progress.achievements.some((item: AchievementProgress) => item.achievementId === achievementId);
}

const adaptiveReviewRoutes: Record<string, { title: string; subtitle: string; route: string }> = {
  'triangle-congruence': { title: 'Espelho de Vértices', subtitle: '45–90 s para reativar correspondências', route: '/microquest/correspondence-pairs' },
  sas: { title: 'O Ângulo Guardião', subtitle: '60–120 s para reconhecer o ângulo compreendido', route: '/microquest/included-angle' },
  median: { title: 'Três Cevianas, Uma Marca', subtitle: '90–180 s para reativar definições', route: '/microquest/cevian-classification' },
  'isosceles-special-cevian': { title: 'Três Cevianas, Uma Marca', subtitle: '90–180 s para reativar definições', route: '/microquest/cevian-classification' },
};

export function getDueAdaptiveReview(progress: UserProgress, now = new Date()) {
  return Object.values(progress.reviewSchedule)
    .filter((entry) => new Date(entry.nextReview) <= now && adaptiveReviewRoutes[entry.conceptId])
    .sort((a, b) => b.recentErrors - a.recentErrors || a.nextReview.localeCompare(b.nextReview))
    .map((entry) => ({ conceptId: entry.conceptId, ...adaptiveReviewRoutes[entry.conceptId]! }))
    .at(0);
}
