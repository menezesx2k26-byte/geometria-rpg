import type { CampaignProofType, CampaignQuest, CampaignRegion, DiagnosticTag } from '../types/domain';
import { skills } from './bootstrap';

export const euclideanCampaignRegions: CampaignRegion[] = [
  { id: 'euclid-angles', order: 1, title: 'Templo dos Ângulos', subtitle: 'Questões 1–8', description: 'Classificar, relacionar e traduzir ângulos antes de calcular.', accent: '#55c7e8', visibility: 'visibleButLocked', skillIds: ['right-angle', 'straight-angle', 'adjacent-angles', 'complementary-angles', 'supplementary-angles', 'opv', 'angle-bisector', 'angle-algebra'], encounterIds: [], questionNumbers: [1,2,3,4,5,6,7,8], bossQuestIds: [], tutorialQuestIds: ['euclid-q01'] },
  { id: 'euclid-triangles', order: 2, title: 'Triângulos', subtitle: 'Questões 9–12', description: 'Ler classificações, ângulos da base e perímetro como relações.', accent: '#f39a55', visibility: 'hiddenUntilDiscovered', skillIds: ['triangles', 'isosceles-theorem', 'equilateral-triangle', 'scalene-triangle', 'triangle-perimeter'], encounterIds: [], questionNumbers: [9,10,11,12], bossQuestIds: [], tutorialQuestIds: [] },
  { id: 'euclid-congruence', order: 3, title: 'Fortaleza da Congruência', subtitle: 'Questões 13–20', description: 'Correspondências e critérios transformam marcas em provas.', accent: '#aa78db', visibility: 'hiddenUntilDiscovered', skillIds: ['triangle-congruence', 'cpctc', 'sas', 'asa', 'sss', 'opv', 'reflexivity', 'midpoint'], encounterIds: ['crossroads-opv', 'ordered-correspondence'], questionNumbers: [13,14,15,16,17,18,19,20], bossQuestIds: ['euclid-q20'], tutorialQuestIds: [] },
  { id: 'euclid-converses', order: 4, title: 'Teoremas e Conversos', subtitle: 'Questões 21–25', description: 'Trocar hipótese e conclusão exige uma nova prova.', accent: '#e56666', visibility: 'hiddenUntilDiscovered', skillIds: ['isosceles-converse', 'equiangular-equilateral', 'iff-logic', 'isosceles-special-cevian'], encounterIds: [], questionNumbers: [21,22,23,24,25], bossQuestIds: ['euclid-q24'], tutorialQuestIds: [] },
  { id: 'euclid-rigidity', order: 5, title: 'Construções e Rigidez', subtitle: 'Questões 26–30', description: 'Diagonais e pontos auxiliares revelam triângulos escondidos.', accent: '#d8ad46', visibility: 'hiddenUntilDiscovered', skillIds: ['triangulation', 'perpendicular-bisector', 'equidistance', 'auxiliary-construction', 'diagonals', 'saccheri'], encounterIds: [], questionNumbers: [26,27,28,29,30], bossQuestIds: ['euclid-q30'], tutorialQuestIds: [] },
  { id: 'euclid-inequalities', order: 6, title: 'Desigualdades', subtitle: 'Questões 31–35', description: 'Comparar lados e ângulos sem reduzir tudo a uma conta.', accent: '#70ba79', visibility: 'hiddenUntilDiscovered', skillIds: ['interior-angle-sum', 'exterior-angle-theorem', 'triangle-inequality', 'angle-side-comparison'], encounterIds: [], questionNumbers: [31,32,33,34,35], bossQuestIds: [], tutorialQuestIds: [] },
  { id: 'euclid-reflection', order: 7, title: 'Reflexão e Otimização', subtitle: 'Questões 36 e 42', description: 'Desdobrar caminhos para transformar otimização em reta.', accent: '#4ebfb0', visibility: 'hiddenUntilDiscovered', skillIds: ['reflection', 'optimization'], encounterIds: [], questionNumbers: [36,42], bossQuestIds: ['euclid-q42'], tutorialQuestIds: ['euclid-q36'] },
  { id: 'euclid-cevians', order: 8, title: 'Cevianas', subtitle: 'Questões 37–39', description: 'Mediana, altura e contraposição em configurações especiais.', accent: '#e2c05b', visibility: 'hiddenUntilDiscovered', skillIds: ['contraposition', 'median', 'altitude', 'equilateral-properties'], encounterIds: [], questionNumbers: [37,38,39], bossQuestIds: ['euclid-q39'], tutorialQuestIds: [] },
  { id: 'euclid-synthesis', order: 9, title: 'Síntese', subtitle: 'Questões 40–43', description: 'Escolher e encadear ferramentas sem roteiro explícito.', accent: '#cb6f9f', visibility: 'hiddenUntilDiscovered', skillIds: ['auxiliary-construction', 'cpctc', 'triangle-inequality', 'optimization', 'contraposition'], encounterIds: [], questionNumbers: [40,41,43], bossQuestIds: ['euclid-q43'], tutorialQuestIds: [] },
];

