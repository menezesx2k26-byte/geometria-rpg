import { BarChart3, BookOpen, BrainCircuit, Flame, Library, RotateCcw, Sparkles, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { campaignNodes } from '../data/gameCampaign';
import { useProgress } from '../state/progress';

export function ProfilePage() {
  const { progress } = useProgress();
  const completed = Object.values(progress.missionProgress).filter((mission) => mission.completions > 0).length;
  const perfect = Object.values(progress.missionProgress).filter((mission) => mission.bestStars === 3).length;
  const practiced = Object.values(progress.skills).filter((skill) => skill.totalAttempts > 0);
  const averageMastery = practiced.length
    ? Math.round(practiced.reduce((sum, skill) => sum + skill.mastery, 0) / practiced.length)
    : 0;
  const dueReviews = Object.values(progress.reviewSchedule).filter((entry) => new Date(entry.nextReview) <= new Date()).length;

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
        <article><BarChart3 /><strong>{averageMastery}%</strong><span>domínio médio</span></article>
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
