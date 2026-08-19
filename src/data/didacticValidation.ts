import type { CampaignNode, Skill } from '../types/domain';
import { didacticLessons } from './didacticLessons';

export interface DidacticNodeProfile {
  nodeId: string;
  introduces?: string[];
  practices?: string[];
  assesses?: string[];
}

export const didacticNodeProfiles: DidacticNodeProfile[] = [
  { nodeId: 'lesson-congruence-foundations', introduces: ['triangle-congruence'], practices: ['triangle-congruence'] },
  { nodeId: 'mission-vertex-order', assesses: ['triangle-congruence'] },
  { nodeId: 'lesson-opv-lal-foundations', introduces: ['opv', 'sas', 'cpctc'], practices: ['opv', 'sas', 'cpctc'] },
  { nodeId: 'mission-opv-sas', assesses: ['opv', 'sas', 'cpctc'] },
  { nodeId: 'mission-mirror-review', assesses: ['triangle-congruence'] },
  { nodeId: 'lesson-proof-tools', introduces: ['angle-bisector', 'reflexivity', 'isosceles-theorem'], practices: ['angle-bisector', 'reflexivity', 'isosceles-theorem'] },
  { nodeId: 'checkpoint-isosceles', assesses: ['sas', 'cpctc', 'angle-bisector', 'reflexivity', 'isosceles-theorem'] },
  { nodeId: 'lesson-ala-foundations', introduces: ['asa', 'triangle-perimeter'], practices: ['asa', 'triangle-perimeter'] },
  { nodeId: 'mission-official-q15', assesses: ['asa', 'triangle-congruence', 'triangle-perimeter'] },
  { nodeId: 'lesson-cevian-foundations', introduces: ['midpoint', 'median', 'altitude'], practices: ['midpoint', 'median', 'altitude', 'angle-bisector'] },
  { nodeId: 'boss-cevian', assesses: ['midpoint', 'median', 'altitude', 'angle-bisector', 'sas', 'cpctc'] },
  { nodeId: 'lesson-parallelism-foundations', introduces: ['parallel-angle-families', 'parallel-converse-skill', 'parallelogram-characterization'], practices: ['parallel-angle-families', 'parallel-converse-skill', 'parallelogram-characterization'] },
  { nodeId: 'mission-parallelism', assesses: ['parallel-angle-families', 'parallel-converse-skill', 'parallelogram-characterization'] },
  { nodeId: 'lesson-cartesian-foundations', introduces: ['cartesian-coordinates', 'quadrants-signs'], practices: ['cartesian-coordinates', 'quadrants-signs'] },
  { nodeId: 'mission-coordinate-map', assesses: ['cartesian-coordinates', 'quadrants-signs'] },
  { nodeId: 'lesson-coordinate-bridge', introduces: ['coordinate-midpoint', 'coordinate-collinearity'], practices: ['coordinate-midpoint', 'coordinate-collinearity'] },
  {
    nodeId: 'lesson-line-system-foundations',
    introduces: ['general-line-equation', 'line-solution-set', 'vertical-horizontal-lines', 'supporting-line', 'linear-system-classification', 'system-intersection-interpretation', 'coordinate-median'],
    practices: ['general-line-equation', 'line-solution-set', 'vertical-horizontal-lines', 'supporting-line', 'linear-system-classification', 'system-intersection-interpretation', 'coordinate-median'],
  },
  {
    nodeId: 'mission-line-forge',
    assesses: ['coordinate-midpoint', 'coordinate-collinearity', 'general-line-equation', 'line-solution-set', 'vertical-horizontal-lines', 'supporting-line', 'linear-system-classification', 'system-intersection-interpretation', 'coordinate-median'],
  },
  { nodeId: 'mission-language-bridge', assesses: ['coordinate-median', 'system-intersection-interpretation'] },
  { nodeId: 'lesson-distance-modeling-foundations', introduces: ['distance-formula-skill', 'figure-to-equation', 'exact-distance-proof'], practices: ['distance-formula-skill', 'figure-to-equation', 'exact-distance-proof'] },
  { nodeId: 'boss-exercise-48', assesses: ['coordinate-midpoint', 'general-line-equation', 'system-intersection-interpretation', 'distance-formula-skill', 'figure-to-equation', 'exact-distance-proof'] },
];