interface QuestSeed {
  number: number;
  title: string;
  teaches: string[];
  requires?: string[];
  reinforces?: string[];
  difficulty?: 1 | 2 | 3 | 4 | 5;
  proofType?: CampaignProofType;
  commonErrors?: DiagnosticTag[];
  recoverySkills?: string[];
  playableRoute?: string;
}

function regionForQuestion(number: number) {
  return euclideanCampaignRegions.find((region) => region.questionNumbers.includes(number));
}

function q(seed: QuestSeed): CampaignQuest {
  const region = regionForQuestion(seed.number);
  if (!region) throw new Error(`Questão ${seed.number} sem região.`);
  return {
    id: `euclid-q${String(seed.number).padStart(2, '0')}`,
    number: seed.number,
    regionId: region.id,
    title: seed.title,
    sourceQuestion: `Questão ${seed.number} da Lista 1 — ${seed.title}.`,
    requires: seed.requires ?? [],
    teaches: seed.teaches,
    reinforces: seed.reinforces ?? [],
    difficulty: seed.difficulty ?? 2,
    proofType: seed.proofType ?? 'none',
    commonErrors: seed.commonErrors ?? [],
    recoverySkills: seed.recoverySkills ?? seed.requires ?? [],
    ...(seed.playableRoute ? { playableRoute: seed.playableRoute } : {}),
  };
}

