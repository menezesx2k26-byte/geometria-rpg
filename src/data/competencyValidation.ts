import { competencyCatalog, hardCompetencyIds } from './competencies';
import { challengeProfiles } from './challengeProfiles';

export function validateCompetencyData() {
  const errors: string[] = [];
  const ids = new Set(competencyCatalog.map((item) => item.id));
  if (hardCompetencyIds.length !== 15) errors.push('O catálogo deve conter H1–H15.');
  if (competencyCatalog.filter((item) => item.kind === 'soft').length !== 7) errors.push('O catálogo deve conter S1–S7.');
  if (competencyCatalog.filter((item) => item.kind === 'prerequisite').length !== 10) errors.push('O catálogo deve conter P1–P10.');

  for (const item of competencyCatalog) {
    if (!item.name.trim() || !item.description.trim()) errors.push(`${item.id}: definição incompleta.`);
  }

  for (const item of challengeProfiles) {
    const rubricSum = Object.values(item.rubric).reduce((sum, value) => sum + value, 0);
    if (Math.abs(rubricSum - 1) > 0.000001) errors.push(`${item.id}: pesos da rubrica não somam 1.`);
    if (!item.hardSkills.some((skill) => skill.role === 'primary')) errors.push(`${item.id}: não possui competência primária.`);
    if (!item.difficultyRationale.trim()) errors.push(`${item.id}: dificuldade sem justificativa.`);
    for (const skill of item.hardSkills) {
      if (!ids.has(skill.id)) errors.push(`${item.id}: competência desconhecida ${skill.id}.`);
      if (skill.weight < 0 || skill.weight > 1) errors.push(`${item.id}: peso inválido para ${skill.id}.`);
    }
    for (const prerequisite of item.prerequisites) {
      if (!ids.has(prerequisite)) errors.push(`${item.id}: pré-requisito desconhecido ${prerequisite}.`);
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
