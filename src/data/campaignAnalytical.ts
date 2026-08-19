import type { AnalyticalCampaignQuest, CampaignProofType, CampaignRegion, DiagnosticTag } from '../types/domain';
import { skills } from './bootstrap';

export const analyticalCampaignRegions: CampaignRegion[] = [
  { id: 'analytic-plane', order: 1, title: 'Plano Cartesiano', subtitle: 'Questão 1', description: 'Investigue eixos, quadrantes, sinais e as diagonais y=x e y=-x.', accent: '#4ecde0', visibility: 'visibleButLocked', skillIds: ['cartesian-coordinates', 'quadrants-signs', 'diagonal-lines'], encounterIds: ['coordinate-sign-lab'], questionNumbers: [1], bossQuestIds: [], tutorialQuestIds: ['analytic-q01'] },
  { id: 'analytic-distance', order: 2, title: 'Distância e Equidistância', subtitle: 'Questões 2–5', description: 'Use Pitágoras e distâncias ao quadrado para comparar sem virar calculadora.', accent: '#61b986', visibility: 'hiddenUntilDiscovered', skillIds: ['distance-formula-skill', 'squared-distance', 'coordinate-equidistance'], encounterIds: [], questionNumbers: [2,3,4,5], bossQuestIds: [], tutorialQuestIds: [] },
  { id: 'analytic-midpoint', order: 3, title: 'Ponto Médio e Divisão', subtitle: 'Questões 6–8', description: 'Médias, razões e sistemas recuperam pontos desconhecidos.', accent: '#e5b958', visibility: 'hiddenUntilDiscovered', skillIds: ['coordinate-midpoint', 'segment-division', 'coordinate-median', 'inverse-coordinate-system'], encounterIds: [], questionNumbers: [6,7,8], bossQuestIds: [], tutorialQuestIds: [] },
  { id: 'analytic-centroid', order: 4, title: 'Baricentro', subtitle: 'Questão 9 · retorna em Q16 e Q29', description: 'O encontro das medianas vira média vetorial e centro quadrático.', accent: '#ad79dc', visibility: 'hiddenUntilDiscovered', skillIds: ['centroid-coordinate'], encounterIds: [], questionNumbers: [9], bossQuestIds: [], tutorialQuestIds: [], reusedQuestIds: ['analytic-q16', 'analytic-q29'] },
  { id: 'analytic-symmetry', order: 5, title: 'Simetrias', subtitle: 'Questões 10–13', description: 'Eixos, origem e composição atuam diretamente sobre coordenadas.', accent: '#ec7272', visibility: 'hiddenUntilDiscovered', skillIds: ['axis-reflection', 'central-symmetry', 'symmetry-composition'], encounterIds: [], questionNumbers: [10,11,12,13], bossQuestIds: [], tutorialQuestIds: [] },
  { id: 'analytic-lines-squares', order: 6, title: 'Retas, Interseções e Quadrados', subtitle: 'Q12, Q14, Q15 e Q17', description: 'Sistemas e propriedades métricas revelam estruturas geométricas.', accent: '#5ea2dd', visibility: 'hiddenUntilDiscovered', skillIds: ['coordinate-collinearity', 'line-intersection', 'square-coordinate-properties'], encounterIds: [], questionNumbers: [14,15,17], bossQuestIds: ['analytic-q17'], tutorialQuestIds: [], reusedQuestIds: ['analytic-q12'] },
  { id: 'analytic-optimization', order: 7, title: 'Otimização', subtitle: 'Questão 16', description: 'Expanda e complete quadrados em torno do baricentro.', accent: '#dd8657', visibility: 'hiddenUntilDiscovered', skillIds: ['squared-distance-optimization', 'centroid-coordinate'], encounterIds: [], questionNumbers: [16], bossQuestIds: ['analytic-q16'], tutorialQuestIds: [] },
  { id: 'analytic-inequalities', order: 8, title: 'Inequações', subtitle: 'Questões 18–20', description: 'Cada desigualdade pinta uma região; o sistema escolhe a interseção.', accent: '#78bb64', visibility: 'hiddenUntilDiscovered', skillIds: ['cartesian-inequalities', 'inequality-systems'], encounterIds: [], questionNumbers: [18,19,20], bossQuestIds: [], tutorialQuestIds: [] },
  { id: 'analytic-loci', order: 9, title: 'Padrões e Lugares Geométricos', subtitle: 'Questões 21–22', description: 'Periodicidade e mediatrizes conectam sequência, escala e geometria.', accent: '#55c0b4', visibility: 'hiddenUntilDiscovered', skillIds: ['periodic-patterns', 'coordinate-locus'], encounterIds: [], questionNumbers: [21,22], bossQuestIds: [], tutorialQuestIds: [] },
  { id: 'analytic-midpoint-apps', order: 10, title: 'Aplicações de Ponto Médio', subtitle: 'Questões 23–24', description: 'Ponto médio reaparece como operador em figuras e problemas inversos.', accent: '#c6a75b', visibility: 'hiddenUntilDiscovered', skillIds: ['coordinate-midpoint', 'segment-division'], encounterIds: [], questionNumbers: [23,24], bossQuestIds: [], tutorialQuestIds: [] },
  { id: 'analytic-metric-figures', order: 11, title: 'Figuras Métricas', subtitle: 'Questões 25–26', description: 'Reconheça equiláteros e perímetros por igualdades exatas de distância.', accent: '#d176a0', visibility: 'hiddenUntilDiscovered', skillIds: ['coordinate-equilateral', 'radical-perimeter'], encounterIds: [], questionNumbers: [25,26], bossQuestIds: [], tutorialQuestIds: [] },
  { id: 'analytic-absolute', order: 12, title: 'Módulo', subtitle: 'Questão 27', description: 'Interprete |x-a| como distância antes de abrir casos algébricos.', accent: '#747ed2', visibility: 'hiddenUntilDiscovered', skillIds: ['absolute-value-geometry'], encounterIds: [], questionNumbers: [27], bossQuestIds: [], tutorialQuestIds: [] },
  { id: 'analytic-proofs', order: 13, title: 'Provas por Coordenadas', subtitle: 'Questões 28–30', description: 'Expansões simbólicas demonstram identidades métricas sem perder a geometria.', accent: '#c96565', visibility: 'hiddenUntilDiscovered', skillIds: ['coordinate-proof', 'centroid-coordinate', 'apollonius-identity'], encounterIds: [], questionNumbers: [28,29,30], bossQuestIds: ['analytic-q30'], tutorialQuestIds: [], reusedQuestIds: ['analytic-q09'] },
];

