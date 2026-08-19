import type { Proof, ProofJustification, ProofStep } from '../types/domain';
import { assertValidProofs } from './proofValidation';

const allJustifications: ProofJustification[] = [
  'hypothesis', 'definition', 'reflexivity', 'OPV', 'midpoint', 'angleBisector',
  'collinearity', 'supplementary', 'complementary', 'LAL', 'ALA', 'LLL',
  'correspondingParts', 'isoscelesTheorem', 'transitivity', 'contradiction', 'algebra',
];

type StepSeed = Omit<ProofStep, 'acceptedAlternatives' | 'objectOptions' | 'relationOptions' | 'justificationOptions' | 'answerOptions' | 'expectedAnswerIds'> &
  Partial<Pick<ProofStep, 'acceptedAlternatives' | 'objectOptions' | 'relationOptions' | 'justificationOptions' | 'answerOptions' | 'expectedAnswerIds'>>;

function step(seed: StepSeed): ProofStep {
  return {
    ...seed,
    acceptedAlternatives: seed.acceptedAlternatives ?? [],
    objectOptions: seed.objectOptions ?? [],
    relationOptions: seed.relationOptions ?? [],
    justificationOptions: seed.justificationOptions ?? allJustifications,
    answerOptions: seed.answerOptions ?? [],
    expectedAnswerIds: seed.expectedAnswerIds ?? [],
  };
}

