import { competencyCatalog, hardCompetencyIds } from './competencies';
import { challengeProfiles } from './challengeProfiles';

export function validateCompetencyData() {
  const errors: string[] = [];
  const competencyIds = competencyCatalog.map((item) => item.id);
  const ids = new Set(competencyIds);
  const profileIds = challengeProfiles.map((item) => item.id);
  const hardIds = new Set(competencyCatalog.filter((item) => item.kind === 'hard').map((item) => item.id));
  const softIds = new Set(competencyCatalog.filter((item) => item.kind === 'soft').map((item) => item.id));
  const prerequisiteIds = new Set(competencyCatalog.filter((item) => item.kind === 'prerequisite').map((item) => item.id));
  if (ids.size !== competencyIds.length) errors.push('O catálogo possui IDs de competência duplicados.');
  if (new Set(profileIds).size !== profileIds.length) errors.push('Existem challenge profiles com IDs duplicados.');
  if (hardCompetencyIds.length !== 15) errors.push('O catálogo deve conter H1–H15.');
  if (competencyCatalog.filter((item) => item.kind === 'soft').length !== 7) errors.push('O catálogo deve conter S1–S7.');
  if (competencyCatalog.filter((item) => item.kind === 'prerequisite').length !== 10) errors.push('O catálogo deve conter P1–P10.');

  for (const item of competencyCatalog) {
    if (!item.name.trim() || !item.description.trim()) errors.push(`${item.id}: definição incompleta.`);
  }

  for (const item of challengeProfiles) {
    const rubricValues = Object.values(item.rubric);
    const rubricSum = rubricValues.reduce((sum, value) => sum + value, 0);
    const boundIds = item.hardSkills.map((skill) => skill.id);
    if (new Set(boundIds).size !== boundIds.length) errors.push(`${item.id}: competência hard vinculada mais de uma vez.`);
    if (!item.rpg.route.startsWith('/')) errors.push(`${item.id}: rota RPG deve ser absoluta.`);
    if (!Number.isFinite(item.rpg.xp) || item.rpg.xp < 0) errors.push(`${item.id}: XP RPG inválido.`);
    if (rubricValues.some((value) => !Number.isFinite(value) || value < 0)) errors.push(`${item.id}: rubrica contém peso inválido.`);
    if (Math.abs(rubricSum - 1) > 0.000001) errors.push(`${item.id}: pesos da rubrica não somam 1.`);
    if (!item.hardSkills.some((skill) => skill.role === 'primary')) errors.push(`${item.id}: não possui competência primária.`);
    if (!item.difficultyRationale.trim()) errors.push(`${item.id}: dificuldade sem justificativa.`);
    for (const skill of item.hardSkills) {
      if (!hardIds.has(skill.id)) errors.push(`${item.id}: competência hard desconhecida ${skill.id}.`);
      if (skill.weight <= 0 || skill.weight > 1 || !Number.isFinite(skill.weight)) errors.push(`${item.id}: peso inválido para ${skill.id}.`);
      if (!skill.assessedDimensions.length) errors.push(`${item.id}: ${skill.id} sem dimensões avaliadas.`);
      if (new Set(skill.assessedDimensions).size !== skill.assessedDimensions.length) errors.push(`${item.id}: ${skill.id} repete dimensões avaliadas.`);
    }
    for (const prerequisite of item.prerequisites) {
      if (!prerequisiteIds.has(prerequisite)) errors.push(`${item.id}: pré-requisito desconhecido ${prerequisite}.`);
    }
    if (new Set(item.prerequisites).size !== item.prerequisites.length) errors.push(`${item.id}: pré-requisitos duplicados.`);
    const softSkillIds = item.softSkills.map((skill) => skill.id);
    if (new Set(softSkillIds).size !== softSkillIds.length) errors.push(`${item.id}: competências soft duplicadas.`);
    for (const softSkill of item.softSkills) {
      if (!softIds.has(softSkill.id)) errors.push(`${item.id}: competência soft desconhecida ${softSkill.id}.`);
      if (!softSkill.event.trim() || !softSkill.evidenceRule.trim()) errors.push(`${item.id}: regra soft incompleta para ${softSkill.id}.`);
    }
    if (item.status === 'ready' && item.source.sourceStatus !== 'defined') errors.push(`${item.id}: profile ready sem fonte definida.`);
    if (item.source.sourceMode === 'standard_example' && (!item.source.synthetic || item.source.sourceItem !== null)) {
      errors.push(`${item.id}: exemplo padrão precisa ser sintético e sem item de lista.`);
    }
    if (item.rpg.questType === 'prova' && (!item.proofSpecId || item.rubric.justification <= 0)) {
      errors.push(`${item.id}: prova sem proofSpec ou peso de justificação.`);
    }
  }

  return errors;
}
