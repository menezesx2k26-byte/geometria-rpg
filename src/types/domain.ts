export type SkillState = 'locked' | 'available' | 'practicing' | 'mastered';
export type SkillType =
  | 'definition'
  | 'postulate'
  | 'theorem'
  | 'corollary'
  | 'technique'
  | 'property'
  | 'algebra'
  | 'logic';

export type MasteryDimension =
  | 'recognition'
  | 'application'
  | 'justification'
  | 'reproduction'
  | 'transfer';

export type FogOfWarVisibility = 'hiddenUntilDiscovered' | 'visibleButLocked';
export type ContentSource =
  | 'Aula'
  | 'Lista Euclidiana'
  | 'Lista Analítica'
  | 'Complemento';

export interface SourceReference {
  origin: ContentSource;
  reference: string;
}

export interface Skill {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  type: SkillType;
  regionId: string;
  formalStatement: string;
  prerequisites: string[];
  unlocks: string[];
  tags: string[];
  assetKey: string;
  codexEntryId: string;
  masteryDimensions: MasteryDimension[];
  sourceRefs: SourceReference[];
  visibility: FogOfWarVisibility;
}

export interface Region {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  skillIds: string[];
  encounterIds: string[];
  accent: string;
  visibility: FogOfWarVisibility;
}

export type EncounterKind = 'investigation' | 'application' | 'boss-proof';
export type EncounterStepKind =
  | 'observe'
  | 'select-object'
  | 'select-relation'
  | 'justify'
  | 'construct'
  | 'calculate'
  | 'formalize';

export interface GeometryObject {
  id: string;
  kind: 'point' | 'segment' | 'angle' | 'triangle' | 'line' | 'ray';
  label: string;
}

