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
    description: 'Leia a ordem dos vértices, aplique critérios e encerre com uma prova-chefe.',
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
    title: 'Guardião das Cevianas', subtitle: 'Bissetriz ⇒ mediana e altura', narrativeLabel: 'Prova-chefe', type: 'boss',
    route: '/proof/isosceles-cevian?mode=training', completionId: 'proof:isosceles-cevian', prerequisites: ['checkpoint-isosceles'], concepts: ['isosceles-special-cevian', 'midpoint', 'perpendicularity'],
    reward: { xp: 75, achievementId: 'first-boss', unlockTitle: 'Título: Guardião das Cevianas' },
  },
  {
    id: 'mission-parallelism', chapterId: 'chapter-parallelism', order: 7,
    title: 'Ponte das Paralelas', subtitle: 'Famílias, conversas e paralelogramo', narrativeLabel: 'Desafio do capítulo', type: 'challenge',
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
    title: 'O Enigma das Duas Cevianas', subtitle: 'Figura → sistema → prova métrica', narrativeLabel: 'Chefe analítico', type: 'boss',
    route: '/lab/exercise-48', completionId: 'exercise-48-modeling', prerequisites: ['mission-language-bridge'], concepts: ['figure-to-equation', 'exact-distance-proof'],
    reward: { xp: 90, unlockTitle: 'Título: Modelador Métrico' },
  },
];

export const gameQuests: GameQuestDefinition[] = [
  { id: 'quest-two-missions', title: 'Ritual de Estudo', description: 'Conclua 2 missões da jornada.', target: 2, rewardXp: 20, kind: 'missions' },
  { id: 'quest-perfect-mission', title: 'Precisão do Escriba', description: 'Conquiste 3 estrelas em uma missão.', target: 1, rewardXp: 15, kind: 'perfect' },
  { id: 'quest-first-boss', title: 'Provação da Ala', description: 'Supere um chefe da campanha.', target: 1, rewardXp: 30, kind: 'boss' },
];

export const achievementDefinitions: AchievementDefinition[] = [
  { id: 'first-mission', title: 'Primeiro Pergaminho', description: 'Concluiu a primeira missão.', icon: 'scroll' },
  { id: 'first-perfect', title: 'Geômetra Impecável', description: 'Conquistou três estrelas em uma missão.', icon: 'star' },
  { id: 'first-boss', title: 'Quebra-Selos', description: 'Superou o primeiro chefe.', icon: 'crown' },
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
  return [...campaignNodes]
    .sort((left, right) => left.order - right.order)
    .find((node) => !isNodeCompleted(progress, node));
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
  return gameQuests.find((quest) => !progress.quests[quest.id]?.completed);
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


export function validateGameCampaign() {
  const errors: string[] = [];
  const chapterIds = new Set(campaignChapters.map((chapter) => chapter.id));
  const nodeIds = new Set(campaignNodes.map((node) => node.id));
  const completionIds = new Set<string>();
  const orders = new Set<number>();
  const chapterOrders = new Set<number>();
  const listedNodes = new Map<string, number>();
  const achievementIds = new Set(achievementDefinitions.map((item) => item.id));
  const questIds = gameQuests.map((item) => item.id);

  if (chapterIds.size !== campaignChapters.length) errors.push('Capítulos com IDs duplicados.');
  if (nodeIds.size !== campaignNodes.length) errors.push('Missões com IDs duplicados.');
  if (new Set(questIds).size !== questIds.length) errors.push('Quests com IDs duplicados.');

  for (const chapter of campaignChapters) {
    if (chapterOrders.has(chapter.order)) errors.push(`${chapter.id}: ordem de capítulo duplicada ${chapter.order}.`);
    chapterOrders.add(chapter.order);
    const local = new Set<string>();
    for (const nodeId of chapter.nodeIds) {
      if (local.has(nodeId)) errors.push(`${chapter.id}: missão duplicada ${nodeId}.`);
      local.add(nodeId);
      if (!nodeIds.has(nodeId)) errors.push(`${chapter.id}: missão inexistente ${nodeId}.`);
      listedNodes.set(nodeId, (listedNodes.get(nodeId) ?? 0) + 1);
      const node = campaignNodes.find((candidate) => candidate.id === nodeId);
      if (node && node.chapterId !== chapter.id) errors.push(`${node.id}: chapterId não corresponde a ${chapter.id}.`);
    }
  }

  for (const node of campaignNodes) {
    if (!chapterIds.has(node.chapterId)) errors.push(`${node.id}: capítulo inexistente ${node.chapterId}.`);
    if ((listedNodes.get(node.id) ?? 0) !== 1) errors.push(`${node.id}: deve aparecer exatamente uma vez nos capítulos.`);
    if (orders.has(node.order)) errors.push(`${node.id}: ordem duplicada ${node.order}.`);
    orders.add(node.order);
    if (completionIds.has(node.completionId)) errors.push(`${node.id}: completionId duplicado ${node.completionId}.`);
    completionIds.add(node.completionId);
    if (!node.route.startsWith('/')) errors.push(`${node.id}: rota deve ser absoluta.`);
    if (node.reward.xp <= 0 || !Number.isFinite(node.reward.xp)) errors.push(`${node.id}: XP deve ser positivo e finito.`);
    if (node.reward.achievementId && !achievementIds.has(node.reward.achievementId)) {
      errors.push(`${node.id}: conquista inexistente ${node.reward.achievementId}.`);
    }
    for (const prerequisiteId of node.prerequisites) {
      const prerequisite = campaignNodes.find((candidate) => candidate.id === prerequisiteId);
      if (!prerequisite) errors.push(`${node.id}: pré-requisito inexistente ${prerequisiteId}.`);
      else if (prerequisite.order >= node.order) errors.push(`${node.id}: pré-requisito ${prerequisiteId} não antecede a missão.`);
    }
  }

  const ordered = [...orders].sort((a, b) => a - b);
  ordered.forEach((order, index) => {
    if (order !== index + 1) errors.push(`Ordem da campanha não é contínua: esperado ${index + 1}, recebido ${order}.`);
  });
  const orderedChapters = [...chapterOrders].sort((a, b) => a - b);
  orderedChapters.forEach((order, index) => {
    if (order !== index + 1) errors.push(`Ordem dos capítulos não é contínua: esperado ${index + 1}, recebido ${order}.`);
  });
  for (const quest of gameQuests) {
    if (quest.target <= 0 || !Number.isInteger(quest.target)) errors.push(`${quest.id}: target deve ser inteiro positivo.`);
    if (quest.rewardXp < 0 || !Number.isFinite(quest.rewardXp)) errors.push(`${quest.id}: recompensa XP inválida.`);
  }

  const state = new Map<string, 'visiting' | 'visited'>();
  const visit = (id: string, path: string[]) => {
    if (state.get(id) === 'visiting') {
      errors.push(`Ciclo na campanha: ${[...path, id].join(' -> ')}`);
      return;
    }
    if (state.get(id) === 'visited') return;
    state.set(id, 'visiting');
    campaignNodes.find((node) => node.id === id)?.prerequisites.forEach((parent) => visit(parent, [...path, id]));
    state.set(id, 'visited');
  };
  campaignNodes.forEach((node) => visit(node.id, []));

  return errors;
}
