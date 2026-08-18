import { ArrowRight, BrainCircuit, Check, Crown, Flame, LockKeyhole, MapPinned, RotateCcw, Shield, Sparkles, Star } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { activeQuest, campaignChapters, campaignNodes, getCampaignNodeState, getDueAdaptiveReview, getNextCampaignNode } from '../data/gameCampaign';
import { useProgress } from '../state/progress';
import type { CampaignNode, CampaignNodeState } from '../types/domain';
import { selectAdaptiveRecommendation } from '../engine/adaptiveSelector';

const stateLabels: Record<CampaignNodeState, string> = {
  locked: 'Bloqueada', current: 'Agora', available: 'Disponível', completed: 'Concluída', perfect: 'Perfeita',
};

function MissionNode({ node, state, stars }: { node: CampaignNode; state: CampaignNodeState; stars: number }) {
  const locked = state === 'locked';
  const content = (
    <>
      <span className="campaign-node__icon" aria-hidden="true">
        {locked ? <LockKeyhole /> : node.type === 'boss' ? <Crown /> : state === 'perfect' ? <Star fill="currentColor" /> : state === 'completed' ? <Check /> : <Shield />}
      </span>
      <span className="campaign-node__body">
        <small>{node.narrativeLabel} · {stateLabels[state]}</small>
        <strong>{node.title}</strong>
        <span>{node.subtitle}</span>
      </span>
      <span className="campaign-node__reward">
        {state === 'completed' || state === 'perfect'
          ? <span aria-label={`${stars} estrelas`}>{[1, 2, 3].map((item) => <Star key={item} size={13} fill={item <= stars ? 'currentColor' : 'none'} />)}</span>
          : <>{node.reward.xp} XP</>}
      </span>
    </>
  );
  return locked
    ? <article className={`campaign-node campaign-node--${state}`} aria-label={`${node.title}, bloqueada`}>{content}</article>
    : <Link className={`campaign-node campaign-node--${state} campaign-node--${node.type}`} to={node.route}>{content}</Link>;
}

export function MapPage() {
  const { progress } = useProgress();
  const nextNode = getNextCampaignNode(progress);
  const dueReview = getDueAdaptiveReview(progress);
  const adaptiveRecommendation = selectAdaptiveRecommendation(progress.competencyStates, progress.attemptsV4);
  const quest = activeQuest(progress);
  const questProgress = quest ? progress.quests[quest.id] : undefined;
  const levelProgress = progress.xp % 100;

  return (
    <section className="page path-page">
      <header className="path-hero">
        <div>
          <span className="eyebrow">Caminho principal · Academia Euclidiana</span>
          <h1>Uma missão de cada vez.</h1>
          <p>Aprenda, pratique, receba feedback e desbloqueie o próximo território. Seu progresso anterior foi preservado.</p>
        </div>
        <div className="player-summary" aria-label="Status do jogador">
          <span><Sparkles size={17} /><strong>Nível {progress.level}</strong><small>{progress.xp} XP total</small></span>
          <span><Flame size={17} /><strong>{progress.streak.current} dias</strong><small>melhor: {progress.streak.best}</small></span>
          <div><span style={{ width: `${levelProgress}%` }} /></div>
        </div>
      </header>

      {nextNode ? (
        <Link className="continue-mission" to={nextNode.route}>
          <span><MapPinned /><small>Continuar jornada</small><strong>{nextNode.title}</strong><em>{nextNode.subtitle}</em></span>
          <ArrowRight />
        </Link>
      ) : (
        <div className="continue-mission is-complete"><span><Crown /><small>Jornada concluída</small><strong>Todos os selos foram abertos</strong></span></div>
      )}

      {(dueReview || adaptiveRecommendation) && (
        <section className="adaptive-suggestions" aria-label="Recomendações opcionais">
          <header><span className="eyebrow">Rotas secundárias</span><h2>Fortalecer sem sair do caminho</h2><p>Estas atividades não substituem nem bloqueiam a próxima missão.</p></header>
          <div>
            {dueReview && (
              <Link to={dueReview.route}>
                <RotateCcw />
                <span><small>Revisão programada</small><strong>{dueReview.title}</strong><em>{dueReview.subtitle}</em></span>
                <ArrowRight />
              </Link>
            )}
            {adaptiveRecommendation && adaptiveRecommendation.route !== dueReview?.route && (
              <Link to={adaptiveRecommendation.route}>
                <BrainCircuit />
                <span><small>{adaptiveRecommendation.actionLabel}</small><strong>{adaptiveRecommendation.title}</strong><em>{adaptiveRecommendation.reason}</em></span>
                <ArrowRight />
              </Link>
            )}
          </div>
        </section>
      )}

      {quest && questProgress && (
        <aside className="active-quest">
          <Flame />
          <span><small>Quest ativa</small><strong>{quest.title}</strong><em>{quest.description}</em></span>
          <span>{questProgress.value}/{questProgress.target}</span>
        </aside>
      )}

      <div className="campaign-path" aria-label="Jornada de aprendizagem">
        {campaignChapters.map((chapter) => (
          <section className="campaign-chapter" key={chapter.id} style={{ '--chapter-accent': chapter.accent } as CSSProperties}>
            <header>
              <span>{String(chapter.order).padStart(2, '0')}</span>
              <div><small>{chapter.subtitle}</small><h2>{chapter.title}</h2><p>{chapter.description}</p></div>
            </header>
            <div className="campaign-node-list">
              {chapter.nodeIds.map((nodeId) => {
                const node = campaignNodes.find((candidate) => candidate.id === nodeId);
                if (!node) return null;
                return <MissionNode key={node.id} node={node} state={getCampaignNodeState(progress, node)} stars={progress.missionProgress[node.id]?.bestStars ?? 0} />;
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
