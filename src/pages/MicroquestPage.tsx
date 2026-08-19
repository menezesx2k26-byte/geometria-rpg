import { ArrowLeft, Clock3, Target } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FeedbackPanel } from '../components/rpg';
import { MissionRewardCard } from '../components/campaign/MissionRewardCard';
import { CompetencyDebrief } from '../components/learning/CompetencyDebrief';
import { findMicroquest } from '../data/microquests';
import { useProgress } from '../state/progress';
import { isAcceptedOption, supportsFreeTextAnswer, validateFreeTextAnswer } from '../engine/answerAcceptance';

export function MicroquestPage() {
  const { id = '' } = useParams();
  const microquest = findMicroquest(id);
  const { completeMicroquest, recordAttempt } = useProgress();
  const [selectedId, setSelectedId] = useState<string>();
  const [freeAnswer, setFreeAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect'>();

  if (!microquest) return <section className="page empty-page"><h1>Microquest não encontrada</h1><Link to="/review">Voltar à revisão</Link></section>;
  const acceptsFreeText = supportsFreeTextAnswer('microquest', microquest.id);
  const hasResponse = Boolean(selectedId || (acceptsFreeText && freeAnswer.trim()));

  const verify = () => {
    if (!hasResponse) return;
    const typed = acceptsFreeText ? freeAnswer.trim() : '';
    const textResult = typed ? validateFreeTextAnswer('microquest', microquest.id, typed) : undefined;
    const correct = textResult
      ? textResult.correct
      : isAcceptedOption(selectedId, microquest.correctOptionId, microquest.id === 'correspondence-pairs' ? ['fd'] : []);
    const recorded = typed ? `free:${typed}` : selectedId ?? '';
    recordAttempt(
      `microquest:${microquest.id}`,
      'single-competency',
      [recorded],
      correct,
      correct ? [] : [microquest.diagnosticTag],
      {
        skillIds: [microquest.skillId],
        masteryDimensions: microquest.masteryDimensions,
        hintsUsed: 0,
        position: `/microquest/${microquest.id}`,
      },
    );
    setFeedback(correct ? 'correct' : 'incorrect');
    if (correct) completeMicroquest(microquest.id);
  };

  return (
    <section className="page microquest-page">
      <Link to="/review" className="back-link"><ArrowLeft size={16} /> Diagnóstico</Link>
      <article className="microquest-card">
        <div className="microquest-meta"><span><Target size={15} /> {microquest.competency}</span><span><Clock3 size={15} /> {microquest.duration}</span></div>
        <span className="eyebrow">Microquest · uma competência</span>
        <h1>{microquest.title}</h1>
        <h2>{microquest.prompt}</h2>
        <div className="microquest-options">
          {microquest.options.map((option) => (
            <button type="button" key={option.id} className={selectedId === option.id ? 'is-selected' : ''} aria-pressed={selectedId === option.id} onClick={() => { setSelectedId(option.id); setFreeAnswer(''); setFeedback(undefined); }} disabled={feedback === 'correct'}>{option.label}</button>
          ))}
        </div>
        {acceptsFreeText && (
          <label className="semantic-answer-field">
            <span>Ou responda com notação equivalente</span>
            <input
              type="text"
              value={freeAnswer}
              disabled={feedback === 'correct'}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => { setFreeAnswer(event.target.value); setSelectedId(undefined); setFeedback(undefined); }}
            />
            <small>Ex.: DF e FD são reconhecidos como o mesmo segmento.</small>
          </label>
        )}
        {feedback && <FeedbackPanel state={feedback}>{feedback === 'correct' ? microquest.successMessage : freeAnswer.trim() ? validateFreeTextAnswer('microquest', microquest.id, freeAnswer).message : microquest.errorMessage}</FeedbackPanel>}
        {feedback === 'correct' && <MissionRewardCard completionId={`microquest:${microquest.id}`} />}
        {feedback === 'correct' && <CompetencyDebrief encounterId={`microquest:${microquest.id}`} />}
        {feedback === 'correct' ? (
          <Link className="secondary-action secondary-action--wide" to={`/encounter/${microquest.returnEncounterId}`}>Rever encontro relacionado</Link>
        ) : (
          <button type="button" className="primary-action primary-action--wide" disabled={!hasResponse} onClick={verify}>Verificar relação</button>
        )}
      </article>
    </section>
  );
}
