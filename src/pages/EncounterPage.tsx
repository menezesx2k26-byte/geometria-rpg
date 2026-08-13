import { ArrowLeft, Check, Lightbulb, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findEncounter } from '../data/bootstrap';
import { useProgress } from '../state/progress';

export function EncounterPage() {
  const { id = '' } = useParams();
  const encounter = findEncounter(id);
  const { completeEncounter, recordAttempt } = useProgress();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect'>();

  const step = encounter?.steps[stepIndex];
  const options = useMemo(() => {
    if (!encounter || !step) return [];
    if (step.objectIds) return encounter.objects.filter((item) => step.objectIds?.includes(item.id));
    if (step.relationIds)
      return encounter.relations.filter((item) => step.relationIds?.includes(item.id));
    if (step.justificationIds)
      return encounter.justifications.filter((item) => step.justificationIds?.includes(item.id));
    return [];
  }, [encounter, step]);

  if (!encounter || !step) {
    return (
      <section className="page empty-page">
        <h1>Encounter não encontrado</h1>
        <Link to="/map">Voltar ao mapa</Link>
      </section>
    );
  }

  const toggle = (optionId: string) => {
    if (feedback) return;
    const expectsMultiple = step.expectedIds.length > 1;
    setSelectedIds((current) =>
      expectsMultiple
        ? current.includes(optionId)
          ? current.filter((value) => value !== optionId)
          : [...current, optionId]
        : [optionId],
    );
  };

  const verify = () => {
    const correct =
      selectedIds.length === step.expectedIds.length &&
      step.expectedIds.every((expected) => selectedIds.includes(expected));
    recordAttempt(encounter.id, step.id, selectedIds, correct, [
      step.kind === 'select-object' ? 'object-identification' : 'justification-choice',
    ]);
    setFeedback(correct ? 'correct' : 'incorrect');
  };

  const advance = () => {
    if (stepIndex === encounter.steps.length - 1) {
      const taughtSkill = encounter.teaches[0] ?? 'opv';
      const codexEntryId = `codex-${taughtSkill}`;
      completeEncounter(encounter.id, taughtSkill, codexEntryId);
      return;
    }
    setStepIndex((value) => value + 1);
    setSelectedIds([]);
    setFeedback(undefined);
  };

  return (
    <section className="page encounter-page">
      <header className="encounter-header">
        <Link to="/map" className="icon-link" aria-label="Voltar ao mapa"><ArrowLeft /></Link>
        <div>
          <small>{encounter.subtitle}</small>
          <h1>{encounter.title}</h1>
        </div>
        <span>{stepIndex + 1}/{encounter.steps.length}</span>
      </header>

      <div className="encounter-layout">
        <div className="geometry-stage" aria-label="Duas retas concorrentes no ponto O">
          <div className="line line--one" />
          <div className="line line--two" />
          <span className="point point--center">O</span>
          <span className="point point--a">A</span>
          <span className="point point--b">B</span>
          <span className="point point--c">C</span>
          <span className="point point--d">D</span>
        </div>

        <div className="decision-panel">
          <span className="eyebrow">Decisão {stepIndex + 1}</span>
          <h2>{step.prompt}</h2>
          {step.hint && <p className="hint"><Lightbulb size={16} /> {step.hint}</p>}
          <div className="option-grid">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={selectedIds.includes(option.id) ? 'option is-selected' : 'option'}
                onClick={() => toggle(option.id)}
              >
                <strong>{'label' in option ? option.label : option.notation}</strong>
                {'description' in option && <span>{option.description}</span>}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`feedback feedback--${feedback}`} role="status">
              {feedback === 'correct' ? (
                <><Check size={18} /> Relação sustentada. Você pode avançar.</>
              ) : (
                <><RotateCcw size={18} /> Revise os lados dos ângulos e tente novamente.</>
              )}
            </div>
          )}

          <button
            type="button"
            className="primary-action primary-action--wide"
            disabled={selectedIds.length === 0}
            onClick={feedback === 'correct' ? advance : feedback === 'incorrect' ? () => {
              setSelectedIds([]);
              setFeedback(undefined);
            } : verify}
          >
            {feedback === 'correct'
              ? stepIndex === encounter.steps.length - 1
                ? 'Concluir investigação'
                : 'Próxima decisão'
              : feedback === 'incorrect'
                ? 'Tentar outra relação'
                : 'Sustentar escolha'}
          </button>
        </div>
      </div>
    </section>
  );
}
