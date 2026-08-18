import { ArrowRight, BrainCircuit, Clock3, Gauge, Play, RotateCcw, ShieldCheck, Target } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { microquests } from '../data/microquests';
import { skills } from '../data/bootstrap';
import { useProgress } from '../state/progress';
import type { MasteryDimension } from '../types/domain';
import { confidenceLabel, findHardCompetency } from '../data/competencies';
import { selectAdaptiveRecommendation } from '../engine/adaptiveSelector';

const dimensionLabels: Record<MasteryDimension, string> = {
  recognition: 'Reconhecimento',
  application: 'Aplicação',
  justification: 'Justificação',
  reproduction: 'Reprodução',
  transfer: 'Transferência',
};

function practiceRoute(skillId: string) {
  if (['parallel-angle-families', 'parallel-converse-skill', 'parallelogram-characterization'].includes(skillId)) return '/lab/parallelism';
  if (['general-line-equation', 'line-solution-set', 'vertical-horizontal-lines', 'supporting-line', 'linear-system-classification', 'system-intersection-interpretation'].includes(skillId)) return '/lab/line-forge';
  if (['figure-to-equation', 'exact-distance-proof', 'distance-formula-skill', 'coordinate-proof'].includes(skillId)) return '/lab/exercise-48';
  return '/training';
}

export function ReviewPage() {
  const { progress, resetProgress } = useProgress();
  const [reviewedAt] = useState(Date.now);
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
  const adaptiveQueue = practicedProfiles
    .filter((profile) => profile.mastery < 80)
    .sort((left, right) => left.mastery - right.mastery)
    .slice(0, 4)
    .map((profile) => ({ profile, skill: skills.find((skill) => skill.id === profile.skillId) }))
    .filter((item) => item.skill !== undefined);
  const observedCompetencies = Object.values(progress.competencyStates).filter((state) => state.evidenceCount > 0);
  const strengths = observedCompetencies
    .filter((state) => state.mastery >= 0.70)
    .sort((left, right) => right.mastery - left.mastery)
    .slice(0, 3);
  const developing = [...observedCompetencies]
    .filter((state) => state.mastery < 0.85)
    .sort((left, right) => left.mastery - right.mastery)
    .slice(0, 3);
  const adaptiveRecommendation = selectAdaptiveRecommendation(progress.competencyStates, progress.attemptsV4);

  return (
    <section className="page">
      <div className="page-heading"><span className="eyebrow">Diagnóstico local</span><h1>Domínio não é XP.</h1><p>Cada barra mede uma forma diferente de usar a Matemática. Pistas não apagam acertos; elas reduzem apenas o ganho de autonomia.</p></div>

      <div className="diagnostic-summary">
        <div><BrainCircuit size={28} /><strong>{progress.attempts.length}</strong><span>tentativas</span></div>
        <div><Target size={28} /><strong>{incorrect.length}</strong><span>erros diagnosticados</span></div>
        <div><Play size={28} /><strong>{progress.completedEncounterIds.length}</strong><span>encounters concluídos</span></div>
      </div>

      <section className="geometer-sheet">
        <header><span className="eyebrow">Ficha do Geômetra</span><h2>Competências observadas</h2><p>As estimativas abaixo não usam XP, nível, estrelas ou streak.</p></header>
        {observedCompetencies.length ? (
          <div className="geometer-sheet__columns">
            <div><h3><ShieldCheck size={17} /> Evidências mais fortes</h3>{strengths.length ? strengths.map((state) => {
              const definition = findHardCompetency(state.competencyId);
              return definition ? <article key={state.competencyId}><span><strong>{definition.rpgName}</strong><small>{definition.name}</small></span><em>{Math.round(state.mastery * 100)}%</em><small><Gauge size={13} /> confiança {confidenceLabel(state.evidenceCount, state.confidence)}</small></article> : null;
            }) : <p>Ainda não há evidência suficiente para nomear uma força com segurança.</p>}</div>
            <div><h3><BrainCircuit size={17} /> Em desenvolvimento</h3>{developing.length ? developing.map((state) => {
              const definition = findHardCompetency(state.competencyId);
              return definition ? <article key={state.competencyId}><span><strong>{definition.rpgName}</strong><small>{definition.name}</small></span><em>{Math.round(state.mastery * 100)}%</em><small><Gauge size={13} /> confiança {confidenceLabel(state.evidenceCount, state.confidence)}</small></article> : null;
            }) : <p>Nenhuma competência em desenvolvimento foi observada.</p>}</div>
          </div>
        ) : <p>Conclua decisões matemáticas para formar uma ficha baseada em evidências.</p>}
      </section>

      {adaptiveRecommendation && (
        <Link className="adaptive-primary-card" to={adaptiveRecommendation.route}>
          <BrainCircuit />
          <span><small>{adaptiveRecommendation.actionLabel}</small><strong>{adaptiveRecommendation.title}</strong><em>{adaptiveRecommendation.reason}</em></span>
          <ArrowRight />
        </Link>
      )}

      <section className="mastery-dashboard">
        <h2>Perfil de domínio · 0–100</h2>
        {dimensionScores.map(({ dimension, score }) => (
          <div className="dimension-row" key={dimension}><span>{dimensionLabels[dimension]}</span><div><i style={{ width: `${score}%` }} /></div><strong>{Math.round(score)}</strong></div>
        ))}
      </section>

      <section className="adaptive-review-queue">
        <span className="eyebrow">Fila adaptativa</span>
        <h2>Próximas recuperações</h2>
        {adaptiveQueue.length ? <div>{adaptiveQueue.map(({ profile, skill }) => {
          if (!skill) return null;
          const days = profile.lastPracticedAt ? Math.floor((reviewedAt - new Date(profile.lastPracticedAt).getTime()) / 86400000) : 0;
          return <Link key={profile.skillId} to={practiceRoute(profile.skillId)}><span><Clock3 size={15} /> {days > 0 ? `${days}d sem prática` : 'praticado hoje'}</span><strong>{skill.title}</strong><small>{Math.round(profile.mastery)}/100 · retomar pela competência mais fraca</small></Link>;
        })}</div> : <p>Pratique uma rota para que o diagnóstico organize recuperações por domínio baixo, erro recente e tempo sem prática.</p>}
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
