import type { DiagnosticTag, Microquest } from '../types/domain';

export const microquests: Microquest[] = [
  {
    id: 'correspondence-pairs',
    title: 'Espelho de Vértices',
    competency: 'Correspondência ordenada',
    duration: '45–90 s',
    prompt: 'Se △ABC ≅ △DEF, qual lado corresponde a AC?',
    options: [{ id: 'de', label: 'DE' }, { id: 'df', label: 'DF' }, { id: 'fd', label: 'FD' }, { id: 'ef', label: 'EF' }],
    correctOptionId: 'df',
    successMessage: 'A ocupa a posição de D e C ocupa a posição de F; portanto AC ↔ DF; FD nomeia o mesmo segmento.',
    errorMessage: 'Compare as posições: primeira letra com primeira, terceira com terceira.',
    diagnosticTag: 'ordered-correspondence',
    skillId: 'triangle-congruence',
    masteryDimensions: ['recognition', 'application'],
    returnEncounterId: 'ordered-correspondence',
  },
  {
    id: 'included-angle',
    title: 'O Ângulo Guardião',
    competency: 'Ângulo compreendido no LAL',
    duration: '60–120 s',
    prompt: 'Os lados AB e BC são os lados conhecidos de △ABC. Qual ângulo está compreendido entre eles?',
    options: [{ id: 'a', label: '∠A' }, { id: 'b', label: '∠B' }, { id: 'c', label: '∠C' }],
    correctOptionId: 'b',
    successMessage: 'AB e BC se encontram em B; ∠B é o ângulo compreendido.',
    errorMessage: 'Procure o vértice comum aos dois lados conhecidos.',
    diagnosticTag: 'included-angle',
    skillId: 'sas',
    masteryDimensions: ['recognition', 'application'],
    returnEncounterId: 'crossroads-opv',
  },
  {
    id: 'cevian-classification',
    title: 'Três Cevianas, Uma Marca',
    competency: 'Classificação de cevianas',
    duration: '90–180 s',
    prompt: 'Um segmento liga o vértice A ao ponto médio M de BC. Como ele deve ser classificado?',
    options: [{ id: 'median', label: 'Mediana' }, { id: 'bisector', label: 'Bissetriz' }, { id: 'altitude', label: 'Altura' }],
    correctOptionId: 'median',
    successMessage: 'Ligar o vértice ao ponto médio do lado oposto define uma mediana.',
    errorMessage: 'Use a marca do ponto médio; não há marca angular nem de perpendicularidade.',
    diagnosticTag: 'midpoint-definition',
    skillId: 'median',
    masteryDimensions: ['recognition', 'justification'],
    returnEncounterId: 'crossroads-opv',
  },
];

const tagToMicroquest: Partial<Record<DiagnosticTag, string>> = {
  'ordered-correspondence': 'correspondence-pairs',
  'included-angle': 'included-angle',
  'midpoint-definition': 'cevian-classification',
  'bisector-definition': 'cevian-classification',
};

export function microquestForTag(tag: DiagnosticTag) {
  return tagToMicroquest[tag];
}

export function findMicroquest(id: string) {
  return microquests.find((microquest) => microquest.id === id);
}