export interface GeometryRelation {
  id: string;
  kind: 'congruent' | 'equal' | 'supplementary' | 'opposite-vertical' | 'shared' | 'correspondence';
  objectIds: string[];
  notation: string;
  reason?: string;
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

export interface CompletionRules {
  requiredStepIds: string[];
  minimumCorrectSteps: number;
  allowHints: boolean;
}

export type FigureKind = 'crossed-triangles' | 'ordered-triangles';

export interface SemanticErrorRule {
  when: 'wrong-skill' | 'wrong-objects' | 'wrong-order' | 'missing-relation';
  message: string;
}

export interface EncounterApplicationRule {
  id: string;
  skillId: string;
  objectIds: string[];
  orderMatters?: boolean;
  requiresRelationIds: string[];
  producesRelationIds: string[];
  successMessage: string;
  semanticErrors: SemanticErrorRule[];
}

export interface Encounter {
  id: string;
  regionId: string;
  title: string;
  subtitle: string;
  kind: EncounterKind;
  source: SourceReference;
  sourceQuestion: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  requires: string[];
  teaches: string[];
  reinforces: string[];
  diagnosticTags: DiagnosticTag[];
  steps: EncounterStep[];
  completionRules: CompletionRules;
  recoveryEncounters: string[];
  briefing: string;
  objective: string;
  assetKey: string;
  figureKind: FigureKind;
  inventorySkillIds: string[];
  initialRelationIds: string[];
  applicationRules: EncounterApplicationRule[];
  hints: string[];
  completionRelationIds: string[];
  resolution: string;
  debrief: string;
  unlockSkillIds: string[];
  objects: GeometryObject[];
  relations: GeometryRelation[];
  justifications: Justification[];
}

export type ProofJustification =
  | 'hypothesis'
  | 'definition'
  | 'reflexivity'
  | 'OPV'
  | 'midpoint'
  | 'angleBisector'
  | 'collinearity'
  | 'supplementary'
  | 'complementary'
  | 'LAL'
  | 'ALA'
  | 'LLL'
  | 'correspondingParts'
  | 'isoscelesTheorem'
  | 'transitivity'
  | 'contradiction'
  | 'algebra';

export type ProofInteraction =
  | 'build-step'
  | 'order-cards'
  | 'complete-justification'
  | 'choose-construction'
  | 'select-consequence'
  | 'assemble-equation'
  | 'find-invalid-step';

export interface ProofChoice {
  id: string;
  label: string;
}

export interface ProofStepAlternative {
  involvedObjects?: string[];
  relation?: string;
  justification?: ProofJustification;
  answerIds?: string[];
}

export interface ProofStep {
  id: string;
  statement: string;
  involvedObjects: string[];
  relation: string;
  justification: ProofJustification;
  dependencies: string[];
  optionalConstruction?: string;
  acceptedAlternatives: ProofStepAlternative[];
  interaction: ProofInteraction;
  prompt: string;
  hint: string;
  objectOptions: ProofChoice[];
  relationOptions: ProofChoice[];
  justificationOptions: ProofJustification[];
  answerOptions: ProofChoice[];
  expectedAnswerIds: string[];
}

export interface Proof {
  id: string;
  title: string;
  subtitle: string;
  source: SourceReference;
  hypothesis: string[];
  thesis: string;
  objects: GeometryObject[];
  steps: ProofStep[];
  debrief: string;
  unlockSkillIds: string[];
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
  | 'algebra-translation'
  | 'ordered-correspondence'
  | 'opv-recognition'
  | 'included-angle'
  | 'midpoint-definition'
  | 'bisector-definition'
  | 'perpendicularity'
  | 'segment-vs-measure'
  | 'algebra-linear'
  | 'distance-formula'
  | 'absolute-value'
  | 'proof-gap'
  | 'construction-choice';

export interface Attempt {
  encounterId: string;
  stepId: string;
  selectedIds: string[];
  correct: boolean;
  diagnosticTags: DiagnosticTag[];
  skillIds: string[];
  masteryDimensions: MasteryDimension[];
  hintsUsed: number;
  attemptedAt: string;
}

export interface DimensionMastery {
  dimension: MasteryDimension;
  score: number;
  attempts: number;
}

export interface MasteryProfile {
  skillId: string;
  state: SkillState;
  mastery: number;
  dimensions: DimensionMastery[];
  correctAttempts: number;
  totalAttempts: number;
  lastPracticedAt?: string;
}

export interface UserProgress {
  version: 2;
  skills: Record<string, MasteryProfile>;
  attempts: Attempt[];
  completedEncounterIds: string[];
  discoveredSkillIds: string[];
  discoveredCodexEntryIds: string[];
  errorTagCounts: Partial<Record<DiagnosticTag, number>>;
  hintsUsed: number;
  lastPosition: string;
  recommendedMicroquestIds: string[];
  completedMicroquestIds: string[];
}

export interface MicroquestOption {
  id: string;
  label: string;
}

export interface Microquest {
  id: string;
  title: string;
  competency: string;
  duration: string;
  prompt: string;
  options: MicroquestOption[];
  correctOptionId: string;
  successMessage: string;
  errorMessage: string;
  diagnosticTag: DiagnosticTag;
  skillId: string;
  masteryDimensions: MasteryDimension[];
  returnEncounterId: string;
}

export type CampaignProofType =
  | 'none'
  | 'direct'
  | 'indirect'
  | 'contradiction'
  | 'contraposition'
  | 'construction'
  | 'optimization'
  | 'synthesis';

export interface CampaignQuest {
  id: string;
  number: number;
  regionId: string;
  title: string;
  sourceQuestion: string;
  requires: string[];
  teaches: string[];
  reinforces: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  proofType: CampaignProofType;
  commonErrors: DiagnosticTag[];
  recoverySkills: string[];
  playableRoute?: string;
}

export interface CampaignRegion {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  visibility: FogOfWarVisibility;
  skillIds: string[];
  encounterIds: string[];
  questionNumbers: number[];
  bossQuestIds: string[];
  tutorialQuestIds: string[];
}

export interface CodexEntry {
  id: string;
  skillId: string;
  title: string;
  summary: string;
  statement: string;
  formula?: string;
  unlockedByDefault?: boolean;
  sourceRefs: SourceReference[];
}
