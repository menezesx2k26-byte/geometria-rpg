import { BrainCircuit, Play, RotateCcw, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { microquests } from '../data/microquests';
import { skills } from '../data/bootstrap';
import { useProgress } from '../state/progress';
import type { MasteryDimension } from '../types/domain';

const dimensionLabels: Record<MasteryDimension, string> = {
  recognition: 'Reconhecimento',
  application: 'Aplicação',
  justification: 'Justificação',
  reproduction: 'Reprodução',
  transfer: 'Transferência',
};

export function ReviewPage() {
  const { progress, resetProgress } = useProgress();
  const incorrect = progress.attempts.filter((attempt) => !attempt.correct);
  const practicedProfiles = Object.values(progress.skills).filter((profile) => profile.totalAttempts > 0);
  const dimensionScores = Object.keys(dimensionLabels).map((dimension) => {
    const key = dimension as MasteryDimension;
    const scores = practicedProfiles.map((profile) => profile.dimensions.find((item) => item.dimension === key)?.score ?? 0);
    return { dimension: key, score: scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0 };
  });
  const recommendations = progress.recommendedMicroquestIds
    .map((id) => microquests.find((microquest) => microquest.id === id))
    .filter((microquest) => microquest !== undefined);
  const activeErrors = Object.entries(progress.errorTagCounts).filter(([, count]) => (count ?? 0) > 0);

  return (
    <section className="page">
      <div className="page-heading"><span className="eyebrow">Diagnóstico local</span><h1>Domínio não é XP.</h1><p>Cada barra mede uma forma diferente de usar a Matemática. Pistas não apagam acertos; elas reduzem apenas o ganho de autonomia.</p></div>

      <div className="diagnostic-summary">
        <div><BrainCircuit size={28} /><strong>{progress.attempts.length}</strong><span>tentativas</span></div>
        <div><Target size={28} /><strong>{incorrect.length}</strong><span>erros diagnosticados</span></div>
        <div><Play size={28} /><strong>{progress.completedEncounterIds.length}</strong><span>encounters concluídos</span></div>
      </div>

      <section className="mastery-dashboard">
        <h2>Perfil de domínio · 0–100</h2>
        {dimensionScores.map(({ dimension, score }) => (
          <div className="dimension-row" key={dimension}><span>{dimensionLabels[dimension]}</span><div><i style={{ width: `${score}%` }} /></div><strong>{Math.round(score)}</strong></div>
        ))}
      </section>

      {recommendations.length > 0 && (
        <section className="microquest-recommendations">
          <span className="eyebrow">Erros recorrentes</span><h2>Microquests recomendadas</h2>
          <div>{recommendations.map((microquest) => <Link key={microquest.id} to={`/microquest/${microquest.id}`}><small>{microquest.duration}</small><strong>{microquest.title}</strong><span>{microquest.competency}</span></Link>)}</div>
        </section>
      )}

      <section className="diagnostic-tags">
        <h2>Tags observadas</h2>
        {activeErrors.length ? <div>{activeErrors.map(([tag, count]) => <span key={tag}>{tag} <strong>{count}</strong></span>)}</div> : <p>Nenhum padrão de erro recorrente foi observado.</p>}
      </section>

      <section className="skill-diagnostics">
        <h2>Skills praticadas</h2>
        <div>{skills.filter((skill) => progress.skills[skill.id]?.totalAttempts).map((skill) => { const profile = progress.skills[skill.id]; return profile ? <article key={skill.id}><strong>{skill.shortTitle}</strong><span>{Math.round(profile.mastery)}/100</span><small>{profile.correctAttempts}/{profile.totalAttempts} aplicações corretas</small></article> : null; })}</div>
      </section>

      <div className="review-actions"><Link className="primary-action" to={progress.lastPosition}><Play size={16} /> Continuar de onde parei</Link><button type="button" className="text-action" onClick={resetProgress}><RotateCcw size={16} /> Reiniciar progresso</button></div>
    </section>
  );
}
