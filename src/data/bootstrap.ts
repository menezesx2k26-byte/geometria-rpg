import type { CodexEntry, Encounter, Region, Skill } from '../types/domain';

export const skills: Skill[] = [
  {
    id: 'opv',
    title: 'Ângulos opostos pelo vértice',
    shortTitle: 'OPV',
    description: 'Reconheça ângulos formados por duas retas concorrentes e justifique sua igualdade.',
    regionId: 'congruence-frontier',
    prerequisites: [],
    codexEntryId: 'codex-opv',
  },
  {
    id: 'lal',
    title: 'Caso Lado–Ângulo–Lado',
    shortTitle: 'LAL',
    description: 'Prove congruência usando dois lados e o ângulo compreendido.',
    regionId: 'congruence-frontier',
    prerequisites: ['opv'],
    codexEntryId: 'codex-lal',
  },
];

export const regions: Region[] = [
  {
    id: 'congruence-frontier',
    title: 'Fronteira da Congruência',
    subtitle: 'Onde figuras parecidas precisam provar que são iguais',
    description: 'Investigue relações angulares e use-as para abrir o primeiro caso de congruência.',
    skillIds: ['opv', 'lal'],
    encounterIds: ['crossroads-opv'],
    accent: '#d7ff64',
  },
];

export const encounters: Encounter[] = [
  {
    id: 'crossroads-opv',
    regionId: 'congruence-frontier',
    title: 'A Encruzilhada dos Ângulos',
    subtitle: 'Primeiro encounter · investigação',
    kind: 'investigation',
    difficulty: 1,
    skillIds: ['opv'],
    briefing: 'Duas retas se cruzam no ponto O. Descubra qual relação permanece verdadeira sem medir.',
    objects: [
      { id: 'angle-aoc', kind: 'angle', label: '∠AÔC' },
      { id: 'angle-bod', kind: 'angle', label: '∠BÔD' },
      { id: 'angle-aod', kind: 'angle', label: '∠AÔD' },
      { id: 'angle-cob', kind: 'angle', label: '∠CÔB' },
    ],
    relations: [
      {
        id: 'relation-opv',
        kind: 'opposite-vertical',
        objectIds: ['angle-aoc', 'angle-bod'],
        notation: '∠AÔC = ∠BÔD',
      },
      {
        id: 'relation-adjacent',
        kind: 'supplementary',
        objectIds: ['angle-aoc', 'angle-aod'],
        notation: '∠AÔC + ∠AÔD = 180°',
      },
    ],
    justifications: [
      {
        id: 'justify-opv',
        label: 'Opostos pelo vértice',
        description: 'Os lados de um ângulo são semirretas opostas aos lados do outro.',
        skillId: 'opv',
      },
      {
        id: 'justify-visual',
        label: 'Parecem iguais',
        description: 'A aparência do desenho não é uma justificativa matemática.',
      },
    ],
    steps: [
      {
        id: 'identify-opposites',
        kind: 'select-object',
        prompt: 'Selecione o par de ângulos opostos pelo vértice.',
        hint: 'Procure ângulos cujos lados sejam semirretas opostas.',
        objectIds: ['angle-aoc', 'angle-bod', 'angle-aod', 'angle-cob'],
        expectedIds: ['angle-aoc', 'angle-bod'],
      },
      {
        id: 'justify-equality',
        kind: 'justify',
        prompt: 'Qual argumento prova que os ângulos selecionados têm a mesma medida?',
        justificationIds: ['justify-opv', 'justify-visual'],
        expectedIds: ['justify-opv'],
      },
      {
        id: 'formalize-opv',
        kind: 'formalize',
        prompt: 'Registre a relação que a investigação estabeleceu.',
        relationIds: ['relation-opv', 'relation-adjacent'],
        expectedIds: ['relation-opv'],
      },
    ],
  },
];

export const codexEntries: CodexEntry[] = [
  {
    id: 'codex-opv',
    skillId: 'opv',
    title: 'Ângulos opostos pelo vértice',
    summary: 'Duas retas concorrentes produzem pares de ângulos opostos com medidas iguais.',
    statement: 'Se duas retas se intersectam, então os ângulos opostos pelo vértice são congruentes.',
    formula: String.raw`\angle A\hat{O}C \cong \angle B\hat{O}D`,
    unlockedByDefault: true,
  },
  {
    id: 'codex-lal',
    skillId: 'lal',
    title: 'Caso de congruência LAL',
    summary: 'Dois lados e o ângulo entre eles determinam um triângulo.',
    statement: 'Dois triângulos são congruentes quando possuem dois lados e o ângulo compreendido congruentes.',
    formula: String.raw`AB \cong DE,\; \angle B \cong \angle E,\; BC \cong EF`,
  },
];

export function findEncounter(id: string) {
  return encounters.find((encounter) => encounter.id === id);
}

export function findCodexEntry(id: string) {
  return codexEntries.find((entry) => entry.id === id);
}
