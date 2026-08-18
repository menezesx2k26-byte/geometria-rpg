import { ArrowRight, BarChart3, BookOpen, BrainCircuit, Flame, Gauge, Library, RotateCcw, ShieldCheck, Sparkles, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { campaignNodes } from '../data/gameCampaign';
import { useProgress } from '../state/progress';
import { confidenceLabel, findHardCompetency } from '../data/competencies';
import { selectAdaptiveRecommendation } from '../engine/adaptiveSelector';

export function ProfilePage() {
  const { progress } = useProgress();
  const completed = Object.values(progress.missionProgress).filter((mission) => mission.completions > 0).length;
  const perfect = Object.values(progress.missionProgress).filter((mission) => mission.bestStars === 3).length;
  const observedCompetencyStates = Object.values(progress.competencyStates).filter((state) => state.evidenceCount > 0);
  const averageMastery = observedCompetencyStates.length
    ? Math.round(observedCompetencyStates.reduce((sum, state) => sum + state.mastery, 0) / observedCompetencyStates.length * 100)
    : 0;
  const dueReviews = Object.values(progress.reviewSchedule).filter((entry) => new Date(entry.nextReview) <= new Date()).length;
  const competencyStates = Object.values(progress.competencyStates).filter((state) => state.evidenceCount > 0);
  const strongest = [...competencyStates].sort((left, right) => right.mastery - left.mastery).slice(0, 3);
  const recommendation = selectAdaptiveRecommendation(progress.competencyStates, progress.attemptsV4);

  return (
    <section className="page profile-page">
      <header className="profile-hero">
        <span className="profile-avatar" aria-hidden="true">G</span>
        <div><span className="eyebrow">Perfil local</span><h1>Geômetra nível {progress.level}</h1><p>Dados salvos somente neste navegador. Nenhuma conta ou ranking externo é necessário.</p></div>
      </header>
      <div className="profile-stats">
        <article><Sparkles /><strong>{progress.xp}</strong><span>XP total</span></article>
        <article><Flame /><strong>{progress.streak.current}</strong><span>dias em sequência</span></article>
        <article><Swords /><strong>{completed}/{campaignNodes.length}</strong><span>missões</span></article>
        <article><BarChart3 /><strong>{averageMastery}%</strong><span>domínio estimado</span></article>
      </div>
      <section className="profile-panel">
        <div><span className="eyebrow">Desempenho</span><h2>Seu registro de estudo</h2></div>
        <ul>
          <li><strong>{perfect}</strong><span>missões perfeitas</span></li>
          <li><strong>{progress.attempts.length}</strong><span>decisões registradas</span></li>
          <li><strong>{progress.hintsUsed}</strong><span>pistas consultadas</span></li>
          <li><strong>{dueReviews}</strong><span>conceitos para revisar</span></li>
        </ul>
      </section>
      <section className="profile-competencies">
        <div><span className="eyebrow">Ficha do Geômetra</span><h2>Leitura por evidências</h2><p>O domínio é calculado separadamente das recompensas da campanha.</p></div>
        {strongest.length ? <div>{strongest.map((state) => {
          const definition = findHardCompetency(state.competencyId);
          return definition ? <article key={state.competencyId}><ShieldCheck /><span><strong>{definition.rpgName}</strong><small>{definition.name}</small><em><Gauge size={13} /> confiança {confidenceLabel(state.evidenceCount, state.confidence)}</em></span><b>{Math.round(state.mastery * 100)}%</b></article> : null;
        })}</div> : <p>As primeiras missões formarão sua ficha sem usar XP como atalho.</p>}
        {recommendation && <Link to={recommendation.route}><BrainCircuit /><span><small>{recommendation.actionLabel}</small><strong>{recommendation.title}</strong></span><ArrowRight /></Link>}
      </section>
      <section className="academy-library">
        <span className="eyebrow">Biblioteca da Academia</span>
        <h2>Ferramentas preservadas</h2>
        <p>Os sistemas avançados continuam disponíveis como apoio ao caminho principal.</p>
        <div>
          <Link to="/codex"><BookOpen /><span><strong>Codex</strong><small>Definições e teoremas</small></span></Link>
          <Link to="/training"><BrainCircuit /><span><strong>Treino de provas</strong><small>Modos treino e exame</small></span></Link>
          <Link to="/review"><RotateCcw /><span><strong>Revisão adaptativa</strong><small>Diagnóstico e microquests</small></span></Link>
          <Link to="/vertical-slice"><Library /><span><strong>Arquivo de expedições</strong><small>Rotas e campanhas anteriores</small></span></Link>
        </div>
      </section>
    </section>
  );
}
