import type { Proof, ProofJustification, ProofStep, ProofStepAlternative } from '../types/domain';

export const justificationLabels: Record<ProofJustification, string> = {
  hypothesis: 'Hipótese',
  definition: 'Definição',
  reflexivity: 'Reflexividade',
  OPV: 'Ângulos opostos pelo vértice',
  midpoint: 'Definição de ponto médio',
  angleBisector: 'Definição de bissetriz',
  parallelCorresponding: 'Ângulos correspondentes em paralelas',
  alternateInterior: 'Ângulos alternos internos em paralelas',
  parallelConverse: 'Conversa do teorema de paralelismo',
  perpendicular: 'Definição de perpendicularidade',
  collinearity: 'Colinearidade',
  supplementary: 'Ângulos suplementares',
  complementary: 'Ângulos complementares',
  LAL: 'Lado–Ângulo–Lado',
  ALA: 'Ângulo–Lado–Ângulo',
  LLL: 'Lado–Lado–Lado',
  correspondingParts: 'Partes correspondentes',
  isoscelesTheorem: 'Teorema do isósceles',
  parallelogramProperty: 'Propriedade do paralelogramo',
  distanceFormula: 'Fórmula da distância',
  triangleAngleSum: 'Soma dos ângulos do triângulo',
  transitivity: 'Transitividade',
  contradiction: 'Contradição',
  algebra: 'Álgebra',
};

export interface ProofCandidate {
  involvedObjects: string[];
  relation?: string;
  justification?: ProofJustification;
  answerIds: string[];
}

export interface ProofValidationResult {
  correct: boolean;
  kind: 'accepted' | 'logical-jump' | 'objects' | 'relation' | 'justification' | 'answer';
  message: string;
}

function sameMembers(left: string[], right: string[]) {
  return left.length === right.length && left.every((id) => right.includes(id));
}

function orderedEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((id, index) => right[index] === id);
}

function matchesAlternative(step: ProofStep, candidate: ProofCandidate, alternative: ProofStepAlternative) {
  if (step.interaction === 'build-step') {
    return sameMembers(alternative.involvedObjects ?? step.involvedObjects, candidate.involvedObjects) &&
      (alternative.relation ?? step.relation) === candidate.relation &&
      (alternative.justification ?? step.justification) === candidate.justification;
  }
  if (step.interaction === 'complete-justification') {
    return (alternative.justification ?? step.justification) === candidate.justification;
  }
  const answers = alternative.answerIds ?? step.expectedAnswerIds;
  return step.interaction === 'order-cards'
    ? orderedEqual(answers, candidate.answerIds)
    : sameMembers(answers, candidate.answerIds);
}

export function validateProofStep(
  proof: Proof,
  step: ProofStep,
  completedStepIds: string[],
  candidate: ProofCandidate,
): ProofValidationResult {
  const missingDependencies = step.dependencies.filter((id) => !completedStepIds.includes(id));
  if (missingDependencies.length) {
    const missingStatements = missingDependencies
      .map((id) => proof.steps.find((item) => item.id === id)?.statement ?? id)
      .join(' · ');
    return {
      correct: false,
      kind: 'logical-jump',
      message: `Salto lógico: antes deste passo, ainda falta estabelecer “${missingStatements}”.`,
    };
  }

  if (step.acceptedAlternatives.some((alternative) => matchesAlternative(step, candidate, alternative))) {
    return { correct: true, kind: 'accepted', message: 'Alternativa equivalente aceita. O encadeamento permanece válido.' };
  }

  if (step.interaction === 'build-step') {
    if (!sameMembers(step.involvedObjects, candidate.involvedObjects)) {
      return { correct: false, kind: 'objects', message: 'Os objetos selecionados não sustentam esta afirmação.' };
    }
    if (candidate.relation !== step.relation) {
      return { correct: false, kind: 'relation', message: 'A relação escolhida não corresponde às marcas ou hipóteses disponíveis.' };
    }
    if (candidate.justification !== step.justification) {
      return { correct: false, kind: 'justification', message: 'A afirmação pode parecer correta, mas essa justificativa não a prova.' };
    }
  } else if (step.interaction === 'complete-justification') {
    if (candidate.justification !== step.justification) {
      return { correct: false, kind: 'justification', message: 'A justificativa não conecta este passo às informações já estabelecidas.' };
    }
  } else {
    const correctAnswer = step.interaction === 'order-cards'
      ? orderedEqual(step.expectedAnswerIds, candidate.answerIds)
      : sameMembers(step.expectedAnswerIds, candidate.answerIds);
    if (!correctAnswer) {
      const message = step.interaction === 'order-cards'
        ? 'A ordem cria uma dependência circular ou usa uma consequência antes de sua causa.'
        : step.interaction === 'find-invalid-step'
          ? 'Esse passo é justificável; procure a afirmação que usa um resultado ainda não provado.'
          : 'Essa escolha não é consequência suficiente das etapas disponíveis.';
      return { correct: false, kind: 'answer', message };
    }
  }

  return { correct: true, kind: 'accepted', message: `Passo validado: ${step.statement}` };
}

export function nextReadyProofStep(proof: Proof, completedStepIds: string[]) {
  return proof.steps.find(
    (step) =>
      !completedStepIds.includes(step.id) &&
      step.dependencies.every((id) => completedStepIds.includes(id)),
  );
}
