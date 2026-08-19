import type {
  AssessmentDimension,
  ChallengeLevel,
  ChallengeProfile,
  HardCompetencyId,
  PedagogicalAct,
  PrerequisiteId,
  WeightedHardSkill,
} from '../types/competency';
import { DEFAULT_RUBRIC } from './competencyConfig';

type Binding = readonly [HardCompetencyId, WeightedHardSkill['role']?, number?];

const assessedDimensions: AssessmentDimension[] = ['correctness', 'justification', 'independence', 'verification'];

function hardSkills(bindings: readonly Binding[]): WeightedHardSkill[] {
  return bindings.map(([id, role = 'primary', weight = 1]) => ({ id, role, weight, assessedDimensions }));
}

interface ProfileInput {
  id: string;
  title: string;
  objective: string;
  route: string;
  act: PedagogicalAct;
  level: ChallengeLevel;
  skills: readonly Binding[];
  prerequisites?: PrerequisiteId[];
  questType?: ChallengeProfile['rpg']['questType'];
  proofSpecId?: string;
}

function profile({
  id,
  title,
  objective,
  route,
  act,
  level,
  skills,
  prerequisites = [],
  questType = 'missao',
  proofSpecId,
}: ProfileInput): ChallengeProfile {
  return {
    id,
    status: 'ready',
    source: {
      listId: null,
      sourceItem: null,
      sourceStatus: 'defined',
      sourceMode: 'standard_example',
      synthetic: true,
      version: 'app-v2',
    },
    title,
    objective,
    act,
    level,
    difficultyRationale: level === 'iniciante'
      ? 'Aplicação direta com um núcleo conceitual e feedback imediato.'
      : level === 'intermediario'
        ? 'Integra conceitos e exige justificar ao menos uma passagem.'
        : 'Exige cadeia de prova, transferência ou modelagem em várias etapas.',
    conceptIds: [],
    hardSkills: hardSkills(skills),
    softSkills: [
      { id: 'S2', event: 'retry_after_error', evidenceRule: 'acerto após tentativa incorreta no mesmo passo' },
      { id: 'S3', event: 'verified_answer', evidenceRule: 'componente de verificação observado' },
      { id: 'S7', event: 'autonomous_success', evidenceRule: 'acerto sem pista reveladora' },
    ],
    prerequisites,
    recommendedTools: [],
    rubric: { ...DEFAULT_RUBRIC },
    validationPolicyId: proofSpecId ? 'proof-engine' : 'deterministic-choice',
    hintPolicyId: 'tiered-hints-v1',
    rpg: { questType, skillCheck: title, xp: 0, item: null, route },
    ...(proofSpecId ? { proofSpecId } : {}),
  };
}

