import type { CodexEntry, Encounter, Region, Skill } from '../types/domain';

interface ContentBundle {
  skills: Skill[];
  regions: Region[];
  encounters: Encounter[];
  codexEntries: CodexEntry[];
  assetManifest: Record<string, string>;
}

function findDuplicates(values: string[]) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

export function validateContent(bundle: ContentBundle) {
  const errors: string[] = [];
  const { skills, regions, encounters, codexEntries, assetManifest } = bundle;
  const skillIds = new Set(skills.map((skill) => skill.id));
  const regionIds = new Set(regions.map((region) => region.id));
  const encounterIds = new Set(encounters.map((encounter) => encounter.id));
  const codexIds = new Set(codexEntries.map((entry) => entry.id));

  for (const [label, ids] of [
    ['skill', skills.map((item) => item.id)],
    ['region', regions.map((item) => item.id)],
    ['encounter', encounters.map((item) => item.id)],
    ['codex', codexEntries.map((item) => item.id)],
  ] as const) {
    const duplicates = findDuplicates(ids);
    if (duplicates.length) errors.push(`IDs duplicados em ${label}: ${duplicates.join(', ')}`);
  }

  for (const skill of skills) {
    if (!regionIds.has(skill.regionId)) errors.push(`${skill.id}: região inexistente ${skill.regionId}`);
    if (!codexIds.has(skill.codexEntryId)) errors.push(`${skill.id}: Codex inexistente ${skill.codexEntryId}`);
    if (!(skill.assetKey in assetManifest)) errors.push(`${skill.id}: asset inexistente ${skill.assetKey}`);
    if (!skill.sourceRefs.length) errors.push(`${skill.id}: origem não registrada`);
    if (!skill.masteryDimensions.length) errors.push(`${skill.id}: dimensões de domínio vazias`);
    for (const prerequisite of skill.prerequisites) {
      if (!skillIds.has(prerequisite)) errors.push(`${skill.id}: pré-requisito inexistente ${prerequisite}`);
      const parent = skills.find((candidate) => candidate.id === prerequisite);
      if (parent && !parent.unlocks.includes(skill.id)) errors.push(`${prerequisite}: unlock ausente para ${skill.id}`);
    }
    for (const unlock of skill.unlocks) {
      const child = skills.find((candidate) => candidate.id === unlock);
      if (!child) errors.push(`${skill.id}: unlock inexistente ${unlock}`);
      else if (!child.prerequisites.includes(skill.id)) errors.push(`${skill.id}: unlock sem pré-requisito inverso em ${unlock}`);
    }
  }

  const visitState = new Map<string, 'visiting' | 'visited'>();
  const visit = (skillId: string, path: string[]) => {
    if (visitState.get(skillId) === 'visiting') {
      errors.push(`Ciclo de skills: ${[...path, skillId].join(' -> ')}`);
      return;
    }
    if (visitState.get(skillId) === 'visited') return;
    visitState.set(skillId, 'visiting');
    const skill = skills.find((candidate) => candidate.id === skillId);
    skill?.prerequisites.forEach((id) => visit(id, [...path, skillId]));
    visitState.set(skillId, 'visited');
  };
  skills.forEach((skill) => visit(skill.id, []));

  for (const region of regions) {
    if (findDuplicates(region.skillIds).length) errors.push(`${region.id}: skills duplicadas`);
    if (findDuplicates(region.encounterIds).length) errors.push(`${region.id}: encounters duplicados`);
    for (const id of region.skillIds) {
      if (!skillIds.has(id)) errors.push(`${region.id}: skill inexistente ${id}`);
      const skill = skills.find((candidate) => candidate.id === id);
      if (skill && skill.regionId !== region.id) errors.push(`${region.id}: skill ${id} pertence a ${skill.regionId}`);
    }
    for (const id of region.encounterIds) {
      if (!encounterIds.has(id)) errors.push(`${region.id}: encounter inexistente ${id}`);
      const encounter = encounters.find((candidate) => candidate.id === id);
      if (encounter && encounter.regionId !== region.id) errors.push(`${region.id}: encounter ${id} pertence a ${encounter.regionId}`);
    }
  }

  for (const skill of skills) {
    const region = regions.find((candidate) => candidate.id === skill.regionId);
    if (region && !region.skillIds.includes(skill.id)) errors.push(`${skill.id}: ausente da lista de skills da região ${skill.regionId}`);
  }

  for (const encounter of encounters) {
    const region = regions.find((candidate) => candidate.id === encounter.regionId);
    if (region && !region.encounterIds.includes(encounter.id)) errors.push(`${encounter.id}: ausente da lista de encounters da região ${encounter.regionId}`);
  }

  for (const encounter of encounters) {
    if (!regionIds.has(encounter.regionId)) errors.push(`${encounter.id}: região inexistente ${encounter.regionId}`);
    if (!(encounter.assetKey in assetManifest)) errors.push(`${encounter.id}: asset inexistente ${encounter.assetKey}`);
    for (const id of [...encounter.requires, ...encounter.teaches, ...encounter.reinforces]) {
      if (!skillIds.has(id)) errors.push(`${encounter.id}: referência de skill inexistente ${id}`);
    }
    for (const id of encounter.recoveryEncounters) {
      if (!encounterIds.has(id)) errors.push(`${encounter.id}: recovery encounter inexistente ${id}`);
    }
    for (const id of [...encounter.inventorySkillIds, ...encounter.unlockSkillIds]) {
      if (!skillIds.has(id)) errors.push(`${encounter.id}: skill de gameplay inexistente ${id}`);
    }
    const relationIds = new Set(encounter.relations.map((relation) => relation.id));
    const objectIds = new Set(encounter.objects.map((object) => object.id));
    const justificationIds = new Set(encounter.justifications.map((item) => item.id));
    if (objectIds.size !== encounter.objects.length) errors.push(`${encounter.id}: objetos com IDs duplicados`);
    if (relationIds.size !== encounter.relations.length) errors.push(`${encounter.id}: relações com IDs duplicados`);
    if (justificationIds.size !== encounter.justifications.length) errors.push(`${encounter.id}: justificativas com IDs duplicados`);
    for (const relation of encounter.relations) {
      if (!relation.objectIds.length) errors.push(`${encounter.id}/${relation.id}: relação sem objetos`);
      for (const id of relation.objectIds) if (!objectIds.has(id)) errors.push(`${encounter.id}/${relation.id}: objeto inexistente ${id}`);
    }
    for (const justification of encounter.justifications) {
      if (justification.skillId && !skillIds.has(justification.skillId)) errors.push(`${encounter.id}/${justification.id}: skill inexistente ${justification.skillId}`);
    }
    for (const id of [...encounter.initialRelationIds, ...encounter.completionRelationIds]) {
      if (!relationIds.has(id)) errors.push(`${encounter.id}: relação de gameplay inexistente ${id}`);
    }
    for (const rule of encounter.applicationRules) {
      if (!skillIds.has(rule.skillId)) errors.push(`${encounter.id}/${rule.id}: skill inexistente ${rule.skillId}`);
      for (const id of rule.objectIds) if (!objectIds.has(id)) errors.push(`${encounter.id}/${rule.id}: objeto inexistente ${id}`);
      for (const id of [...rule.requiresRelationIds, ...rule.producesRelationIds]) {
        if (!relationIds.has(id)) errors.push(`${encounter.id}/${rule.id}: relação inexistente ${id}`);
      }
      for (const kind of ['wrong-skill', 'wrong-objects', 'wrong-order', 'missing-relation'] as const) {
        if (!rule.semanticErrors.some((error) => error.when === kind)) errors.push(`${encounter.id}/${rule.id}: feedback semântico ausente para ${kind}`);
      }
    }
    const stepIds = encounter.steps.map((step) => step.id);
    if (findDuplicates(stepIds).length) errors.push(`${encounter.id}: IDs de steps duplicados`);
    for (const id of encounter.completionRules.requiredStepIds) {
      if (!stepIds.includes(id)) errors.push(`${encounter.id}: completion step inexistente ${id}`);
    }
    if (encounter.completionRules.minimumCorrectSteps > encounter.steps.length) {
      errors.push(`${encounter.id}: minimumCorrectSteps maior que a quantidade de steps`);
    }
    const optionIds = new Set([
      ...encounter.objects.map((item) => item.id),
      ...encounter.relations.map((item) => item.id),
      ...encounter.justifications.map((item) => item.id),
    ]);
    for (const step of encounter.steps) {
      for (const id of step.objectIds ?? []) if (!objectIds.has(id)) errors.push(`${encounter.id}/${step.id}: objeto de step inexistente ${id}`);
      for (const id of step.relationIds ?? []) if (!relationIds.has(id)) errors.push(`${encounter.id}/${step.id}: relação de step inexistente ${id}`);
      for (const id of step.justificationIds ?? []) if (!justificationIds.has(id)) errors.push(`${encounter.id}/${step.id}: justificativa de step inexistente ${id}`);
      for (const id of step.expectedIds) if (!optionIds.has(id)) errors.push(`${encounter.id}/${step.id}: resposta inexistente ${id}`);
    }

    if (encounter.completionRules.minimumCorrectSteps < 1) errors.push(`${encounter.id}: minimumCorrectSteps deve ser positivo`);
    if (encounter.completionRules.requiredStepIds.length < encounter.completionRules.minimumCorrectSteps) {
      errors.push(`${encounter.id}: minimumCorrectSteps excede os steps obrigatórios`);
    }

    const reachableRelations = new Set(encounter.initialRelationIds);
    let changed = true;
    while (changed) {
      changed = false;
      for (const rule of encounter.applicationRules) {
        if (!rule.requiresRelationIds.every((id) => reachableRelations.has(id))) continue;
        for (const produced of rule.producesRelationIds) {
          if (reachableRelations.has(produced)) continue;
          reachableRelations.add(produced);
          changed = true;
        }
      }
    }
    for (const id of encounter.completionRelationIds) {
      if (!reachableRelations.has(id)) errors.push(`${encounter.id}: relação de conclusão inalcançável ${id}`);
    }
  }

  for (const entry of codexEntries) {
    if (!skillIds.has(entry.skillId)) errors.push(`${entry.id}: skill inexistente ${entry.skillId}`);
    const skill = skills.find((candidate) => candidate.id === entry.skillId);
    if (skill?.codexEntryId !== entry.id) errors.push(`${entry.id}: vínculo de Codex inconsistente`);
  }

  return errors;
}

export function assertValidContent(bundle: ContentBundle) {
  const errors = validateContent(bundle);
  if (errors.length) throw new Error(`Conteúdo inválido:\n${errors.join('\n')}`);
}
