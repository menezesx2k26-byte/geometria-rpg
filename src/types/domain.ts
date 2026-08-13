export type SkillState = 'locked' | 'available' | 'practicing' | 'mastered';
export type EncounterKind = 'investigation' | 'application' | 'boss-proof';
export type EncounterStepKind =
  | 'observe'
  | 'select-object'
  | 'select-relation'
  | 'justify'
  | 'construct'
  | 'calculate'
  | 'formalize';

export interface Skill {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  regionId: string;
  prerequisites: string[];
  codexEntryId: string;
}

export interface Region {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  skillIds: string[];
  encounterIds: string[];
  accent: string;
}

export interface GeometryObject {
  id: string;
  kind: 'point' | 'segment' | 'angle' | 'triangle' | 'line' | 'ray';
  label: string;
}

export interface GeometryRelation {
  id: string;
  kind: 'congruent' | 'equal' | 'supplementary' | 'opposite-vertical' | 'shared';
  objectIds: string[];
  notation: string;
}

export interface Justification {
  id: string;
  label: string;
  description: string;
  skillId?: string;
}

export interface EncounterStep {
  id: string;
  kind: EncounterStepKind;
  prompt: string;
  hint?: string;
  objectIds?: string[];
  relationIds?: string[];
  justificationIds?: string[];
  expectedIds: string[];
}

export interface Encounter {
  id: string;
  regionId: string;
  title: string;
  subtitle: string;
  kind: EncounterKind;
  difficulty: 1 | 2 | 3 | 4 | 5;
  skillIds: string[];
  briefing: string;
  objects: GeometryObject[];
  relations: GeometryRelation[];
  justifications: Justification[];
  steps: EncounterStep[];
}

export interface ProofStep {
  id: string;
  statement: string;
  justificationId: string;
  dependsOn: string[];
}

export interface Proof {
  id: string;
  title: string;
  hypothesis: string[];
  thesis: string;
  steps: ProofStep[];
}

export interface Exercise {
  id: string;
  encounterId: string;
  prompt: string;
  expectedAnswer: string;
  diagnosticTags: DiagnosticTag[];
}

export type DiagnosticTag =
  | 'hypothesis-reading'
  | 'object-identification'
  | 'relation-selection'
  | 'justification-choice'
  | 'proof-order'
  | 'algebra-translation';

export interface Attempt {
  encounterId: string;
  stepId: string;
  selectedIds: string[];
  correct: boolean;
  diagnosticTags: DiagnosticTag[];
  attemptedAt: string;
}

export interface MasteryProfile {
  skillId: string;
  state: SkillState;
  mastery: number;
  correctAttempts: number;
  totalAttempts: number;
  lastPracticedAt?: string;
}

export interface UserProgress {
  version: 1;
  skills: Record<string, MasteryProfile>;
  attempts: Attempt[];
  completedEncounterIds: string[];
  discoveredCodexEntryIds: string[];
}

export interface CodexEntry {
  id: string;
  skillId: string;
  title: string;
  summary: string;
  statement: string;
  formula?: string;
  unlockedByDefault?: boolean;
}