export const euclideanCampaignQuests: CampaignQuest[] = [
  q({ number: 1, title: 'Reto e raso como referências', teaches: ['right-angle', 'straight-angle'], requires: ['angles'], difficulty: 1 }),
  q({ number: 2, title: 'Adjacência e pares lineares', teaches: ['adjacent-angles'], requires: ['angles'], reinforces: ['straight-angle'] }),
  q({ number: 3, title: 'Complementares', teaches: ['complementary-angles'], requires: ['angles'], commonErrors: ['algebra-linear'] }),
  q({ number: 4, title: 'Suplementares', teaches: ['supplementary-angles'], requires: ['angles'], commonErrors: ['algebra-linear'] }),
  q({ number: 5, title: 'Reconhecimento de OPV', teaches: ['opv'], requires: ['adjacent-angles'], commonErrors: ['opv-recognition'], recoverySkills: ['angles'] }),
  q({ number: 6, title: 'Equação angular', teaches: ['angle-algebra'], requires: ['complementary-angles', 'supplementary-angles'], commonErrors: ['algebra-linear'] }),
  q({ number: 7, title: 'Ação da bissetriz', teaches: ['angle-bisector'], requires: ['angles'], commonErrors: ['bisector-definition'] }),
  q({ number: 8, title: 'Síntese de relações angulares', teaches: [], requires: ['opv', 'angle-bisector', 'angle-algebra'], reinforces: ['complementary-angles', 'supplementary-angles'], difficulty: 3, proofType: 'direct', commonErrors: ['proof-gap'] }),
  q({ number: 9, title: 'Classificação por lados', teaches: ['equilateral-triangle', 'scalene-triangle'], requires: ['triangles'], difficulty: 1 }),
  q({ number: 10, title: 'O isósceles e sua base', teaches: ['isosceles-theorem'], requires: ['triangles'], commonErrors: ['ordered-correspondence'] }),
  q({ number: 11, title: 'Equilátero como caso especial', teaches: ['equilateral-triangle'], requires: ['isosceles-theorem'], reinforces: ['triangles'] }),
  q({ number: 12, title: 'Perímetro e linguagem de medidas', teaches: ['triangle-perimeter'], requires: ['segments', 'triangles'], commonErrors: ['segment-vs-measure'] }),
  q({ number: 13, title: 'Correspondência ordenada', teaches: ['triangle-congruence'], requires: ['triangles'], commonErrors: ['ordered-correspondence'], playableRoute: '/encounter/ordered-correspondence' }),
  q({ number: 14, title: 'Partes correspondentes', teaches: ['cpctc'], requires: ['triangle-congruence'], commonErrors: ['ordered-correspondence'] }),
  q({ number: 15, title: 'Ângulo compreendido no LAL', teaches: ['sas'], requires: ['triangle-congruence'], commonErrors: ['included-angle'] }),
  q({ number: 16, title: 'Escolha entre LAL, ALA e LLL', teaches: ['asa', 'sss'], requires: ['sas'], reinforces: ['triangle-congruence'], difficulty: 3, commonErrors: ['included-angle'] }),
  q({ number: 17, title: 'Prova com OPV e LAL', teaches: [], requires: ['opv', 'sas'], reinforces: ['cpctc'], difficulty: 3, proofType: 'direct', commonErrors: ['proof-gap', 'opv-recognition'], playableRoute: '/encounter/crossroads-opv' }),
  q({ number: 18, title: 'Reflexividade e ponto médio', teaches: ['reflexivity', 'midpoint'], requires: ['sas'], proofType: 'direct', commonErrors: ['midpoint-definition', 'proof-gap'] }),
  q({ number: 19, title: 'Demonstração de ALA', teaches: ['asa'], requires: ['sas', 'isosceles-theorem'], difficulty: 4, proofType: 'contradiction', commonErrors: ['construction-choice', 'proof-gap'], playableRoute: '/proof/asa-contradiction?mode=training' }),
  q({ number: 20, title: 'Demonstração de LLL', teaches: ['sss'], requires: ['asa', 'isosceles-converse'], difficulty: 4, proofType: 'construction', commonErrors: ['construction-choice', 'proof-gap'] }),
  q({ number: 21, title: 'Conversa do isósceles', teaches: ['isosceles-converse'], requires: ['asa'], proofType: 'direct' }),
  q({ number: 22, title: 'Equiângulo implica equilátero', teaches: ['equiangular-equilateral'], requires: ['isosceles-converse'], proofType: 'direct' }),
  q({ number: 23, title: 'Se e somente se', teaches: ['iff-logic'], requires: ['isosceles-theorem', 'isosceles-converse'], commonErrors: ['proof-gap'] }),
  q({ number: 24, title: 'Bissetriz, mediana e altura no isósceles', teaches: ['isosceles-special-cevian'], requires: ['sas', 'angle-bisector', 'isosceles-theorem'], difficulty: 5, proofType: 'synthesis', commonErrors: ['bisector-definition', 'midpoint-definition', 'perpendicularity', 'proof-gap'], playableRoute: '/proof/isosceles-cevian?mode=training' }),
  q({ number: 25, title: 'Síntese de teoremas e conversos', teaches: [], requires: ['iff-logic', 'equiangular-equilateral'], reinforces: ['isosceles-converse'], difficulty: 3, proofType: 'direct' }),
  q({ number: 26, title: 'Triangulação como estratégia', teaches: ['triangulation'], requires: ['sss'], proofType: 'construction', commonErrors: ['construction-choice'] }),
  q({ number: 27, title: 'Mediatriz', teaches: ['perpendicular-bisector'], requires: ['midpoint', 'altitude'], commonErrors: ['perpendicularity'] }),
  q({ number: 28, title: 'Lugar geométrico da equidistância', teaches: ['equidistance'], requires: ['perpendicular-bisector', 'sas'], proofType: 'direct', commonErrors: ['proof-gap'] }),
  q({ number: 29, title: 'Diagonais e construção auxiliar', teaches: ['diagonals', 'auxiliary-construction'], requires: ['triangulation'], proofType: 'construction', commonErrors: ['construction-choice'] }),
  q({ number: 30, title: 'Rigidez de Saccheri', teaches: ['saccheri'], requires: ['diagonals', 'sss'], difficulty: 5, proofType: 'synthesis', commonErrors: ['construction-choice', 'proof-gap'] }),
  q({ number: 31, title: 'Soma dos ângulos internos', teaches: ['interior-angle-sum'], requires: ['supplementary-angles', 'triangles'], proofType: 'construction' }),
  q({ number: 32, title: 'Teorema do ângulo externo', teaches: ['exterior-angle-theorem'], requires: ['interior-angle-sum'], proofType: 'direct' }),
  q({ number: 33, title: 'Desigualdade triangular', teaches: ['triangle-inequality'], requires: ['auxiliary-construction'], proofType: 'construction', commonErrors: ['construction-choice'] }),
  q({ number: 34, title: 'Comparação entre lados e ângulos', teaches: ['angle-side-comparison'], requires: ['isosceles-converse', 'triangle-inequality'], proofType: 'indirect' }),
  q({ number: 35, title: 'Cadeia de desigualdades', teaches: [], requires: ['triangle-inequality', 'angle-side-comparison'], reinforces: ['exterior-angle-theorem'], difficulty: 4, proofType: 'synthesis', commonErrors: ['proof-gap', 'algebra-linear'] }),
  q({ number: 36, title: 'Tutorial de reflexão', teaches: ['reflection'], requires: ['perpendicular-bisector'], difficulty: 2, proofType: 'construction' }),
  q({ number: 37, title: 'Contraposição em cevianas', teaches: ['contraposition'], requires: ['iff-logic'], proofType: 'contraposition', commonErrors: ['proof-gap'] }),
  q({ number: 38, title: 'Mediana e altura sob hipótese', teaches: [], requires: ['median', 'altitude'], reinforces: ['altitude'], proofType: 'direct', commonErrors: ['midpoint-definition', 'perpendicularity'] }),
  q({ number: 39, title: 'Cevianas do equilátero', teaches: ['equilateral-properties'], requires: ['equilateral-triangle', 'isosceles-special-cevian'], difficulty: 5, proofType: 'synthesis', commonErrors: ['bisector-definition', 'midpoint-definition', 'perpendicularity'] }),
  q({ number: 40, title: 'Síntese de congruência', teaches: [], requires: ['cpctc', 'sas', 'asa', 'sss'], reinforces: ['triangle-congruence'], difficulty: 4, proofType: 'synthesis', commonErrors: ['ordered-correspondence', 'proof-gap'] }),
  q({ number: 41, title: 'Construção que revela a prova', teaches: [], requires: ['auxiliary-construction', 'triangle-inequality'], difficulty: 4, proofType: 'construction', commonErrors: ['construction-choice'] }),
  q({ number: 42, title: 'Prova-chefe de reflexão e otimização', teaches: ['optimization'], requires: ['reflection', 'triangle-inequality'], difficulty: 5, proofType: 'optimization', commonErrors: ['construction-choice', 'proof-gap'] }),
  q({ number: 43, title: 'Triângulo Russo', teaches: [], requires: ['auxiliary-construction', 'cpctc', 'triangle-inequality', 'contraposition'], reinforces: ['sas', 'sss', 'optimization'], difficulty: 5, proofType: 'synthesis', commonErrors: ['construction-choice', 'proof-gap'] }),
];