const entryKnowledge = new Set(['angles', 'triangles', 'segments']);

function unique(values: string[] | undefined) {
  return [...new Set(values ?? [])];
}

export function validateDidacticSequence(nodes: CampaignNode[], skills: Skill[]) {
  const errors: string[] = [];
  const skillById = new Map(skills.map((skill) => [skill.id, skill]));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const profileByNode = new Map(didacticNodeProfiles.map((profile) => [profile.nodeId, profile]));
  const lessonByCompletion = new Map(didacticLessons.map((lesson) => [lesson.completionId, lesson]));

  if (profileByNode.size !== didacticNodeProfiles.length) errors.push('Perfis didáticos possuem nodeId duplicado.');

  for (const node of nodes) {
    if (!profileByNode.has(node.id)) errors.push(`${node.id}: perfil didático ausente.`);
    if (node.route.startsWith('/lesson/') && !lessonByCompletion.has(node.completionId)) {
      errors.push(`${node.id}: rota de microlição sem conteúdo didático correspondente.`);
    }
  }

  for (const profile of didacticNodeProfiles) {
    if (!nodeById.has(profile.nodeId)) errors.push(`${profile.nodeId}: perfil didático aponta para missão inexistente.`);
    for (const skillId of [...unique(profile.introduces), ...unique(profile.practices), ...unique(profile.assesses)]) {
      if (!skillById.has(skillId)) errors.push(`${profile.nodeId}: skill didática inexistente ${skillId}.`);
    }
  }

  const introduced = new Set(entryKnowledge);
  const practiced = new Set(entryKnowledge);
  const ordered = [...nodes].sort((a, b) => a.order - b.order);

  for (const node of ordered) {
    const profile = profileByNode.get(node.id);
    if (!profile) continue;
    const introduces = unique(profile.introduces);
    const practices = unique(profile.practices);
    const assesses = unique(profile.assesses);
    const sameNodeIntroductions = new Set(introduces);

    for (const skillId of assesses) {
      if (sameNodeIntroductions.has(skillId)) {
        errors.push(`${node.id}: não pode introduzir e avaliar ${skillId} no mesmo nó.`);
      }
      if (!practiced.has(skillId)) {
        errors.push(`${node.id}: avalia ${skillId} antes de prática guiada anterior.`);
      }
    }

    for (const skillId of practices) {
      if (!introduced.has(skillId) && !sameNodeIntroductions.has(skillId)) {
        errors.push(`${node.id}: pratica ${skillId} antes de apresentação.`);
      }
    }

    for (const skillId of introduces) {
      const skill = skillById.get(skillId);
      if (!skill) continue;
      for (const prerequisiteId of skill.prerequisites) {
        if (!introduced.has(prerequisiteId) && !sameNodeIntroductions.has(prerequisiteId)) {
          errors.push(`${node.id}: introduz ${skillId} antes do pré-requisito conceitual ${prerequisiteId}.`);
        }
      }
    }

    introduces.forEach((skillId) => introduced.add(skillId));
    practices.forEach((skillId) => practiced.add(skillId));
    assesses.forEach((skillId) => practiced.add(skillId));
  }

  return errors;
}

export function didacticCoverageReport(nodes: CampaignNode[]) {
  const profileByNode = new Map(didacticNodeProfiles.map((profile) => [profile.nodeId, profile]));
  return [...nodes]
    .sort((a, b) => a.order - b.order)
    .map((node) => ({
      nodeId: node.id,
      order: node.order,
      introduces: unique(profileByNode.get(node.id)?.introduces),
      practices: unique(profileByNode.get(node.id)?.practices),
      assesses: unique(profileByNode.get(node.id)?.assesses),
    }));
}
