import { ArrowRight, Award, Flame, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProgress } from '../../state/progress';

export function MissionRewardCard({ completionId }: { completionId: string }) {
  const { progress } = useProgress();
  const reward = progress.lastMissionReward?.completionId === completionId
    ? progress.lastMissionReward
    : undefined;

  if (!reward) return null;

  return (
    <section className="mission-reward" aria-label="Recompensa da missão" role="status">
      <div className="mission-reward__seal"><Sparkles aria-hidden="true" /></div>
      <span className="eyebrow">Missão concluída</span>
      <h2>Conhecimento conquistado</h2>
      <div className="mission-reward__stats">
        <strong>+{reward.xp + reward.bonusXp} XP</strong>
        <span aria-label={`${reward.stars} de 3 estrelas`}>
          {[1, 2, 3].map((star) => <Star key={star} className={star <= reward.stars ? 'is-earned' : ''} fill="currentColor" />)}
        </span>
      </div>
      <p>{reward.conceptLabel}</p>
      {reward.bonusXp > 0 && <div className="reward-ribbon"><Flame size={17} /> Quest concluída · +{reward.bonusXp} XP</div>}
      {reward.achievementUnlocked && <div className="reward-ribbon"><Award size={17} /> Conquista · {reward.achievementUnlocked}</div>}
      {reward.nextMissionTitle && <p className="mission-reward__next">Próxima missão: <strong>{reward.nextMissionTitle}</strong></p>}
      <Link className="primary-action primary-action--wide" to="/map">Continuar jornada <ArrowRight size={17} /></Link>
    </section>
  );
}
