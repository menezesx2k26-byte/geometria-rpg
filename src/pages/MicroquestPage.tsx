import { ArrowLeft, Clock3, Target } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FeedbackPanel } from '../components/rpg';
import { findMicroquest } from '../data/microquests';
import { useProgress } from '../state/progress';

export function MicroquestPage() {
  const { id = '' } = useParams();
  const microquest = findMicroquest(id);
  const { completeMicroquest, recordAttempt } = useProgress();
  const [selectedId, setSelectedId] = useState<string>();
  const [feedback, setFeedback] = useState<'correct' | 'incorrect'>();

  if (!microquest) return <section className="page empty-page"><h1>Microquest não encontrada</h1><Link to="/review">Voltar à revisão</Link></section>;

  const verify = () => {
    if (!selectedId) return;
    const correct = selectedId === microquest.correctOptionId;
    recordAttempt(
      `microquest:${microquest.id}`,
      'single-competency',
      [selectedId],
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
            <button type="button" key={option.id} className={selectedId === option.id ? 'is-selected' : ''} onClick={() => { setSelectedId(option.id); setFeedback(undefined); }} disabled={feedback === 'correct'}>{option.label}</button>
          ))}
        </div>
        {feedback && <FeedbackPanel state={feedback}>{feedback === 'correct' ? microquest.successMessage : microquest.errorMessage}</FeedbackPanel>}
        {feedback === 'correct' ? (
          <Link className="primary-action primary-action--wide" to={`/encounter/${microquest.returnEncounterId}`}>Retornar ao encounter original</Link>
        ) : (
          <button type="button" className="primary-action primary-action--wide" disabled={!selectedId} onClick={verify}>Verificar relação</button>
        )}
      </article>
    </section>
  );
}
