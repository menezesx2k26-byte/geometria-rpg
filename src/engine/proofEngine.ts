import type { Proof, ProofJustification, ProofStep, ProofStepAlternative } from '../types/domain';
import { sameMembers } from './answerAcceptance';

export const justificationLabels: Record<ProofJustification, string> = {
  hypothesis: 'Hipótese', definition: 'Definição', reflexivity: 'Reflexividade', OPV: 'Ângulos opostos pelo vértice',
  midpoint: 'Definição de ponto médio', angleBisector: 'Definição de bissetriz', parallelCorresponding: 'Ângulos correspondentes em paralelas',
  alternateInterior: 'Ângulos alternos internos em paralelas', parallelConverse: 'Conversa do teorema de paralelismo',
  perpendicular: 'Definição de perpendicularidade', collinearity: 'Colinearidade', supplementary: 'Ângulos suplementares',
  complementary: 'Ângulos complementares', LAL: 'Lado–Ângulo–Lado', ALA: 'Ângulo–Lado–Ângulo', LLL: 'Lado–Lado–Lado',
  correspondingParts: 'Partes correspondentes', isoscelesTheorem: 'Teorema do isósceles', parallelogramProperty: 'Propriedade do paralelogramo',
  distanceFormula: 'Fórmula da distância', triangleAngleSum: 'Soma dos ângulos do triângulo', transitivity: 'Transitividade',
  contradiction: 'Contradição', algebra: 'Álgebra',
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

function orderedEqual(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((id, index) => right[index] === id);
}

function equivalentJustification(expected: ProofJustification | undefined, actual: ProofJustification | undefined) {
  if (expected === actual) return true;
  return actual === 'definition' && ['midpoint', 'angleBisector', 'perpendicular'].includes(expected ?? '');
}

function matchesAlternative(step: ProofStep, candidate: ProofCandidate, alternative: ProofStepAlternative) {
  if (step.interaction === 'build-step') {
    return sameMembers(alternative.involvedObjects ?? step.involvedObjects, candidate.involvedObjects) &&
      (alternative.relation ?? step.relation) === candidate.relation &&
      equivalentJustification(alternative.justification ?? step.justification, candidate.justification);
  }
  if (step.interaction === 'complete-justification') {
    return equivalentJustification(alternative.justification ?? step.justification, candidate.justification);
  }
  const answers = alternative.answerIds ?? step.expectedAnswerIds;
  return step.interaction === 'order-cards' ? orderedEqual(answers, candidate.answerIds) : sameMembers(answers, candidate.answerIds);
}

function isTopologicallyValidCardOrder(proof: Proof, step: ProofStep, answerIds: readonly string[]) {
  if (!sameMembers(step.expectedAnswerIds, answerIds)) return false;
  const position = new Map(answerIds.map((id, index) => [id, index]));
  for (const id of answerIds) {
    const referencedStep = proof.steps.find((candidate) => candidate.id === id);
    if (!referencedStep) continue;
    const currentPosition = position.get(id) ?? -1;
    for (const dependency of referencedStep.dependencies) {
      const dependencyPosition = position.get(dependency);
      if (dependencyPosition !== undefined && dependencyPosition > currentPosition) return false;
    }
  }
  const conclusionPosition = position.get(step.id);
  if (conclusionPosition !== undefined) {
    for (const dependency of step.dependencies) {
      const dependencyPosition = position.get(dependency);
      if (dependencyPosition !== undefined && dependencyPosition > conclusionPosition) return false;
    }
  }
  return true;
}

export function validateProofStep(proof: Proof, step: ProofStep, completedStepIds: string[], candidate: ProofCandidate): ProofValidationResult {
  const missingDependencies = step.dependencies.filter((id) => !completedStepIds.includes(id));
  if (missingDependencies.length) {
    const missingStatements = missingDependencies.map((id) => proof.steps.find((item) => item.id === id)?.statement ?? id).join(' · ');
    return { correct: false, kind: 'logical-jump', message: `Salto lógico: antes deste passo, ainda falta estabelecer “${missingStatements}”.` };
  }

  if (step.acceptedAlternatives.some((alternative) => matchesAlternative(step, candidate, alternative))) {
    return { correct: true, kind: 'accepted', message: 'Alternativa equivalente aceita. O encadeamento permanece válido.' };
  }

  if (step.interaction === 'build-step') {
    if (!sameMembers(step.involvedObjects, candidate.involvedObjects)) return { correct: false, kind: 'objects', message: 'Os objetos selecionados não sustentam esta afirmação.' };
    if (candidate.relation !== step.relation) return { correct: false, kind: 'relation', message: 'A relação escolhida não corresponde às marcas ou hipóteses disponíveis.' };
    if (!equivalentJustification(step.justification, candidate.justification)) return { correct: false, kind: 'justification', message: 'A afirmação pode parecer correta, mas essa justificativa não a prova.' };
  } else if (step.interaction === 'complete-justification') {
    if (!equivalentJustification(step.justification, candidate.justification)) return { correct: false, kind: 'justification', message: 'A justificativa não conecta este passo às informações já estabelecidas.' };
  } else {
    const correctAnswer = step.interaction === 'order-cards'
      ? isTopologicallyValidCardOrder(proof, step, candidate.answerIds)
      : sameMembers(step.expectedAnswerIds, candidate.answerIds);
    if (!correctAnswer) {
      const message = step.interaction === 'order-cards'
        ? 'A ordem usa uma consequência antes de uma dependência necessária.'
        : step.interaction === 'find-invalid-step'
          ? 'Esse passo é justificável; procure a afirmação que usa um resultado ainda não provado.'
          : 'Essa escolha não é consequência suficiente das etapas disponíveis.';
      return { correct: false, kind: 'answer', message };
    }
  }

  return { correct: true, kind: 'accepted', message: `Passo validado: ${step.statement}` };
}

export function nextReadyProofStep(proof: Proof, completedStepIds: string[]) {
  return proof.steps.find((step) => !completedStepIds.includes(step.id) && step.dependencies.every((id) => completedStepIds.includes(id)));
}