const baseProfiles: ChallengeProfile[] = [
  profile({ id: 'ordered-correspondence', title: 'A Ordem dos Vértices', objective: 'Preservar correspondências de vértices, lados e ângulos.', route: '/mission/ordered-correspondence', act: 'decifrar', level: 'iniciante', skills: [['H1'], ['H5'], ['H15', 'supporting', 0.7]], prerequisites: ['P2', 'P4'] }),
  profile({ id: 'crossroads-opv', title: 'A Encruzilhada', objective: 'Encadear OPV, LAL e partes correspondentes.', route: '/encounter/crossroads-opv', act: 'justificar', level: 'intermediario', skills: [['H3'], ['H5'], ['H6', 'supporting', 0.8], ['H15', 'supporting', 0.6]], prerequisites: ['P2', 'P4', 'P5'] }),
  profile({ id: 'official-euclid-q15', title: 'O Selo da Questão 15', objective: 'Integrar ALA, álgebra e correspondência em uma aplicação.', route: '/encounter/official-q15', act: 'justificar', level: 'intermediario', skills: [['H2'], ['H4'], ['H5'], ['H6', 'supporting', 0.8], ['H15', 'supporting', 0.6]], prerequisites: ['P1', 'P3', 'P4', 'P5'] }),
  profile({ id: 'proof:isosceles-base-angles', title: 'Espelho do Isósceles', objective: 'Reconstruir uma prova do teorema dos ângulos da base.', route: '/proof/isosceles-base-angles?mode=training', act: 'justificar', level: 'intermediario', skills: [['H4'], ['H5'], ['H6'], ['H13', 'supporting', 0.6], ['H15', 'supporting', 0.8]], prerequisites: ['P3', 'P4', 'P5'], questType: 'prova', proofSpecId: 'isosceles-base-angles' }),
  profile({ id: 'proof:isosceles-cevian', title: 'Guardião das Cevianas', objective: 'Provar que uma bissetriz especial também é mediana e altura.', route: '/proof/isosceles-cevian?mode=training', act: 'justificar', level: 'avancado', skills: [['H4'], ['H5'], ['H6'], ['H8'], ['H13', 'supporting', 0.7], ['H15', 'supporting', 0.8]], prerequisites: ['P3', 'P4', 'P5', 'P9'], questType: 'boss', proofSpecId: 'isosceles-cevian' }),
  profile({ id: 'proof:asa-contradiction', title: 'ALA por Contradição', objective: 'Auditar um salto lógico e construir uma prova indireta.', route: '/proof/asa-contradiction?mode=training', act: 'investigar', level: 'avancado', skills: [['H5'], ['H6'], ['H7', 'supporting', 0.6], ['H13'], ['H15', 'supporting', 0.8]], prerequisites: ['P4', 'P5'], questType: 'prova', proofSpecId: 'asa-contradiction' }),
  profile({ id: 'parallelism-bridge', title: 'Passagem das Paralelas', objective: 'Usar famílias angulares, conversa e caracterização de paralelogramo.', route: '/lab/parallelism', act: 'justificar', level: 'intermediario', skills: [['H3'], ['H6'], ['H10'], ['H11', 'supporting', 0.7], ['H15', 'supporting', 0.7]], prerequisites: ['P5', 'P6', 'P7'] }),
  profile({ id: 'coordinate-sign-lab', title: 'Cartografia de Sinais', objective: 'Ler coordenadas e interpretar posições no plano.', route: '/lab/coordinates', act: 'decifrar', level: 'iniciante', skills: [['H1'], ['H2', 'supporting', 0.6], ['H14', 'supporting', 0.5]], prerequisites: ['P1', 'P2'] }),
  profile({ id: 'line-forge', title: 'Forja das Retas', objective: 'Traduzir pontos e relações geométricas em retas e sistemas.', route: '/lab/line-forge', act: 'generalizar', level: 'intermediario', skills: [['H2'], ['H8', 'supporting', 0.6], ['H14'], ['H15', 'supporting', 0.7]], prerequisites: ['P1', 'P2', 'P9'] }),
  profile({ id: 'synthetic-analytic-crossover', title: 'Ponte das Duas Linguagens', objective: 'Preservar estruturas ao traduzir entre geometria sintética e analítica.', route: '/lab/crossover', act: 'investigar', level: 'intermediario', skills: [['H8'], ['H10', 'supporting', 0.6], ['H14'], ['H15', 'supporting', 0.7]], prerequisites: ['P1', 'P2', 'P9'] }),
  profile({ id: 'exercise-48-modeling', title: 'O Enigma das Duas Cevianas', objective: 'Modelar figura, sistema e prova métrica exata.', route: '/lab/exercise-48', act: 'investigar', level: 'avancado', skills: [['H2'], ['H6'], ['H7'], ['H8', 'supporting', 0.6], ['H13'], ['H14'], ['H15', 'supporting', 0.8]], prerequisites: ['P1', 'P2', 'P5', 'P9'], questType: 'boss' }),
  profile({ id: 'microquest:correspondence-pairs', title: 'Espelho de Vértices', objective: 'Reativar correspondência ordenada.', route: '/microquest/correspondence-pairs', act: 'decifrar', level: 'iniciante', skills: [['H1'], ['H5']], prerequisites: ['P2', 'P4'], questType: 'revisao' }),
  profile({ id: 'microquest:included-angle', title: 'O Ângulo Guardião', objective: 'Reconhecer o ângulo compreendido no LAL.', route: '/microquest/included-angle', act: 'decifrar', level: 'iniciante', skills: [['H1'], ['H3'], ['H5']], prerequisites: ['P2', 'P4'], questType: 'revisao' }),
  profile({ id: 'microquest:cevian-classification', title: 'Três Cevianas, Uma Marca', objective: 'Classificar uma ceviana pela relação dada.', route: '/microquest/cevian-classification', act: 'decifrar', level: 'iniciante', skills: [['H1'], ['H8']], prerequisites: ['P2', 'P9'], questType: 'revisao' }),
];

