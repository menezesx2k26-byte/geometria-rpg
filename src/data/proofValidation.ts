import type { Proof } from '../types/domain';

export function validateProofs(proofs: Proof[]) {
  const errors: string[] = [];
  const proofIds = proofs.map((proof) => proof.id);
  if (new Set(proofIds).size !== proofIds.length) errors.push('Há IDs de provas duplicados.');

  for (const proof of proofs) {
    const stepIds = proof.steps.map((step) => step.id);
    const objectIds = new Set(proof.objects.map((object) => object.id));
    if (new Set(stepIds).size !== stepIds.length) errors.push(`${proof.id}: IDs de passos duplicados.`);
    const states = new Map<string, 'visiting' | 'visited'>();
    const visit = (id: string, path: string[]) => {
      if (states.get(id) === 'visiting') {
        errors.push(`${proof.id}: ciclo de dependências ${[...path, id].join(' -> ')}`);
        return;
      }
      if (states.get(id) === 'visited') return;
      states.set(id, 'visiting');
      proof.steps.find((step) => step.id === id)?.dependencies.forEach((dependency) => visit(dependency, [...path, id]));
      states.set(id, 'visited');
    };

    for (const step of proof.steps) {
      for (const dependency of step.dependencies) {
        if (!stepIds.includes(dependency)) errors.push(`${proof.id}/${step.id}: dependência inexistente ${dependency}`);
      }
      for (const objectId of step.involvedObjects) {
        if (!objectIds.has(objectId)) errors.push(`${proof.id}/${step.id}: objeto inexistente ${objectId}`);
      }
      const answerIds = new Set(step.answerOptions.map((answer) => answer.id));
      for (const answerId of step.expectedAnswerIds) {
        if (!answerIds.has(answerId)) errors.push(`${proof.id}/${step.id}: resposta inexistente ${answerId}`);
      }
      if (!step.prompt || !step.hint || !step.statement || !step.relation) errors.push(`${proof.id}/${step.id}: metadados incompletos`);
      visit(step.id, []);
    }
  }
  return errors;
}

export function assertValidProofs(proofs: Proof[]) {
  const errors = validateProofs(proofs);
  if (errors.length) throw new Error(`Provas inválidas:\n${errors.join('\n')}`);
}