interface Seed {
  number: number;
  title: string;
  algebraSkills: string[];
  geometrySkills: string[];
  teaches: string[];
  requires?: string[];
  reinforces?: string[];
  difficulty?: 1 | 2 | 3 | 4 | 5;
  proofType?: CampaignProofType;
  commonErrors?: DiagnosticTag[];
  recoverySkills?: string[];
  playableRoute?: string;
}

function q(seed: Seed): AnalyticalCampaignQuest {
  const region = analyticalCampaignRegions.find((item) => item.questionNumbers.includes(seed.number));
  if (!region) throw new Error(`Questão analítica ${seed.number} sem região primária.`);
  return {
    id: `analytic-q${String(seed.number).padStart(2, '0')}`,
    number: seed.number,
    regionId: region.id,
    title: seed.title,
    sourceQuestion: `Questão ${seed.number} da Lista 1 de Geometria Analítica — ${seed.title}.`,
    requires: seed.requires ?? [], teaches: seed.teaches, reinforces: seed.reinforces ?? [],
    difficulty: seed.difficulty ?? 2, proofType: seed.proofType ?? 'none',
    commonErrors: seed.commonErrors ?? [], recoverySkills: seed.recoverySkills ?? seed.requires ?? [],
    algebraSkills: seed.algebraSkills, geometrySkills: seed.geometrySkills,
    ...(seed.playableRoute ? { playableRoute: seed.playableRoute } : {}),
  };
}

