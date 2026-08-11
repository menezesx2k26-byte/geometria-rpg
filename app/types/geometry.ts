export type SkillType = "definition" | "postulate" | "theorem" | "corollary";

export type Skill = {
  id: string;
  title: string;
  shortTitle: string;
  type: SkillType;
  prerequisites: string[];
  description: string;
  asset?: string;
  lessonId: string;
};

export type LessonBlockType =
  | "definition"
  | "postulate"
  | "theorem"
  | "corollary"
  | "proposition"
  | "example"
  | "warning"
  | "comparison";

export type LessonBlock = {
  id: string;
  type: LessonBlockType;
  title: string;
  body: string[];
  formulas?: string[];
  callout?: string;
  asset?: string;
};

export type LessonSection = {
  id: string;
  skillId: string;
  eyebrow: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  blocks: LessonBlock[];
};

export type ProofStepKind =
  | "hypothesis"
  | "construction"
  | "known-result"
  | "inference"
  | "conclusion";

export type ProofStep = {
  id: string;
  kind: ProofStepKind;
  label: string;
  formula?: string;
  explanation: string;
};

export type Proof = {
  id: string;
  title: string;
  skillId: string;
  statement: string;
  formula?: string;
  badge: "proposition" | "theorem" | "corollary";
  complementary?: boolean;
  steps: ProofStep[];
};

export type QuestionKind =
  | "criterion"
  | "hypothesis"
  | "conclusion"
  | "correspondence"
  | "true-false"
  | "logical-error"
  | "calculation"
  | "comparison";

export type Question = {
  id: string;
  skillId: string;
  kind: QuestionKind;
  prompt: string;
  formula?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type ExerciseStep = {
  id: string;
  prompt: string;
  formula?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type Exercise = {
  id: string;
  title: string;
  subtitle: string;
  skillId: string;
  difficulty: "Quest" | "Boss Proof" | "Exercício resolvido";
  introduction: string;
  steps: ExerciseStep[];
  finalAnswer: string;
};

export type ReviewCard = {
  id: string;
  skillId: string;
  concept: string;
  definition: string;
  formula: string;
  commonError: string;
  question: string;
  answer: string;
};

export type QuestionRecord = {
  attempts: number;
  correct: number;
};

export type UserProgress = {
  mastery: Record<string, number>;
  studiedSections: string[];
  questions: Record<string, QuestionRecord>;
  proofAttempts: Record<string, QuestionRecord>;
  lastSection: string;
  updatedAt: string;
};

export type AppView = "map" | "lesson" | "training" | "proofs" | "exercises" | "review";
