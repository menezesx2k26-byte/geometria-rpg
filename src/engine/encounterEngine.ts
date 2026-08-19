import type { Encounter, EncounterApplicationRule, SemanticErrorRule } from '../types/domain';
import { matchesUnorderedGroups, sameMembers } from './answerAcceptance';

export interface ApplicationResult {
  correct: boolean;
  kind: 'accepted' | 'complete' | 'no-skill' | 'wrong-skill' | 'missing-relation' | 'wrong-order' | 'wrong-objects';
  message: string;
  ruleId?: string;
  producedRelationIds: string[];
}

const semanticObjectGroups: Readonly<Record<string, readonly (readonly string[])[]>> = {
  'rule-correspondence': [['vertex-a', 'vertex-d'], ['vertex-b', 'vertex-e'], ['vertex-c', 'vertex-f']],
  'rule-side-correspondence': [['side-ab', 'side-de'], ['side-bc', 'side-ef'], ['side-ac', 'side-df']],
  'rule-angle-correspondence': [['angle-a', 'angle-d'], ['angle-b', 'angle-e'], ['angle-c', 'angle-f']],
};

function semanticMessage(rule: EncounterApplicationRule, kind: SemanticErrorRule['when']) {
  return rule.semanticErrors.find((error) => error.when === kind)?.message ?? 'A aplicação ainda não é válida.';
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
    return { correct: false, kind: 'complete', message: 'Todas as relações necessárias já foram registradas.', producedRelationIds: [] };
  }
  if (!selectedSkillId) {
    return { correct: false, kind: 'no-skill', message: 'Escolha uma skill do inventário antes de selecionar os objetos.', producedRelationIds: [] };
  }

  const rule = pendingRules.find((candidate) => candidate.skillId === selectedSkillId) ?? pendingRules[0];
  if (!rule) return { correct: false, kind: 'complete', message: 'Nenhuma aplicação está disponível neste momento.', producedRelationIds: [] };
  if (rule.skillId !== selectedSkillId) {
    return { correct: false, kind: 'wrong-skill', message: semanticMessage(rule, 'wrong-skill'), ruleId: rule.id, producedRelationIds: [] };
  }
  const missingRelations = rule.requiresRelationIds.filter((id) => !knownRelationIds.includes(id));
  if (missingRelations.length) {
    return { correct: false, kind: 'missing-relation', message: semanticMessage(rule, 'missing-relation'), ruleId: rule.id, producedRelationIds: [] };
  }

  const groups = semanticObjectGroups[rule.id];
  if (groups) {
    if (!matchesUnorderedGroups(selectedObjectIds, groups)) {
      const errorKind = sameMembers(rule.objectIds, selectedObjectIds) ? 'wrong-order' : 'wrong-objects';
      return { correct: false, kind: errorKind, message: semanticMessage(rule, errorKind), ruleId: rule.id, producedRelationIds: [] };
    }
  } else if (rule.orderMatters) {
    const exactOrder = rule.objectIds.length === selectedObjectIds.length && rule.objectIds.every((id, index) => selectedObjectIds[index] === id);
    if (!exactOrder) {
      const errorKind = sameMembers(rule.objectIds, selectedObjectIds) ? 'wrong-order' : 'wrong-objects';
      return { correct: false, kind: errorKind, message: semanticMessage(rule, errorKind), ruleId: rule.id, producedRelationIds: [] };
    }
  } else if (!sameMembers(rule.objectIds, selectedObjectIds)) {
    return { correct: false, kind: 'wrong-objects', message: semanticMessage(rule, 'wrong-objects'), ruleId: rule.id, producedRelationIds: [] };
  }

  return { correct: true, kind: 'accepted', message: rule.successMessage, ruleId: rule.id, producedRelationIds: rule.producesRelationIds };
}
