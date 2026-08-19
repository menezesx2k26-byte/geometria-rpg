import { ArrowLeft, Check, Swords } from 'lucide-react';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { MissionRewardCard } from '../components/campaign/MissionRewardCard';
import { CompetencyDebrief } from '../components/learning/CompetencyDebrief';
import { FeedbackPanel, QuestFrame, UnlockBanner } from '../components/rpg';
import { officialQuest15 } from '../data/officialQuest15';
import { useProgress } from '../state/progress';
import type { MasteryDimension } from '../types/domain';
import { isAcceptedOption } from '../engine/answerAcceptance';

function legacyEvidenceFor(stepId: string): { skillIds: string[]; masteryDimensions: MasteryDimension[] } {
  switch (stepId) {
    case 'q15-opv':
      return { skillIds: ['opv'], masteryDimensions: ['recognition', 'application', 'justification'] };
    case 'q15-asa':
      return { skillIds: ['asa'], masteryDimensions: ['recognition', 'application', 'justification'] };
    case 'q15-order':
      return { skillIds: ['triangle-congruence'], masteryDimensions: ['recognition', 'application', 'justification'] };
    case 'q15-x':
    case 'q15-y':
      return { skillIds: ['cpctc'], masteryDimensions: ['application', 'reproduction'] };
    case 'q15-perimeter':
      return { skillIds: ['triangle-perimeter', 'cpctc'], masteryDimensions: ['application', 'transfer'] };
    default:
      return { skillIds: ['triangle-congruence'], masteryDimensions: ['application'] };
  }
}

function errorTagFor(stepId: string) {
  if (stepId === 'q15-opv') return 'opv-recognition';
  if (stepId === 'q15-order') return 'ordered-correspondence';
  if (stepId === 'q15-x' || stepId === 'q15-y') return 'algebra-linear';
  if (stepId === 'q15-asa') return 'proof-gap';
  return 'segment-vs-measure';
}

function OfficialQuestDiagram() {
  const titleId = useId();
  const descId = useId();

  return (
    <section className="official-diagram" aria-label="Figura e hipóteses da questão">
      <svg
        viewBox="0 0 620 390"
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <title id={titleId}>Duas retas concorrentes em C formando os triângulos CBA e CDE</title>
        <desc id={descId}>
          B, C e D são colineares; A, C e E são colineares. As marcas indicam BC congruente a CD e os arcos indicam os ângulos dados em B e D.
        </desc>

        {/* Rotação de 180° em torno de C: B↔D e A↔E. */}
        <polygon points="70,310 310,195 215,55" />
        <polygon points="310,195 550,80 405,335" />
        <line x1="70" y1="310" x2="550" y2="80" />
        <line x1="215" y1="55" x2="405" y2="335" />

        {/* BC ≅ CD — uma marca em cada metade da mesma reta. */}
        <path className="official-tick" d="M186.55 245.3 l6.9 14.4 M426.55 130.3 l6.9 14.4" />

        {/* ∠CBA ≅ ∠CDE — dado do enunciado, um arco em B e outro em D. */}
        <path className="official-angle-mark" d="M107.88 291.85 A42 42 0 0 0 90.76 273.49" />
        <path className="official-angle-mark" d="M512.12 98.15 A42 42 0 0 0 529.24 116.51" />

        <text x="47" y="340">B</text>
        <text x="197" y="43">A</text>
        <text x="310" y="188" textAnchor="middle">C</text>
        <text x="559" y="76">D</text>
        <text x="411" y="365">E</text>
      </svg>
      <aside>
        {officialQuest15.hypothesis.map((item) => <span key={item}>{item}</span>)}
      </aside>
    </section>
  );
}

export function OfficialQuest15Page() {
  const { completeEncounter, recordAttempt } = useProgress();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string>();
  const [relations, setRelations] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect'>();
  const [solved, setSolved] = useState(false);
  const step = officialQuest15.steps[stepIndex];

  if (solved) {
    return (
      <section className="page">
        <UnlockBanner title="Questão 15 resolvida">
          Resposta oficial confirmada: {officialQuest15.officialAnswer}
        </UnlockBanner>
        <MissionRewardCard completionId={officialQuest15.id} />
        <CompetencyDebrief encounterId={officialQuest15.id} />
        <article className="debrief-card">
          <span className="eyebrow">Debrief</span>
          <h2>Da figura à razão</h2>
          <p>O percurso exigiu OPV, escolha explícita de ALA, correspondência ordenada, duas equações e a consequência métrica da congruência.</p>
        </article>
        <div className="completion-actions">
          <Link className="secondary-action" to="/review">Abrir diagnóstico</Link>
        </div>
      </section>
    );
  }

  if (!step) return null;

  const verify = () => {
    if (!selectedId) return;
    const correct = isAcceptedOption(selectedId, step.correctId, step.acceptedAlternativeIds);
    const evidence = legacyEvidenceFor(step.id);

    recordAttempt(
      officialQuest15.id,
      step.id,
      [selectedId],
      correct,
      correct ? [] : [errorTagFor(step.id)],
      {
        ...evidence,
        hintsUsed: 0,
        position: '/encounter/official-q15',
      },
    );
    setFeedback(correct ? 'correct' : 'incorrect');
  };

  const advance = () => {
    setRelations((current) => [...current, step.relation]);
    if (stepIndex === officialQuest15.steps.length - 1) {
      completeEncounter(
        officialQuest15.id,
        ['asa', 'triangle-congruence', 'cpctc'],
        ['codex-asa', 'codex-triangle-congruence', 'codex-cpctc'],
      );
      setSolved(true);
      return;
    }

    setStepIndex((index) => index + 1);
    setSelectedId(undefined);
    setFeedback(undefined);
  };

  return (
    <section className="page">
      <Link className="back-link" to="/vertical-slice"><ArrowLeft size={16} /> Fortaleza</Link>
      <header className="official-quest-header">
        <span className="eyebrow">Questão oficial 15 · {stepIndex + 1}/{officialQuest15.steps.length}</span>
        <h1>{officialQuest15.title}</h1>
        <p>{officialQuest15.sourceQuestion}</p>
      </header>

      <QuestFrame>
        <div className="official-quest-layout">
          <OfficialQuestDiagram />
          <section className="official-workbench">
            <h2>{step.prompt}</h2>
            <div className="proof-choice-grid" role="group" aria-label={step.prompt}>
              {step.options.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={selectedId === option.id ? 'proof-choice is-selected' : 'proof-choice'}
                  aria-pressed={selectedId === option.id}
                  disabled={feedback === 'correct'}
                  onClick={() => {
                    setSelectedId(option.id);
                    setFeedback(undefined);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {feedback && (
              <FeedbackPanel state={feedback}>
                {feedback === 'correct' ? step.success : step.error}
              </FeedbackPanel>
            )}

            <button
              type="button"
              className="primary-action primary-action--wide"
              disabled={!selectedId}
              onClick={feedback === 'correct' ? advance : verify}
            >
              {feedback === 'correct'
                ? <><Check size={17} /> Registrar e avançar</>
                : <><Swords size={17} /> Sustentar resposta</>}
            </button>

            <div className="relation-workspace" aria-live="polite">
              <strong>Argumento construído</strong>
              {relations.length > 0
                ? <ol>{relations.map((relation) => <li key={relation}>{relation}</li>)}</ol>
                : <p>Nenhuma relação registrada ainda.</p>}
            </div>
          </section>
        </div>
      </QuestFrame>
    </section>
  );
}
