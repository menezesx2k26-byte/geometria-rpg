import { Award, Crown, Flame, LockKeyhole, ScrollText, Shield, Star } from 'lucide-react';
import { achievementDefinitions, gameQuests } from '../data/gameCampaign';
import { useProgress } from '../state/progress';

const achievementIcons = { scroll: ScrollText, star: Star, crown: Crown, flame: Flame, shield: Shield };

export function AchievementsPage() {
  const { progress } = useProgress();
  return (
    <section className="page achievements-page">
      <header className="page-heading"><span className="eyebrow">Salão de conquistas</span><h1>Marcas de uma jornada real.</h1><p>Recompensas celebram estudo consistente e precisão, sem punições, compras ou competição obrigatória.</p></header>
      <section className="quest-board">
        <span className="eyebrow">Quests curtas</span><h2>Objetivos em andamento</h2>
        <div>
          {gameQuests.map((quest) => {
            const state = progress.quests[quest.id];
            const percent = Math.round(((state?.value ?? 0) / quest.target) * 100);
            return <article key={quest.id} className={state?.completed ? 'is-complete' : ''}><Flame /><span><strong>{quest.title}</strong><small>{quest.description}</small><span className="quest-progress"><i style={{ width: `${percent}%` }} /></span></span><em>{state?.completed ? `+${quest.rewardXp} XP` : `${state?.value ?? 0}/${quest.target}`}</em></article>;
          })}
        </div>
      </section>
      <section className="achievement-grid" aria-label="Conquistas">
        {achievementDefinitions.map((definition) => {
          const unlocked = progress.achievements.some((entry) => entry.achievementId === definition.id);
          const Icon = achievementIcons[definition.icon];
          return <article key={definition.id} className={unlocked ? 'is-unlocked' : 'is-locked'}><span>{unlocked ? <Icon /> : <LockKeyhole />}</span><small>{unlocked ? 'Conquistada' : 'Selada'}</small><h2>{definition.title}</h2><p>{definition.description}</p>{unlocked && <Award size={16} />}</article>;
        })}
      </section>
    </section>
  );
}