export const analyticalCampaignQuests: AnalyticalCampaignQuest[] = [
  q({ number: 1, title: 'Sinais, quadrantes e diagonais do plano', algebraSkills: ['comparação de sinais', 'igualdade/oposição'], geometrySkills: ['quadrantes', 'eixos', 'y=x', 'y=-x'], teaches: ['cartesian-coordinates', 'quadrants-signs', 'diagonal-lines'], difficulty: 1, playableRoute: '/lab/coordinates' }),
  q({ number: 2, title: 'Distância como Pitágoras', algebraSkills: ['quadrados', 'radicais'], geometrySkills: ['segmento no plano', 'triângulo retângulo'], teaches: ['distance-formula-skill'], requires: ['cartesian-coordinates'], commonErrors: ['distance-formula'] }),
  q({ number: 3, title: 'Comparar por distância ao quadrado', algebraSkills: ['expansão de quadrados'], geometrySkills: ['comparação métrica'], teaches: ['squared-distance'], requires: ['distance-formula-skill'], commonErrors: ['distance-formula'] }),
  q({ number: 4, title: 'Ponto equidistante', algebraSkills: ['equação linear após cancelamento'], geometrySkills: ['equidistância', 'mediatriz'], teaches: ['coordinate-equidistance'], requires: ['squared-distance'], commonErrors: ['distance-formula', 'algebra-linear'] }),
  q({ number: 5, title: 'Lugar de equidistância', algebraSkills: ['equivalência de equações'], geometrySkills: ['lugar geométrico'], teaches: ['coordinate-locus'], requires: ['coordinate-equidistance'], reinforces: ['squared-distance'], difficulty: 3, proofType: 'direct' }),
  q({ number: 6, title: 'Ponto médio coordenado', algebraSkills: ['média aritmética'], geometrySkills: ['ponto médio'], teaches: ['coordinate-midpoint'], requires: ['cartesian-coordinates'], commonErrors: ['midpoint-definition'] }),
  q({ number: 7, title: 'Divisão e mediana', algebraSkills: ['razão', 'média ponderada'], geometrySkills: ['divisão de segmento', 'mediana'], teaches: ['segment-division', 'coordinate-median'], requires: ['coordinate-midpoint'], commonErrors: ['midpoint-definition'] }),
  q({ number: 8, title: 'Sistema inverso do ponto médio', algebraSkills: ['sistema linear inverso'], geometrySkills: ['reconstrução de extremidade'], teaches: ['inverse-coordinate-system'], requires: ['segment-division'], commonErrors: ['algebra-linear'] }),
  q({ number: 9, title: 'Baricentro como média dos vértices', algebraSkills: ['média de três valores'], geometrySkills: ['medianas', 'baricentro'], teaches: ['centroid-coordinate'], requires: ['coordinate-median'] }),
  q({ number: 10, title: 'Reflexões nos eixos', algebraSkills: ['troca de sinal'], geometrySkills: ['reflexão em eixo'], teaches: ['axis-reflection'], requires: ['cartesian-coordinates'] }),
  q({ number: 11, title: 'Simetria pela origem', algebraSkills: ['oposto de um par ordenado'], geometrySkills: ['simetria central'], teaches: ['central-symmetry'], requires: ['coordinate-midpoint'] }),
  q({ number: 12, title: 'Composição de simetrias e retas', algebraSkills: ['composição de transformações'], geometrySkills: ['eixos', 'reta', 'simetria'], teaches: ['symmetry-composition'], requires: ['axis-reflection', 'central-symmetry'], reinforces: ['coordinate-collinearity'], difficulty: 3 }),
  q({ number: 13, title: 'Transformação composta', algebraSkills: ['substituição coordenada'], geometrySkills: ['composição de isometrias'], teaches: [], requires: ['symmetry-composition'], reinforces: ['axis-reflection'], difficulty: 3 }),
  q({ number: 14, title: 'Colinearidade por equação', algebraSkills: ['equação linear', 'determinante'], geometrySkills: ['reta por pontos'], teaches: ['coordinate-collinearity'], requires: ['cartesian-coordinates'], commonErrors: ['collinearity-determinant'], playableRoute: '/lab/line-forge' }),
  q({ number: 15, title: 'Interseção de funções', algebraSkills: ['sistema', 'equação quadrática'], geometrySkills: ['interseção de curvas'], teaches: ['line-intersection'], requires: ['coordinate-collinearity'], commonErrors: ['algebra-linear'] }),
  q({ number: 16, title: 'Mínimo da soma de distâncias ao quadrado', algebraSkills: ['expansão', 'completar quadrados'], geometrySkills: ['baricentro', 'distância'], teaches: ['squared-distance-optimization'], requires: ['squared-distance', 'centroid-coordinate'], difficulty: 5, proofType: 'optimization', commonErrors: ['distance-formula', 'algebra-linear'] }),
  q({ number: 17, title: 'Reconhecer um quadrado por coordenadas', algebraSkills: ['distâncias ao quadrado'], geometrySkills: ['quadrado', 'diagonais', 'ponto médio'], teaches: ['square-coordinate-properties'], requires: ['squared-distance', 'coordinate-midpoint'], difficulty: 4, proofType: 'synthesis', commonErrors: ['distance-formula', 'proof-gap'] }),
  q({ number: 18, title: 'Limites e semiplanos', algebraSkills: ['sinais de expressões'], geometrySkills: ['reta-limite', 'semiplano'], teaches: ['cartesian-inequalities'], requires: ['cartesian-coordinates'] }),
  q({ number: 19, title: 'Região cartesiana', algebraSkills: ['teste de ponto'], geometrySkills: ['fronteira e interior'], teaches: [], requires: ['cartesian-inequalities'], reinforces: ['quadrants-signs'], commonErrors: ['algebra-linear'] }),
  q({ number: 20, title: 'Sistema de inequações', algebraSkills: ['interseção de condições'], geometrySkills: ['região viável'], teaches: ['inequality-systems'], requires: ['cartesian-inequalities'], difficulty: 3 }),
  q({ number: 21, title: 'Caminho periódico e comprimento acumulado', algebraSkills: ['periodicidade', 'soma'], geometrySkills: ['deslocamento no plano'], teaches: ['periodic-patterns'], requires: ['cartesian-coordinates'], commonErrors: ['algebra-linear'] }),
  q({ number: 22, title: 'Mediatriz como lugar geométrico', algebraSkills: ['escala', 'equação de equidistância'], geometrySkills: ['mediatriz', 'lugar geométrico'], teaches: ['coordinate-locus'], requires: ['coordinate-equidistance'], proofType: 'direct' }),
  q({ number: 23, title: 'Pontos médios em uma figura', algebraSkills: ['médias sucessivas'], geometrySkills: ['ponto médio', 'paralelismo'], teaches: [], requires: ['coordinate-midpoint'], reinforces: ['segment-division'] }),
  q({ number: 24, title: 'Reconstrução por pontos médios', algebraSkills: ['sistema linear'], geometrySkills: ['triângulo medial'], teaches: [], requires: ['coordinate-midpoint', 'inverse-coordinate-system'], difficulty: 3, commonErrors: ['algebra-linear'] }),
  q({ number: 25, title: 'Equilátero por três distâncias', algebraSkills: ['igualdade de quadrados'], geometrySkills: ['equilátero'], teaches: ['coordinate-equilateral'], requires: ['squared-distance'], proofType: 'direct', commonErrors: ['distance-formula'] }),
  q({ number: 26, title: 'Perímetro exato com radicais', algebraSkills: ['simplificação de radicais'], geometrySkills: ['perímetro', 'distâncias'], teaches: ['radical-perimeter'], requires: ['distance-formula-skill', 'triangle-perimeter'], commonErrors: ['distance-formula', 'segment-vs-measure'] }),
  q({ number: 27, title: '|x-1|+|x-4|≤7 como distância', algebraSkills: ['módulo', 'intervalos'], geometrySkills: ['distância na reta'], teaches: ['absolute-value-geometry'], requires: ['distance-formula-skill'], difficulty: 3, commonErrors: ['absolute-value'], recoverySkills: ['distance-formula-skill'] }),
  q({ number: 28, title: 'Prova métrica por expansão', algebraSkills: ['expansão simbólica', 'cancelamento'], geometrySkills: ['identidade métrica'], teaches: ['coordinate-proof'], requires: ['squared-distance', 'coordinate-collinearity'], difficulty: 4, proofType: 'direct', commonErrors: ['metric-proof-gap', 'radical-simplification'], playableRoute: '/lab/exercise-48' }),
  q({ number: 29, title: 'Baricentros em identidade coordenada', algebraSkills: ['médias vetoriais', 'expansão'], geometrySkills: ['baricentro'], teaches: [], requires: ['centroid-coordinate', 'coordinate-proof'], reinforces: ['squared-distance-optimization'], difficulty: 4, proofType: 'direct', commonErrors: ['proof-gap'] }),
  q({ number: 30, title: 'Identidade de Apolônio', algebraSkills: ['distâncias ao quadrado', 'expansão simbólica'], geometrySkills: ['mediana', 'identidade de Apolônio'], teaches: ['apollonius-identity'], requires: ['coordinate-midpoint', 'coordinate-proof'], difficulty: 5, proofType: 'synthesis', commonErrors: ['distance-formula', 'proof-gap'] }),
];

