export type HardCompetencyId =
  | 'H1' | 'H2' | 'H3' | 'H4' | 'H5'
  | 'H6' | 'H7' | 'H8' | 'H9' | 'H10'
  | 'H11' | 'H12' | 'H13' | 'H14' | 'H15';

export type SoftCompetencyId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7';
export type PrerequisiteId = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | 'P9' | 'P10';

export type CompetencyId = HardCompetencyId | SoftCompetencyId | PrerequisiteId;
export type PedagogicalAct = 'decifrar' | 'justificar' | 'investigar' | 'generalizar';
export type ChallengeLevel = 'iniciante' | 'intermediario' | 'avancado';
export type AssessmentDimension = 'correctness' | 'justification' | 'independence' | 'verification';
export type HintTier = 1 | 2 | 3 | 4 | 5;

export interface CompetencyDefinition {
  id: CompetencyId;
  kind: 'hard' | 'soft' | 'prerequisite';
  name: string;
  rpgName?: string;
  description: string;
  observableEvidence: string[];
  source: {
    document: string;
    section: string;
  };
}

export type SourceStatus = 'defined' | 'undefined';
export type SourceMode = 'source' | 'standard_example' | 'generated_from_competencies';

export interface ChallengeSource {
  listId: string | null;
  sourceItem: string | null;
  sourceStatus: SourceStatus;
  sourceMode: SourceMode;
  synthetic: boolean;
  version?: string;
  checksum?: string;
}

export interface WeightedHardSkill {
  id: HardCompetencyId;
  weight: number;
  role: 'primary' | 'supporting' | 'context';
  assessedDimensions: AssessmentDimension[];
}

export interface ObservableSoftSkill {
  id: SoftCompetencyId;
  event: string;
  evidenceRule: string;
}

export interface RubricWeights {
  correctness: number;
  justification: number;
  independence: number;
  verification: number;
}

export interface ChallengeProfile {
  id: string;
  status: 'draft' | 'ready' | 'retired';
  source: ChallengeSource;
  title: string;
  objective: string;
  act: PedagogicalAct;
  level: ChallengeLevel;
  difficultyRationale: string;
  conceptIds: string[];
  hardSkills: WeightedHardSkill[];
  softSkills: ObservableSoftSkill[];
  prerequisites: PrerequisiteId[];
  recommendedTools: string[];
  rubric: RubricWeights;
  validationPolicyId: string;
  hintPolicyId: string;
  rpg: {
    questType: 'treino' | 'missao' | 'prova' | 'boss' | 'revisao';
    skillCheck: string;
    xp: number;
    item: string | null;
    route: string;
  };
  proofSpecId?: string;
  geometrySpecId?: string;
}

export interface AssessmentComponents {
  correctness: number | null;
  justification: number | null;
  independence: number | null;
  verification: number | null;
}

export interface HintEvent {
  tier: HintTier;
  requestedAt: string;
  hintId: string;
}

export interface CompetencyEvidence {
  id: string;
  attemptId: string;
  challengeId: string;
  competencyId: HardCompetencyId;
  challengeWeight: number;
  role: 'primary' | 'supporting';
  score: number;
  coverage: number;
  evaluator: 'deterministic' | 'rubric' | 'manual' | 'model-assisted';
  rationale: string;
  createdAt: string;
}

export interface BehaviorObservation {
  id: string;
  softSkillId: SoftCompetencyId;
  challengeId: string;
  event: string;
  observedAt: string;
}

export interface AttemptV4 {
  id: string;
  challengeId: string;
  legacyEncounterId?: string;
  stepId: string;
  response: unknown;
  assessment: AssessmentComponents;
  assessmentScore: number | null;
  coverage: number;
  hintEvents: HintEvent[];
  selfConfidence: number | null;
  durationMs: number | null;
  status: 'submitted' | 'accepted' | 'rejected' | 'studied';
  evidence: CompetencyEvidence[];
  behaviorObservations: BehaviorObservation[];
  attemptedAt: string;
}

export interface CompetencyState {
  competencyId: HardCompetencyId;
  mastery: number;
  confidence: number;
  evidenceCount: number;
  distinctChallengeCount: number;
  meanCoverage: number;
  lastPracticedAt?: string;
  lastEvidenceIds: string[];
}

export type MasteryBand = 'remediation' | 'practice' | 'transfer' | 'proof';
export type ConfidenceLabel = 'insuficiente' | 'baixa' | 'moderada' | 'alta';

export interface AdaptiveRecommendation {
  id: string;
  competencyId: HardCompetencyId;
  competencyName: string;
  rpgName: string;
  challengeId: string;
  title: string;
  route: string;
  actionLabel: string;
  reason: string;
  mastery: number;
  confidence: number;
  band: MasteryBand;
}

export interface AdaptiveState {
  lastTargetIds: HardCompetencyId[];
  lastRecommendationId?: string;
  recommendationHistory: string[];
}
