export interface OfficialQuestStep {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  correctId: string;
  acceptedAlternativeIds?: string[];
  success: string;
  error: string;
  relation: string;
}

export const officialQuest15 = {
  id: 'official-euclid-q15',
  title: 'O Encontro das Duas Lâminas',
  sourceQuestion: 'Questão oficial 15 da Lista Euclidiana: provar congruência por OPV e ALA, identificar correspondências, calcular x e y e comparar perímetros.',
  hypothesis: ['∠CBA ≅ ∠CDE', 'BC ≅ CD', 'As retas B–C–D e A–C–E se cruzam em C', 'CA = 2x − 6, CE = 22', 'BA = 35, DE = 3y + 5'],
  steps: [
    { id: 'q15-opv', prompt: 'Qual relação angular nasce diretamente do cruzamento em C?', options: [{ id: 'correct', label: '∠BCA ≅ ∠DCE por OPV' }, { id: 'adjacent', label: '∠BCA ≅ ∠CDE por adjacência' }, { id: 'visual', label: '∠CBA ≅ ∠DCE porque parecem iguais' }], correctId: 'correct', success: 'OPV registrada: ∠BCA ≅ ∠DCE.', error: 'Procure o par cujos lados são semirretas opostas duas a duas.', relation: '∠BCA ≅ ∠DCE · OPV' },
    { id: 'q15-asa', prompt: 'Dois ângulos e o lado compreendido estão disponíveis. Qual critério permite avançar?', options: [{ id: 'sas', label: 'LAL' }, { id: 'asa', label: 'ALA' }, { id: 'sss', label: 'LLL' }], correctId: 'asa', success: 'Critério ALA confirmado.', error: 'BC/CD está entre os dois ângulos conhecidos de cada triângulo.', relation: '△CBA ≅ △CDE · ALA' },
    { id: 'q15-order', prompt: 'Qual escrita preserva a correspondência C↔C, B↔D, A↔E?', options: [{ id: 'order', label: '△CBA ≅ △CDE' }, { id: 'order-bac-dec', label: '△BAC ≅ △DEC' }, { id: 'order-acb-ecd', label: '△ACB ≅ △ECD' }, { id: 'flip', label: '△ABC ≅ △CDE' }, { id: 'mix', label: '△BCA ≅ △CDE' }], correctId: 'order', acceptedAlternativeIds: ['order-bac-dec', 'order-acb-ecd'], success: 'Correspondência preservada: permutações sincronizadas dos dois triângulos são equivalentes.', error: 'Compare letra por letra: cada posição deve manter C↔C, B↔D e A↔E.', relation: 'C↔C · B↔D · A↔E' },
    { id: 'q15-x', prompt: 'CA↔CE. Se 2x−6=22, quanto vale x?', options: [{ id: 'x8', label: 'x=8' }, { id: 'x14', label: 'x=14' }, { id: 'x16', label: 'x=16' }], correctId: 'x14', success: '2x=28, então x=14.', error: 'Some 6 aos dois membros antes de dividir por 2.', relation: 'x = 14' },
    { id: 'q15-y', prompt: 'BA↔DE. Se 35=3y+5, quanto vale y?', options: [{ id: 'y10', label: 'y=10' }, { id: 'y12', label: 'y=12' }, { id: 'y15', label: 'y=15' }], correctId: 'y10', success: '3y=30, então y=10.', error: 'Subtraia 5 dos dois membros antes de dividir por 3.', relation: 'y = 10' },
    { id: 'q15-perimeter', prompt: 'Qual é a razão P₁/P₂ entre os perímetros dos triângulos congruentes?', options: [{ id: 'half', label: '1/2' }, { id: 'one', label: '1' }, { id: 'two', label: '2' }], correctId: 'one', success: 'Triângulos congruentes têm perímetros iguais: a razão é 1.', error: 'Todos os três pares de lados correspondentes têm medidas iguais.', relation: 'P₁/P₂ = 1' },
  ] satisfies OfficialQuestStep[],
  officialAnswer: 'x=14, y=10 e P₁/P₂=1.',
};