export function validateAnalyticalCampaign() {
  const errors: string[] = [];
  const skillIds = new Set(skills.map((skill) => skill.id));
  const questIds = analyticalCampaignQuests.map((quest) => quest.id);
  const numbers = analyticalCampaignQuests.map((quest) => quest.number);
  const expectedNumbers = Array.from({ length: 30 }, (_, index) => index + 1);
  const regionIds = analyticalCampaignRegions.map((region) => region.id);
  const regionOrders = analyticalCampaignRegions.map((region) => region.order);
  const ownedNumbers = analyticalCampaignRegions.flatMap((region) => region.questionNumbers);

  if (numbers.length !== 30 || expectedNumbers.some((number) => !numbers.includes(number))) {
    errors.push('A campanha analítica deve conter exatamente as questões 1–30.');
  }
  if (new Set(questIds).size !== questIds.length) errors.push('Há IDs duplicados na campanha analítica.');
  if (new Set(numbers).size !== numbers.length) errors.push('Há números de questão duplicados na campanha analítica.');
  if (new Set(regionIds).size !== regionIds.length) errors.push('Há IDs de região duplicados na campanha analítica.');
  if (new Set(regionOrders).size !== regionOrders.length) errors.push('Há ordens de região duplicadas na campanha analítica.');
  if (new Set(ownedNumbers).size !== ownedNumbers.length) errors.push('Uma questão pertence a mais de uma região analítica primária.');
  if (expectedNumbers.some((number) => !ownedNumbers.includes(number))) errors.push('Nem todas as questões 1–30 pertencem a uma região analítica primária.');

  [...regionOrders].sort((a, b) => a - b).forEach((order, index) => {
    if (order !== index + 1) errors.push(`Ordem das regiões analíticas não é contínua: esperado ${index + 1}, recebido ${order}.`);
  });

  for (const quest of analyticalCampaignQuests) {
    if (!quest.sourceQuestion) errors.push(`${quest.id}: sourceQuestion ausente.`);
    if (!quest.algebraSkills.length || !quest.geometrySkills.length) errors.push(`${quest.id}: competências algébricas ou geométricas ausentes.`);
    if (quest.playableRoute && !quest.playableRoute.startsWith('/')) errors.push(`${quest.id}: rota jogável deve ser absoluta.`);
    for (const id of [...quest.requires, ...quest.teaches, ...quest.reinforces, ...quest.recoverySkills]) {
      if (!skillIds.has(id)) errors.push(`${quest.id}: skill inexistente ${id}.`);
    }
    const region = analyticalCampaignRegions.find((item) => item.id === quest.regionId);
    if (!region?.questionNumbers.includes(quest.number)) errors.push(`${quest.id}: vínculo de região inconsistente.`);
  }

  for (const region of analyticalCampaignRegions) {
    for (const skillId of region.skillIds) if (!skillIds.has(skillId)) errors.push(`${region.id}: skill inexistente ${skillId}.`);
    for (const id of [...region.bossQuestIds, ...region.tutorialQuestIds, ...(region.reusedQuestIds ?? [])]) {
      if (!analyticalCampaignQuests.some((quest) => quest.id === id)) errors.push(`${region.id}: quest referenciada inexistente ${id}.`);
    }
    for (const number of region.questionNumbers) {
      const quest = analyticalCampaignQuests.find((item) => item.number === number);
      if (!quest || quest.regionId !== region.id) errors.push(`${region.id}: questão ${number} sem vínculo primário recíproco.`);
    }
  }

  return errors;
}

const analyticalErrors = validateAnalyticalCampaign();
if (analyticalErrors.length) throw new Error(`Campanha Analítica inválida:\n${analyticalErrors.join('\n')}`);

export const findAnalyticalRegion = (id: string) => analyticalCampaignRegions.find((region) => region.id === id);
export const findAnalyticalQuest = (id: string) => analyticalCampaignQuests.find((quest) => quest.id === id);
