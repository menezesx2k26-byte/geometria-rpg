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
    for (const id of region.skillIds) if (!skillIds.has(id)) errors.push(`${region.id}: skill inexistente ${id}`);
    for (const id of region.encounterIds) if (!encounterIds.has(id)) errors.push(`${region.id}: encounter inexistente ${id}`);
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
      for (const id of step.expectedIds) if (!optionIds.has(id)) errors.push(`${encounter.id}/${step.id}: resposta inexistente ${id}`);
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