export function validateEuclideanCampaign() {
  const errors: string[] = [];
  const skillIds = new Set(skills.map((skill) => skill.id));
  const questIds = euclideanCampaignQuests.map((quest) => quest.id);
  const questNumbers = euclideanCampaignQuests.map((quest) => quest.number);
  const expectedNumbers = Array.from({ length: 43 }, (_, index) => index + 1);
  const regionIds = euclideanCampaignRegions.map((region) => region.id);
  const regionOrders = euclideanCampaignRegions.map((region) => region.order);
  const ownedQuestionNumbers = euclideanCampaignRegions.flatMap((region) => region.questionNumbers);

  if (questNumbers.length !== 43 || expectedNumbers.some((number) => !questNumbers.includes(number))) {
    errors.push('A campanha deve conter exatamente as questões 1–43.');
  }
  if (new Set(questIds).size !== questIds.length) errors.push('Há IDs duplicados na campanha euclidiana.');
  if (new Set(questNumbers).size !== questNumbers.length) errors.push('Há números de questão duplicados na campanha euclidiana.');
  if (new Set(regionIds).size !== regionIds.length) errors.push('Há IDs de região duplicados na campanha euclidiana.');
  if (new Set(regionOrders).size !== regionOrders.length) errors.push('Há ordens de região duplicadas na campanha euclidiana.');
  if (new Set(ownedQuestionNumbers).size !== ownedQuestionNumbers.length) errors.push('Uma questão pertence a mais de uma região euclidiana primária.');
  if (expectedNumbers.some((number) => !ownedQuestionNumbers.includes(number))) errors.push('Nem todas as questões 1–43 pertencem a uma região euclidiana primária.');

  [...regionOrders].sort((a, b) => a - b).forEach((order, index) => {
    if (order !== index + 1) errors.push(`Ordem das regiões euclidianas não é contínua: esperado ${index + 1}, recebido ${order}.`);
  });

  for (const quest of euclideanCampaignQuests) {
    if (!quest.sourceQuestion) errors.push(`${quest.id}: sourceQuestion ausente.`);
    if (quest.playableRoute && !quest.playableRoute.startsWith('/')) errors.push(`${quest.id}: rota jogável deve ser absoluta.`);
    for (const skillId of [...quest.requires, ...quest.teaches, ...quest.reinforces, ...quest.recoverySkills]) {
      if (!skillIds.has(skillId)) errors.push(`${quest.id}: skill inexistente ${skillId}.`);
    }
    const region = euclideanCampaignRegions.find((item) => item.id === quest.regionId);
    if (!region?.questionNumbers.includes(quest.number)) errors.push(`${quest.id}: vínculo de região inconsistente.`);
  }

  for (const region of euclideanCampaignRegions) {
    for (const skillId of region.skillIds) if (!skillIds.has(skillId)) errors.push(`${region.id}: skill inexistente ${skillId}.`);
    for (const questId of [...region.bossQuestIds, ...region.tutorialQuestIds, ...(region.reusedQuestIds ?? [])]) {
      if (!euclideanCampaignQuests.some((quest) => quest.id === questId)) errors.push(`${region.id}: quest referenciada inexistente ${questId}.`);
    }
    for (const number of region.questionNumbers) {
      const quest = euclideanCampaignQuests.find((item) => item.number === number);
      if (!quest || quest.regionId !== region.id) errors.push(`${region.id}: questão ${number} sem vínculo primário recíproco.`);
    }
  }

  return errors;
}

const campaignErrors = validateEuclideanCampaign();
if (campaignErrors.length) throw new Error(`Campanha Euclidiana inválida:\n${campaignErrors.join('\n')}`);

export function findEuclideanRegion(id: string) {
  return euclideanCampaignRegions.find((region) => region.id === id);
}

export function findEuclideanQuest(id: string) {
  return euclideanCampaignQuests.find((quest) => quest.id === id);
}
