import { ArrowLeft, ArrowRight, Check, Lightbulb, RotateCcw } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { JourneyStage } from '../../data/interactiveJourneys';
import { useProgress } from '../../state/progress';
import { acceptedJourneyOptionIds, isAcceptedOption } from '../../engine/answerAcceptance';
import { FeedbackPanel, UnlockBanner } from '../rpg';
import { MissionRewardCard } from '../campaign/MissionRewardCard';
import { CompetencyDebrief } from './CompetencyDebrief';

interface JourneyRunnerProps {
  journeyId: string;
  kicker: string;
  title: string;
  description: string;
  stages: JourneyStage[];
  completionTitle: string;
  completionText: string;
  backTo: string;
  backLabel: string;
  renderDiagram: (stageIndex: number, completed: boolean) => ReactNode;
}

export function JourneyRunner({
  journeyId,
  kicker,
  title,
  description,
  stages,
  completionTitle,
  completionText,
  backTo,
  backLabel,
  renderDiagram,
}: JourneyRunnerProps) {
  const { completeEncounter, recordAttempt } = useProgress();
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get('focus');
  const focusedStage = focusId ? stages.find((item) => item.id === focusId) : undefined;
  const activeStages = useMemo(() => focusedStage ? [focusedStage] : stages, [focusedStage, stages]);
  const effectiveJourneyId = focusedStage ? `adaptive:${journeyId}:${focusedStage.id}` : journeyId;
  const effectiveBackTo = focusedStage ? '/review' : backTo;
  const effectiveBackLabel = focusedStage ? 'Voltar ao diagnóstico' : backLabel;
  const [stageIndex, setStageIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string>();
  const [feedback, setFeedback] = useState<{ state: 'correct' | 'incorrect'; message: string }>();
  const [hintUsed, setHintUsed] = useState(false);
  const [selfConfidence, setSelfConfidence] = useState<number>();
  const [completed, setCompleted] = useState(false);
  const stage = activeStages[stageIndex];
  const diagramStageIndex = focusedStage ? stages.findIndex((item) => item.id === focusedStage.id) : stageIndex;
  const allSkillIds = useMemo(() => [...new Set(activeStages.flatMap((item) => item.skillIds))], [activeStages]);

  if (!stage) return null;

  const verify = () => {
    if (!selectedId || feedback?.state === 'correct') return;
    const selected = stage.options.find((item) => item.id === selectedId);
    if (!selected) return;
    const correct = isAcceptedOption(selectedId, stage.correctOptionId, acceptedJourneyOptionIds(stage.id));
    recordAttempt(
      effectiveJourneyId,
      stage.id,
      [selectedId],
      correct,
      correct ? [] : [stage.diagnosticTag],
      {
        skillIds: stage.skillIds,
        masteryDimensions: stage.masteryDimensions,
        hintsUsed: hintUsed ? 1 : 0,
        hintTier: hintUsed ? 2 : undefined,
        selfConfidence,
        position: `${window.location.pathname}${window.location.search}`,
      },
    );
    setFeedback({
      state: correct ? 'correct' : 'incorrect',
      message: correct ? `${selected.feedback} ${stage.successMessage}` : selected.feedback,
    });
  };

  const advance = () => {
    if (feedback?.state !== 'correct') return;
    if (stageIndex === activeStages.length - 1) {
      completeEncounter(
        effectiveJourneyId,
        allSkillIds,
        allSkillIds.map((id) => `codex-${id}`),
        `${window.location.pathname}${window.location.search}`,
      );
      setCompleted(true);
      return;
    }
    setStageIndex((current) => current + 1);
    setSelectedId(undefined);
    setFeedback(undefined);
    setHintUsed(false);
    setSelfConfidence(undefined);
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  if (completed) {
    return (
      <section className="page journey-page journey-complete-page">
        <UnlockBanner title={completionTitle}>{completionText}</UnlockBanner>
        <MissionRewardCard completionId={effectiveJourneyId} />
        <CompetencyDebrief encounterId={effectiveJourneyId} />
        <div className="journey-complete-grid">
          <section>
            <span className="eyebrow">Cadeia reconstruída</span>
            <h1>{title}</h1>
            <ol>{activeStages.map((item) => <li key={item.id}><Check size={16} /><span>{item.workspaceEntry}</span></li>)}</ol>
          </section>
          <div className="completion-actions">
            <Link className="primary-action" to={effectiveBackTo}>{effectiveBackLabel}</Link>
            <button type="button" className="secondary-action" onClick={() => { setStageIndex(0); setCompleted(false); setSelectedId(undefined); setFeedback(undefined); setHintUsed(false); setSelfConfidence(undefined); }}><RotateCcw size={16} /> Refazer sem dicas</button>
          </div>
        </div>
      </section>
    );
  }

  const visibleWorkspace = [
    ...activeStages.slice(0, stageIndex),
    ...(feedback?.state === 'correct' ? [stage] : []),
  ];

  return (
    <section className="page journey-page">
      <Link className="back-link" to={effectiveBackTo}><ArrowLeft size={16} /> {effectiveBackLabel}</Link>
      <header className="journey-heading">
        <span className="eyebrow">{kicker}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="journey-progress" aria-label={`Etapa ${stageIndex + 1} de ${activeStages.length}`}>
          <span style={{ width: `${((stageIndex + (feedback?.state === 'correct' ? 1 : 0)) / activeStages.length) * 100}%` }} />
        </div>
      </header>

      <div className="journey-layout">
        <div className="journey-visual-column">
          {renderDiagram(diagramStageIndex, feedback?.state === 'correct')}
          <section className="relation-ledger" aria-label="Relações estabelecidas">
            <small>Workspace · relações estabelecidas</small>
            {visibleWorkspace.length ? (
              <ol>{visibleWorkspace.map((item) => <li key={item.id}><Check size={15} /><span>{item.workspaceEntry}</span></li>)}</ol>
            ) : <p>Nenhuma relação foi estabelecida. Resolva a primeira decisão.</p>}
          </section>
        </div>

        <aside className="journey-decision-panel">
          <span className="eyebrow">{stage.phase} · {stageIndex + 1}/{activeStages.length}</span>
          <h2>{stage.prompt}</h2>
          <p>{stage.context}</p>
          <div className="journey-options" role="group" aria-label="Escolhas matemáticas">
            {stage.options.map((item) => (
              <button
                type="button"
                key={item.id}
                className={selectedId === item.id ? 'is-selected' : ''}
                aria-pressed={selectedId === item.id}
                disabled={feedback?.state === 'correct'}
                onClick={() => { setSelectedId(item.id); setFeedback(undefined); }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <fieldset className="confidence-check">
            <legend>Antes de verificar, quão seguro você está? <small>opcional</small></legend>
            <div>
              {[
                { value: 0.25, label: 'Ainda pensando' },
                { value: 0.60, label: 'Razoavelmente' },
                { value: 0.90, label: 'Muito seguro' },
              ].map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={selfConfidence === option.value ? 'is-selected' : ''}
                  aria-pressed={selfConfidence === option.value}
                  onClick={() => setSelfConfidence(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
          {hintUsed && <aside className="journey-hint" role="status"><Lightbulb size={17} /><span><small>Pista conceitual · tier 2</small>{stage.hint}</span></aside>}
          {feedback && <FeedbackPanel state={feedback.state}>{feedback.message}</FeedbackPanel>}
          <div className="journey-actions">
            <button type="button" className="text-action" disabled={hintUsed || feedback?.state === 'correct'} onClick={() => setHintUsed(true)}><Lightbulb size={16} /> Pedir pista</button>
            <button type="button" className="primary-action" disabled={!selectedId} onClick={feedback?.state === 'correct' ? advance : verify}>
              {feedback?.state === 'correct' ? <>{stageIndex === activeStages.length - 1 ? 'Concluir rota' : 'Registrar e avançar'} <ArrowRight size={16} /></> : 'Sustentar resposta'}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
