import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { skills } from '../data/bootstrap';
import { findDidacticLesson } from '../data/didacticLessons';
import { checksForDidacticLesson } from '../data/didacticPracticeChecks';
import { useProgress } from '../state/progress';

export function DidacticLessonPage() {
  const { id = '' } = useParams();
  const lesson = findDidacticLesson(id);
  const navigate = useNavigate();
  const { progress, completeEncounter } = useProgress();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const checks = useMemo(() => lesson ? checksForDidacticLesson(lesson) : [], [lesson]);

  const completed = Boolean(lesson && progress.completedEncounterIds.includes(lesson.completionId));
  const allCorrect = useMemo(() => {
    if (!lesson) return false;
    return checks.every((check) => answers[check.id] === check.correctOptionId);
  }, [answers, checks, lesson]);

  if (!lesson) {
    return (
      <section className="page empty-page">
        <span className="eyebrow">Microlição não encontrada</span>
        <h1>Essa ponte didática não existe.</h1>
        <Link className="primary-action" to="/map">Voltar ao mapa</Link>
      </section>
    );
  }

  const finishLesson = () => {
    if (!allCorrect && !completed) return;
    if (!completed) {
      const skillIds = [...new Set([...lesson.introduces, ...lesson.guidedPractice])];
      const codexEntryIds = skillIds.flatMap((skillId) => {
        const skill = skills.find((item) => item.id === skillId);
        return skill ? [skill.codexEntryId] : [];
      });
      completeEncounter(lesson.completionId, skillIds, codexEntryIds, `/lesson/${lesson.id}`);
    }
    navigate('/map');
  };

  return (
    <section className="page didactic-lesson-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Ponte didática · primeiro contato</span>
          <h1>{lesson.title}</h1>
          <p>{lesson.subtitle}</p>
        </div>
        <Link className="secondary-action" to="/map">Voltar ao mapa</Link>
      </header>

      <article className="mission-card">
        <h2>Objetivo</h2>
        <p>{lesson.goal}</p>
        <p className="muted-note">
          Aqui você está aprendendo. Uma tentativa incorreta nesta microlição não reduz domínio nem gera diagnóstico negativo.
        </p>
      </article>

      <div className="lesson-stack">
        {lesson.sections.map((section, index) => (
          <article className="mission-card" key={section.title}>
            <span className="eyebrow">{String(index + 1).padStart(2, '0')} · CONSTRUIR</span>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
            <div className="workspace-card">
              <strong>Exemplo</strong>
              <p>{section.example}</p>
            </div>
          </article>
        ))}
      </div>

      <section className="mission-card" aria-labelledby="guided-check-title">
        <span className="eyebrow">Prática guiada</span>
        <h2 id="guided-check-title">Confirme as relações antes de seguir</h2>
        <p>Você pode tentar novamente sem penalidade. O objetivo aqui é construir a ideia, não medir desempenho.</p>

        <div className="lesson-stack">
          {checks.map((check, checkIndex) => {
            const selected = answers[check.id];
            const selectedOption = check.options.find((item) => item.id === selected);
            const isCorrect = selected === check.correctOptionId;
            return (
              <fieldset className="mission-card" key={check.id}>
                <legend><strong>{checkIndex + 1}. {check.prompt}</strong></legend>
                <div className="option-grid">
                  {check.options.map((item) => (
                    <button
                      className="choice-card"
                      type="button"
                      key={item.id}
                      aria-pressed={selected === item.id}
                      onClick={() => setAnswers((current) => ({ ...current, [check.id]: item.id }))}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                {selectedOption ? (
                  <p role="status" className={isCorrect ? 'success-text' : 'feedback-text'}>
                    {selectedOption.feedback}
                  </p>
                ) : null}
              </fieldset>
            );
          })}
        </div>
      </section>

      <div className="page-actions">
        <button
          className="primary-action"
          type="button"
          disabled={!allCorrect && !completed}
          onClick={finishLesson}
        >
          {completed ? 'Voltar ao mapa' : 'Concluir ponte didática'}
        </button>
      </div>
    </section>
  );
}