export const proofs: Proof[] = [
  {
    id: 'isosceles-base-angles',
    title: 'O Espelho do Isósceles',
    subtitle: 'Prova guiada · teorema dos ângulos da base',
    source: { origin: 'Lista Euclidiana', reference: 'Teorema do triângulo isósceles' },
    hypothesis: ['AB ≅ AC', 'AD é bissetriz de ∠BAC', 'D pertence a BC'],
    thesis: '∠ABC ≅ ∠BCA.',
    objects: [
      { id: 'triangle-abd', kind: 'triangle', label: '△ABD' }, { id: 'triangle-acd', kind: 'triangle', label: '△ACD' },
      { id: 'segment-ab', kind: 'segment', label: 'AB' }, { id: 'segment-ac', kind: 'segment', label: 'AC' }, { id: 'segment-ad', kind: 'segment', label: 'AD' },
      { id: 'angle-bad', kind: 'angle', label: '∠BAD' }, { id: 'angle-cad', kind: 'angle', label: '∠CAD' },
      { id: 'angle-abc', kind: 'angle', label: '∠ABC' }, { id: 'angle-bca', kind: 'angle', label: '∠BCA' },
    ],
    steps: [
      step({ id: 'iso-side-given', statement: 'AB ≅ AC', involvedObjects: ['segment-ab', 'segment-ac'], relation: 'congruent', justification: 'hypothesis', dependencies: [], interaction: 'complete-justification', prompt: 'Justifique o par de lados que caracteriza o isósceles.', hint: 'Essa informação vem do enunciado.', justificationOptions: ['hypothesis', 'isoscelesTheorem', 'definition'] }),
      step({ id: 'iso-angle-split', statement: '∠BAD ≅ ∠CAD', involvedObjects: ['angle-bad', 'angle-cad'], relation: 'congruent', justification: 'angleBisector', dependencies: [], interaction: 'complete-justification', prompt: 'Use a função da construção AD.', hint: 'AD divide o ângulo do vértice em dois ângulos congruentes.', justificationOptions: ['angleBisector', 'OPV', 'hypothesis'] }),
      step({ id: 'iso-shared', statement: 'AD ≅ AD', involvedObjects: ['segment-ad'], relation: 'congruent', justification: 'reflexivity', dependencies: [], interaction: 'complete-justification', prompt: 'Qual propriedade permite usar AD nos dois triângulos?', hint: 'É o mesmo segmento.', justificationOptions: ['reflexivity', 'transitivity', 'hypothesis'] }),
      step({ id: 'iso-sas', statement: '△ABD ≅ △ACD', involvedObjects: ['triangle-abd', 'triangle-acd'], relation: 'congruent', justification: 'LAL', dependencies: ['iso-side-given', 'iso-angle-split', 'iso-shared'], interaction: 'select-consequence', prompt: 'Qual critério conclui a congruência dos triângulos menores?', hint: 'Lado, ângulo compreendido e lado.', answerOptions: [{ id: 'iso-sas', label: '△ABD ≅ △ACD por LAL' }, { id: 'iso-asa', label: '△ABD ≅ △ACD por ALA' }, { id: 'iso-sss', label: '△ABD ≅ △ACD por LLL' }], expectedAnswerIds: ['iso-sas'] }),
      step({ id: 'iso-base-result', statement: '∠ABC ≅ ∠BCA', involvedObjects: ['angle-abc', 'angle-bca'], relation: 'congruent', justification: 'correspondingParts', dependencies: ['iso-sas'], interaction: 'select-consequence', prompt: 'Extraia a consequência que prova o teorema.', hint: 'B e C são os vértices correspondentes da base.', answerOptions: [{ id: 'iso-base-result', label: '∠ABC ≅ ∠BCA' }, { id: 'wrong-apex', label: '∠ABC ≅ ∠BAC' }, { id: 'wrong-sides', label: 'AB ≅ BC' }], expectedAnswerIds: ['iso-base-result'] }),
    ],
    debrief: 'A bissetriz foi uma construção auxiliar: ela criou dois triângulos LAL e permitiu extrair os ângulos da base por partes correspondentes.',
    unlockSkillIds: ['isosceles-theorem'],
  },
  {
    id: 'isosceles-cevian',
    title: 'A Ceviana de Três Faces',
    subtitle: 'Prova-chefe · isósceles, mediana e altura',
    source: { origin: 'Lista Euclidiana', reference: 'Bissetriz do vértice no triângulo isósceles' },
    hypothesis: ['AB ≅ AC', 'AD é bissetriz de ∠BAC', 'B, D e C são colineares'],
    thesis: 'AD é mediana e altura de △ABC.',
    objects: [
      { id: 'triangle-abc', kind: 'triangle', label: '△ABC' },
      { id: 'triangle-abd', kind: 'triangle', label: '△ABD' },
      { id: 'triangle-acd', kind: 'triangle', label: '△ACD' },
      { id: 'segment-ab', kind: 'segment', label: 'AB' },
      { id: 'segment-ac', kind: 'segment', label: 'AC' },
      { id: 'segment-ad', kind: 'segment', label: 'AD' },
      { id: 'segment-bd', kind: 'segment', label: 'BD' },
      { id: 'segment-dc', kind: 'segment', label: 'DC' },
      { id: 'angle-bad', kind: 'angle', label: '∠BAD' },
      { id: 'angle-cad', kind: 'angle', label: '∠CAD' },
      { id: 'angle-adb', kind: 'angle', label: '∠ADB' },
      { id: 'angle-adc', kind: 'angle', label: '∠ADC' },
      { id: 'point-d', kind: 'point', label: 'D' },
    ],
    steps: [
      step({
        id: 'iso-given', statement: 'AB ≅ AC', involvedObjects: ['segment-ab', 'segment-ac'], relation: 'congruent', justification: 'hypothesis', dependencies: [], interaction: 'build-step',
        prompt: 'Monte o primeiro passo usando os dois lados marcados.', hint: 'Esta igualdade já aparece nas hipóteses.',
        objectOptions: [{ id: 'segment-ab', label: 'AB' }, { id: 'segment-ac', label: 'AC' }, { id: 'segment-ad', label: 'AD' }],
        relationOptions: [{ id: 'congruent', label: 'é congruente a' }, { id: 'perpendicular', label: 'é perpendicular a' }],
        justificationOptions: ['hypothesis', 'isoscelesTheorem', 'definition'],
      }),
      step({
        id: 'bisected-angle', statement: '∠BAD ≅ ∠CAD', involvedObjects: ['angle-bad', 'angle-cad'], relation: 'congruent', justification: 'angleBisector', dependencies: [], interaction: 'complete-justification',
        prompt: 'Complete a justificativa da igualdade angular.', hint: 'Use o que significa AD ser bissetriz.', justificationOptions: ['angleBisector', 'OPV', 'hypothesis'],
      }),
      step({
        id: 'shared-side', statement: 'AD ≅ AD', involvedObjects: ['segment-ad'], relation: 'congruent', justification: 'reflexivity', dependencies: [], interaction: 'complete-justification',
        prompt: 'Por que o lado AD pode entrar nos dois triângulos?', hint: 'Todo objeto é congruente a si mesmo.', justificationOptions: ['reflexivity', 'transitivity', 'hypothesis'],
      }),
      step({
        id: 'triangles-sas', statement: '△ABD ≅ △ACD', involvedObjects: ['triangle-abd', 'triangle-acd'], relation: 'congruent', justification: 'LAL', dependencies: ['iso-given', 'bisected-angle', 'shared-side'], interaction: 'select-consequence',
        prompt: 'As três relações anteriores permitem qual consequência?', hint: 'Conte lado, ângulo compreendido, lado.',
        answerOptions: [{ id: 'triangles-sas', label: '△ABD ≅ △ACD por LAL' }, { id: 'triangles-asa', label: '△ABD ≅ △ACD por ALA' }, { id: 'base-equal', label: 'BD ≅ DC diretamente' }], expectedAnswerIds: ['triangles-sas'],
      }),
      step({
        id: 'base-parts', statement: 'BD ≅ DC', involvedObjects: ['segment-bd', 'segment-dc'], relation: 'congruent', justification: 'correspondingParts', dependencies: ['triangles-sas'], interaction: 'select-consequence',
        prompt: 'Qual igualdade segue da congruência dos triângulos?', hint: 'Procure lados correspondentes.',
        answerOptions: [{ id: 'base-parts', label: 'BD ≅ DC' }, { id: 'side-mix', label: 'AB ≅ DC' }, { id: 'angle-mix', label: '∠BAD ≅ ∠ADC' }], expectedAnswerIds: ['base-parts'],
      }),
      step({
        id: 'midpoint-d', statement: 'D é ponto médio de BC', involvedObjects: ['point-d', 'segment-bd', 'segment-dc'], relation: 'midpoint', justification: 'midpoint', dependencies: ['base-parts'], interaction: 'complete-justification',
        prompt: 'Qual definição transforma BD ≅ DC em uma classificação para D?', hint: 'D já pertence a BC e divide o segmento em partes congruentes.', justificationOptions: ['midpoint', 'angleBisector', 'definition'],
      }),
      step({
        id: 'median-ad', statement: 'AD é mediana de △ABC', involvedObjects: ['segment-ad', 'triangle-abc'], relation: 'median', justification: 'definition', dependencies: ['midpoint-d'], interaction: 'select-consequence',
        prompt: 'O que AD se torna ao ligar A ao ponto médio de BC?', hint: 'A definição pedida é de uma ceviana.', answerOptions: [{ id: 'median-ad', label: 'AD é mediana' }, { id: 'altitude-too-soon', label: 'AD já é altura' }, { id: 'bisector-only', label: 'AD é apenas bissetriz' }], expectedAnswerIds: ['median-ad'],
      }),
      step({
        id: 'angles-at-d', statement: '∠ADB ≅ ∠ADC', involvedObjects: ['angle-adb', 'angle-adc'], relation: 'congruent', justification: 'correspondingParts', dependencies: ['triangles-sas'], interaction: 'select-consequence',
        prompt: 'Recupere outra consequência da congruência dos triângulos.', hint: 'Observe os ângulos correspondentes no vértice D.', answerOptions: [{ id: 'angles-at-d', label: '∠ADB ≅ ∠ADC' }, { id: 'opv-d', label: '∠ADB e ∠ADC são OPV' }, { id: 'base-angle', label: '∠ABC ≅ ∠ACB' }], expectedAnswerIds: ['angles-at-d'],
      }),
      step({
        id: 'collinear-bdc', statement: 'B, D e C são colineares', involvedObjects: ['point-d'], relation: 'collinear', justification: 'hypothesis', dependencies: [], interaction: 'complete-justification',
        prompt: 'De onde vem a colinearidade usada na próxima soma?', hint: 'Ela foi fornecida no enunciado.', justificationOptions: ['hypothesis', 'collinearity', 'definition'],
      }),
      step({
        id: 'linear-pair', statement: 'm(∠ADB) + m(∠ADC) = 180°', involvedObjects: ['angle-adb', 'angle-adc'], relation: 'supplementary', justification: 'supplementary', dependencies: ['angles-at-d', 'collinear-bdc'], interaction: 'order-cards',
        prompt: 'Ordene as peças lógicas que sustentam a soma de 180°.', hint: 'Primeiro a igualdade angular, depois a colinearidade, então a soma.',
        answerOptions: [{ id: 'angles-at-d', label: '∠ADB ≅ ∠ADC' }, { id: 'collinear-bdc', label: 'B, D, C colineares' }, { id: 'linear-pair', label: 'A soma é 180°' }], expectedAnswerIds: ['angles-at-d', 'collinear-bdc', 'linear-pair'],
        acceptedAlternatives: [{ answerIds: ['collinear-bdc', 'angles-at-d', 'linear-pair'] }],
      }),
      step({
        id: 'right-angles', statement: 'm(∠ADB) = m(∠ADC) = 90°', involvedObjects: ['angle-adb', 'angle-adc'], relation: 'equal-90', justification: 'algebra', dependencies: ['angles-at-d', 'linear-pair'], interaction: 'assemble-equation',
        prompt: 'Monte a equação que usa igualdade e soma para obter 90°.', hint: 'Se x = y e x + y = 180°, então 2x = 180°.',
        answerOptions: [{ id: 'equation-right', label: 'x = y; x + y = 180° ⇒ 2x = 180° ⇒ x = y = 90°' }, { id: 'equation-wrong', label: 'x + y = 180° ⇒ x = y' }, { id: 'equation-half', label: 'x = y ⇒ x + y = 90°' }], expectedAnswerIds: ['equation-right'],
      }),
      step({
        id: 'perpendicular-ad', statement: 'AD ⟂ BC', involvedObjects: ['segment-ad'], relation: 'perpendicular', justification: 'definition', dependencies: ['right-angles', 'collinear-bdc'], interaction: 'complete-justification',
        prompt: 'Qual definição converte os ângulos retos em perpendicularidade?', hint: 'Retas que formam um ângulo de 90° são perpendiculares.', justificationOptions: ['definition', 'supplementary', 'collinearity'],
      }),
      step({
        id: 'altitude-ad', statement: 'AD é altura de △ABC', involvedObjects: ['segment-ad', 'triangle-abc'], relation: 'altitude', justification: 'definition', dependencies: ['perpendicular-ad'], interaction: 'select-consequence',
        prompt: 'Finalize classificando AD pela perpendicularidade encontrada.', hint: 'A ceviana perpendicular ao lado oposto é uma altura.', answerOptions: [{ id: 'altitude-ad', label: 'AD é altura' }, { id: 'median-repeat', label: 'AD é apenas mediana' }, { id: 'external-line', label: 'AD é reta externa' }], expectedAnswerIds: ['altitude-ad'],
      }),
    ],
    debrief: 'A mesma congruência LAL gerou duas cadeias: uma para ponto médio/mediana e outra para ângulos retos/altura.',
    unlockSkillIds: ['isosceles-special-cevian'],
  },
  {
    id: 'asa-contradiction',
    title: 'A Sombra de F′',
    subtitle: 'Prova preparada · ALA por contradição',
    source: { origin: 'Complemento', reference: 'Derivação de ALA a partir de LAL' },
    hypothesis: ['Dois pares de ângulos correspondentes são congruentes', 'O lado compreendido é congruente'],
    thesis: 'Os triângulos são congruentes por ALA.',
    objects: [
      { id: 'segment-ac', kind: 'segment', label: 'AC' }, { id: 'segment-df', kind: 'segment', label: 'DF' },
      { id: 'segment-df-prime', kind: 'segment', label: 'DF′' }, { id: 'point-f-prime', kind: 'point', label: 'F′' },
      { id: 'triangle-abc', kind: 'triangle', label: '△ABC' }, { id: 'triangle-def', kind: 'triangle', label: '△DEF' },
    ],
    steps: [
      step({ id: 'audit-leap', statement: 'Não se pode concluir AC ≅ DF sem argumento', involvedObjects: ['segment-ac', 'segment-df'], relation: 'logical-audit', justification: 'contradiction', dependencies: [], interaction: 'find-invalid-step', prompt: 'Encontre o salto lógico no argumento ingênuo.', hint: 'ALA ainda está sendo provado; não pode ser usado como justificativa.', answerOptions: [{ id: 'invalid-asa', label: '“Os triângulos são congruentes por ALA”, antes de provar ALA' }, { id: 'valid-given', label: 'Registrar os ângulos dados' }, { id: 'valid-side', label: 'Registrar o lado compreendido dado' }], expectedAnswerIds: ['invalid-asa'] }),
      step({ id: 'assume-less', statement: 'Suponha AC < DF sem perda de generalidade', involvedObjects: ['segment-ac', 'segment-df'], relation: 'less-than', justification: 'contradiction', dependencies: ['audit-leap'], interaction: 'complete-justification', prompt: 'Qual estratégia autoriza a suposição AC < DF?', hint: 'A desigualdade oposta é simétrica ao trocar os triângulos.', justificationOptions: ['contradiction', 'hypothesis', 'algebra'] }),
      step({ id: 'construct-f-prime', statement: 'Construa F′ em DF com DF′ ≅ AC', involvedObjects: ['point-f-prime', 'segment-df-prime', 'segment-ac'], relation: 'construction', justification: 'definition', dependencies: ['assume-less'], optionalConstruction: 'F′ pertence ao interior de DF e DF′ ≅ AC', interaction: 'choose-construction', prompt: 'Escolha a construção auxiliar compatível com AC < DF.', hint: 'Transporte o comprimento AC para dentro de DF.', answerOptions: [{ id: 'construct-inside', label: 'F′ em DF, com DF′ ≅ AC' }, { id: 'construct-outside', label: 'F′ fora de DF, com FF′ ≅ AC' }, { id: 'construct-midpoint', label: 'F′ ponto médio de DF' }], expectedAnswerIds: ['construct-inside'] }),
      step({ id: 'aux-sas', statement: 'O triângulo auxiliar é congruente a △ABC por LAL', involvedObjects: ['triangle-abc'], relation: 'congruent', justification: 'LAL', dependencies: ['construct-f-prime'], interaction: 'select-consequence', prompt: 'Que critério usa o lado transportado e os dados originais?', hint: 'A construção fornece o segundo lado necessário.', answerOptions: [{ id: 'aux-sas', label: 'Congruência auxiliar por LAL' }, { id: 'aux-asa', label: 'Congruência auxiliar por ALA' }, { id: 'aux-sss', label: 'Congruência auxiliar por LLL' }], expectedAnswerIds: ['aux-sas'] }),
      step({ id: 'angular-conflict', statement: 'A congruência auxiliar contradiz a ordem dos ângulos em D', involvedObjects: ['point-f-prime'], relation: 'contradiction', justification: 'correspondingParts', dependencies: ['aux-sas'], interaction: 'select-consequence', prompt: 'Qual consequência produz o conflito angular?', hint: 'Use partes correspondentes e compare o raio DF′ com DF.', answerOptions: [{ id: 'angular-conflict', label: 'A igualdade angular força F′ e F a ocuparem o mesmo raio-limite' }, { id: 'length-conflict', label: 'AC passa a ser negativo' }, { id: 'no-conflict', label: 'Nenhuma contradição aparece' }], expectedAnswerIds: ['angular-conflict'] }),
      step({ id: 'same-point', statement: 'Logo F′ = F', involvedObjects: ['point-f-prime'], relation: 'equal-point', justification: 'contradiction', dependencies: ['angular-conflict'], interaction: 'complete-justification', prompt: 'Como a contradição encerra a hipótese AC < DF?', hint: 'O ponto construído não pode ser distinto de F.', justificationOptions: ['contradiction', 'transitivity', 'hypothesis'] }),
      step({ id: 'missing-side', statement: 'AC ≅ DF', involvedObjects: ['segment-ac', 'segment-df'], relation: 'congruent', justification: 'transitivity', dependencies: ['construct-f-prime', 'same-point'], interaction: 'select-consequence', prompt: 'Que igualdade de lados resulta de F′ = F?', hint: 'Substitua F′ por F em DF′ ≅ AC.', answerOptions: [{ id: 'missing-side', label: 'AC ≅ DF' }, { id: 'reverse-less', label: 'AC > DF' }, { id: 'zero-side', label: 'DF = 0' }], expectedAnswerIds: ['missing-side'] }),
      step({ id: 'final-sas', statement: 'Os triângulos originais são congruentes por LAL', involvedObjects: ['triangle-abc', 'triangle-def'], relation: 'congruent', justification: 'LAL', dependencies: ['missing-side'], interaction: 'select-consequence', prompt: 'Use o lado recuperado para concluir a prova.', hint: 'Agora há dois lados e o ângulo compreendido para uma aplicação de LAL.', answerOptions: [{ id: 'final-sas', label: 'Aplicar LAL aos triângulos originais' }, { id: 'final-ala', label: 'Invocar ALA sem redução' }, { id: 'final-none', label: 'A contradição não produz conclusão' }], expectedAnswerIds: ['final-sas'] }),
    ],
    debrief: 'A prova não pressupõe ALA: ela fabrica o lado ausente, elimina por contradição a possibilidade de desigualdade e reduz o caso a LAL.',
    unlockSkillIds: ['asa'],
  },
];

assertValidProofs(proofs);

export function findProof(id: string) {
  return proofs.find((proof) => proof.id === id);
}