const focusedProfiles: ChallengeProfile[] = [
  profile({ id: 'adaptive:parallelism-bridge:parallelogram-boss', title: 'Prova das Diagonais', objective: 'Usar paralelismo já conhecido como contexto para treinar prova e comunicação.', route: '/lab/parallelism?focus=parallelogram-boss', act: 'justificar', level: 'avancado', skills: [['H6'], ['H15', 'supporting', 0.9], ['H11', 'supporting', 0.8], ['H13', 'supporting', 0.7], ['H10', 'context', 1]], prerequisites: ['P5', 'P6', 'P7'], questType: 'revisao' }),
  profile({ id: 'adaptive:exercise-48-modeling:metric-conclusion', title: 'Fecho Métrico', objective: 'Concluir uma prova métrica exata sem salto lógico.', route: '/lab/exercise-48?focus=metric-conclusion', act: 'justificar', level: 'avancado', skills: [['H6'], ['H15'], ['H7', 'context', 1]], prerequisites: ['P1', 'P5'], questType: 'revisao' }),
  profile({ id: 'adaptive:line-forge:collinearity', title: 'Selo da Colinearidade', objective: 'Justificar a tradução de um determinante nulo para uma relação geométrica.', route: '/lab/line-forge?focus=collinearity', act: 'justificar', level: 'intermediario', skills: [['H6'], ['H15'], ['H2', 'context', 1]], prerequisites: ['P1', 'P2', 'P5'], questType: 'revisao' }),
  profile({ id: 'adaptive:synthetic-analytic-crossover:perpendicular-bisector-two-languages', title: 'Mediatriz em Duas Línguas', objective: 'Transferir ponto médio e perpendicularidade entre representações.', route: '/lab/crossover?focus=perpendicular-bisector-two-languages', act: 'investigar', level: 'intermediario', skills: [['H8'], ['H10'], ['H14'], ['H15', 'supporting', 0.7]], prerequisites: ['P2', 'P9'], questType: 'revisao' }),
];

export const challengeProfiles = [...baseProfiles, ...focusedProfiles];

