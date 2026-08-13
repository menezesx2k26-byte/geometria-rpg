import type { Encounter, EncounterApplicationRule, SemanticErrorRule } from '../types/domain';

export interface ApplicationResult {
  correct: boolean;
  message: string;
  ruleId?: string;
  producedRelationIds: string[];
}

function semanticMessage(rule: EncounterApplicationRule, kind: SemanticErrorRule['when']) {
  return rule.semanticErrors.find((error) => error.when === kind)?.message ?? 'A aplicação ainda não é válida.';
}

function sameMembers(left: string[], right: string[]) {
  return left.length === right.length && left.every((id) => right.includes(id));
}

export function validateApplication(
  encounter: Encounter,
  knownRelationIds: string[],
  selectedSkillId: string | undefined,
  selectedObjectIds: string[],
): ApplicationResult {
  const pendingRules = encounter.applicationRules.filter(
    (rule) => !rule.producesRelationIds.every((id) => knownRelationIds.includes(id)),
  );
  if (!pendingRules.length) {
    return { correct: false, message: 'Todas as relações necessárias já foram registradas.', producedRelationIds: [] };
  }

  if (!selectedSkillId) {
    return { correct: false, message: 'Escolha uma skill do inventário antes de selecionar os objetos.', producedRelationIds: [] };
  }

  const rule = pendingRules.find((candidate) => candidate.skillId === selectedSkillId) ?? pendingRules[0];
  if (!rule) {
    return { correct: false, message: 'Nenhuma aplicação está disponível neste momento.', producedRelationIds: [] };
  }
  if (rule.skillId !== selectedSkillId) {
    return { correct: false, message: semanticMessage(rule, 'wrong-skill'), ruleId: rule.id, producedRelationIds: [] };
  }

  const missingRelations = rule.requiresRelationIds.filter((id) => !knownRelationIds.includes(id));
  if (missingRelations.length) {
    return { correct: false, message: semanticMessage(rule, 'missing-relation'), ruleId: rule.id, producedRelationIds: [] };
  }

  if (rule.orderMatters) {
    const exactOrder = rule.objectIds.every((id, index) => selectedObjectIds[index] === id) && selectedObjectIds.length === rule.objectIds.length;
    if (!exactOrder) {
      const errorKind = sameMembers(rule.objectIds, selectedObjectIds) ? 'wrong-order' : 'wrong-objects';
      return { correct: false, message: semanticMessage(rule, errorKind), ruleId: rule.id, producedRelationIds: [] };
    }
  } else if (!sameMembers(rule.objectIds, selectedObjectIds)) {
    return { correct: false, message: semanticMessage(rule, 'wrong-objects'), ruleId: rule.id, producedRelationIds: [] };
  }

  return {
    correct: true,
    message: rule.successMessage,
    ruleId: rule.id,
    producedRelationIds: rule.producesRelationIds,
  };
}