const stepBindings: Record<string, readonly Binding[]> = {
  // Encounters: evidence must follow the mathematical action actually performed,
  // not every competency associated with the whole encounter.
  'ordered-correspondence:rule-correspondence': [['H1'], ['H5'], ['H15', 'supporting', 0.8]],
  'ordered-correspondence:rule-side-correspondence': [['H5'], ['H15', 'supporting', 0.8]],
  'ordered-correspondence:rule-angle-correspondence': [['H3', 'supporting', 0.6], ['H5'], ['H15', 'supporting', 0.8]],
  'crossroads-opv:rule-opv': [['H3'], ['H6', 'supporting', 0.7], ['H15', 'supporting', 0.6]],
  'crossroads-opv:rule-sas': [['H5'], ['H6', 'supporting', 0.8], ['H15', 'supporting', 0.6]],
  'crossroads-opv:rule-cpctc': [['H5'], ['H6', 'supporting', 0.7], ['H15', 'supporting', 0.8]],

  // Official Q15: algebra, angular reasoning and congruence are assessed in distinct steps.
  'official-euclid-q15:q15-opv': [['H3'], ['H6', 'supporting', 0.7], ['H15', 'supporting', 0.6]],
  'official-euclid-q15:q15-asa': [['H5'], ['H6', 'supporting', 0.8], ['H15', 'supporting', 0.6]],
  'official-euclid-q15:q15-order': [['H5'], ['H15', 'supporting', 0.9]],
  'official-euclid-q15:q15-x': [['H2'], ['H5', 'supporting', 0.6]],
  'official-euclid-q15:q15-y': [['H2'], ['H5', 'supporting', 0.6]],
  'official-euclid-q15:q15-perimeter': [['H4'], ['H5', 'supporting', 0.8], ['H15', 'supporting', 0.6]],

  // Guided proof: each accepted step updates only the competencies evidenced by that step.
  'proof:isosceles-base-angles:iso-side-given': [['H1'], ['H4', 'supporting', 0.7]],
  'proof:isosceles-base-angles:iso-angle-split': [['H3'], ['H8', 'supporting', 0.8]],
  'proof:isosceles-base-angles:iso-shared': [['H6'], ['H15', 'supporting', 0.7]],
  'proof:isosceles-base-angles:iso-sas': [['H5'], ['H6', 'supporting', 0.9]],
  'proof:isosceles-base-angles:iso-base-result': [['H5'], ['H6', 'supporting', 0.8], ['H15', 'supporting', 0.8]],

  'proof:isosceles-cevian:iso-given': [['H1'], ['H4', 'supporting', 0.7]],
  'proof:isosceles-cevian:bisected-angle': [['H3'], ['H8', 'supporting', 0.8]],
  'proof:isosceles-cevian:shared-side': [['H6'], ['H15', 'supporting', 0.7]],
  'proof:isosceles-cevian:triangles-sas': [['H5'], ['H6', 'supporting', 0.9]],
  'proof:isosceles-cevian:base-parts': [['H5'], ['H6', 'supporting', 0.8]],
  'proof:isosceles-cevian:midpoint-d': [['H8'], ['H6', 'supporting', 0.6]],
  'proof:isosceles-cevian:median-ad': [['H8'], ['H15', 'supporting', 0.6]],
  'proof:isosceles-cevian:angles-at-d': [['H3', 'supporting', 0.7], ['H5']],
  'proof:isosceles-cevian:collinear-bdc': [['H1'], ['H6', 'supporting', 0.6]],
  'proof:isosceles-cevian:linear-pair': [['H3'], ['H6', 'supporting', 0.8]],
  'proof:isosceles-cevian:right-angles': [['H2'], ['H3', 'supporting', 0.8]],
  'proof:isosceles-cevian:perpendicular-ad': [['H10'], ['H6', 'supporting', 0.7]],
  'proof:isosceles-cevian:altitude-ad': [['H8'], ['H10', 'supporting', 0.8]],

  'proof:asa-contradiction:audit-leap': [['H6'], ['H15', 'supporting', 0.9]],
  'proof:asa-contradiction:assume-less': [['H6'], ['H7', 'supporting', 0.7]],
  'proof:asa-contradiction:construct-f-prime': [['H13'], ['H6', 'supporting', 0.8]],
  'proof:asa-contradiction:aux-sas': [['H5'], ['H6', 'supporting', 0.9]],
  'proof:asa-contradiction:angular-conflict': [['H6'], ['H5', 'supporting', 0.7]],
  'proof:asa-contradiction:same-point': [['H6'], ['H15', 'supporting', 0.6]],
  'proof:asa-contradiction:missing-side': [['H5'], ['H6', 'supporting', 0.8]],
  'proof:asa-contradiction:final-sas': [['H5'], ['H6', 'supporting', 0.9]],

  'ordered-correspondence:lesson-guided-b-e': [['H1'], ['H5'], ['H15', 'supporting', 0.6]],
  'ordered-correspondence:lesson-guided-c-f': [['H1'], ['H5'], ['H15', 'supporting', 0.6]],
  'ordered-correspondence:lesson-guided-side': [['H1'], ['H5'], ['H15', 'supporting', 0.7]],
  'ordered-correspondence:lesson-guided-angle': [['H1'], ['H5'], ['H15', 'supporting', 0.7]],
  'line-forge:midpoint-bc': [['H2'], ['H8']],
  'line-forge:collinearity': [['H2'], ['H6', 'supporting', 0.7], ['H15', 'supporting', 0.8]],
  'line-forge:generic-point-line': [['H2'], ['H14']],
  'line-forge:interpret-equation': [['H1'], ['H2'], ['H14']],
  'line-forge:special-lines': [['H1'], ['H2'], ['H14']],
  'line-forge:supporting-lines': [['H1'], ['H2'], ['H15', 'supporting', 0.8]],
  'line-forge:solution-set': [['H14'], ['H15', 'supporting', 0.8]],
  'line-forge:system-spd': [['H2'], ['H14'], ['H15', 'supporting', 0.8]],
  'line-forge:system-si': [['H2'], ['H10', 'supporting', 0.6], ['H14']],
  'line-forge:system-spi': [['H2'], ['H14'], ['H15', 'supporting', 0.8]],
  'line-forge:median-boss': [['H2'], ['H8'], ['H14'], ['H15', 'supporting', 0.8]],
  'exercise-48-modeling:read-points': [['H1']],
  'exercise-48-modeling:derive-midpoints': [['H2'], ['H8']],
  'exercise-48-modeling:choose-lines': [['H1'], ['H8'], ['H13']],
  'exercise-48-modeling:build-lines': [['H2'], ['H14'], ['H15', 'supporting', 0.8]],
  'exercise-48-modeling:build-system': [['H2'], ['H14']],
  'exercise-48-modeling:solve-system': [['H2'], ['H15', 'supporting', 0.7]],
  'exercise-48-modeling:choose-distances': [['H7'], ['H15', 'supporting', 0.6]],
  'exercise-48-modeling:exact-radicals': [['H2'], ['H7']],
  'exercise-48-modeling:metric-conclusion': [['H6'], ['H7', 'context', 1], ['H15', 'supporting', 0.9]],
  'parallelism-bridge:alternate-interior': [['H1'], ['H3'], ['H10']],
  'parallelism-bridge:solve-angle-x': [['H2'], ['H3'], ['H10']],
  'parallelism-bridge:parallel-converse': [['H3'], ['H6'], ['H10'], ['H15', 'supporting', 0.8]],
  'parallelism-bridge:parallelogram-boss': [['H5'], ['H6'], ['H8'], ['H11'], ['H13', 'supporting', 0.8], ['H15', 'supporting', 0.8], ['H10', 'context', 1]],
  'synthetic-analytic-crossover:median-two-languages': [['H8'], ['H14']],
  'synthetic-analytic-crossover:intersection-two-languages': [['H2'], ['H14'], ['H15', 'supporting', 0.7]],
  'synthetic-analytic-crossover:perpendicular-bisector-two-languages': [['H8'], ['H10'], ['H14'], ['H15', 'supporting', 0.7]],
};

export function findChallengeProfile(challengeId: string) {
  return challengeProfiles.find((item) => item.id === challengeId);
}

export function resolveChallengeProfile(encounterId: string, stepId: string): ChallengeProfile | undefined {
  const exact = findChallengeProfile(encounterId);
  if (!exact) return undefined;
  const bindings = stepBindings[`${encounterId}:${stepId}`];
  if (!bindings) return exact;
  return {
    ...exact,
    id: `${encounterId}:${stepId}`,
    hardSkills: hardSkills(bindings),
    title: `${exact.title} · ${stepId}`,
  };
}
