import { ArrowLeft, ArrowRight, Crown, LockKeyhole, MapPinned, ScrollText } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Checkpoint } from '../components/rpg';
import { euclideanCampaignQuests, euclideanCampaignRegions, findEuclideanQuest, findEuclideanRegion } from '../data/campaignEuclidean';
import { useProgress } from '../state/progress';

function regionUnlocked(order: number, completedEncounterIds: string[]) {
  if (order === 1) return true;
  const previous = euclideanCampaignRegions.find((region) => region.order === order - 1);
  if (!previous) return false;
  const previousPlayable = euclideanCampaignQuests.filter((quest) => quest.regionId === previous.id && quest.playableRoute);
  return previousPlayable.length > 0 && previousPlayable.every((quest) => completedEncounterIds.some((id) => quest.playableRoute?.includes(id.replace('proof:', ''))));
}

export function CampaignPage() {
  const { regionId, questId } = useParams();
  const { progress } = useProgress();
  const quest = questId ? findEuclideanQuest(questId) : undefined;
  const region = regionId ? findEuclideanRegion(regionId) : undefined;

  if (quest) {
    return (
      <section className="page campaign-quest-page">
        <Link className="back-link" to={`/campaign/euclidean/${quest.regionId}`}><ArrowLeft size={16} /> Região</Link>
        <article className="campaign-quest-detail">
          <span className="eyebrow">Lista 1 · Questão {quest.number}</span>
          <h1>{quest.title}</h1>
          <p>{quest.sourceQuestion}</p>
          <div className="quest-metadata">
            <span>Dificuldade <strong>{quest.difficulty}/5</strong></span><span>Prova <strong>{quest.proofType}</strong></span>
          </div>
          <dl>
            <div><dt>Requer</dt><dd>{quest.requires.join(' · ') || 'Fundamentos da região'}</dd></div>
            <div><dt>Ensina</dt><dd>{quest.teaches.join(' · ') || 'Síntese sem skill nova'}</dd></div>
            <div><dt>Reforça</dt><dd>{quest.reinforces.join(' · ') || 'Raciocínio da região'}</dd></div>
            <div><dt>Erros comuns</dt><dd>{quest.commonErrors.join(' · ') || 'Sem tag específica'}</dd></div>
            <div><dt>Recuperação</dt><dd>{quest.recoverySkills.join(' · ') || 'Revisão da região'}</dd></div>
          </dl>
          {quest.playableRoute ? <Link className="primary-action primary-action--wide" to={quest.playableRoute}>Entrar no encounter <ArrowRight size={16} /></Link> : <div className="content-planned"><ScrollText /><div><strong>Encounter catalogado</strong><p>Metadados e dependências prontos; a interação completa será aberta quando a névoa desta região for removida.</p></div></div>}
        </article>
      </section>
    );
  }

  if (region) {
    const quests = euclideanCampaignQuests.filter((item) => item.regionId === region.id);
    return (
      <section className="page">
        <Link className="back-link" to="/campaign/euclidean"><ArrowLeft size={16} /> Campanha</Link>
        <div className="campaign-region-heading" style={{ '--campaign-accent': region.accent } as CSSProperties}><span>{String(region.order).padStart(2, '0')}</span><div><small>{region.subtitle}</small><h1>{region.title}</h1><p>{region.description}</p></div></div>
        <div className="campaign-quest-grid">
          {quests.map((item) => <Link key={item.id} className={region.bossQuestIds.includes(item.id) ? 'campaign-quest-card is-boss' : 'campaign-quest-card'} to={`/campaign/euclidean/${region.id}/${item.id}`}><span>{item.number}</span><div><small>{item.proofType}</small><strong>{item.title}</strong><em>{item.playableRoute ? 'Jogável agora' : 'Catalogado'}</em></div>{region.bossQuestIds.includes(item.id) && <Crown />}</Link>)}
        </div>
        <Checkpoint title={region.title} complete={false} />
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-heading"><span className="eyebrow">Lista 1 · 43 questões transformadas</span><h1>Campanha Euclidiana</h1><p>Nove regiões convertem a lista em investigação, provas, construções e bosses. Questões sem interação completa permanecem sob névoa, não como lista estática disfarçada.</p></div>
      <div className="campaign-region-grid">
        {euclideanCampaignRegions.map((item) => {
          const unlocked = regionUnlocked(item.order, progress.completedEncounterIds);
          return <Link key={item.id} to={unlocked ? `/campaign/euclidean/${item.id}` : '#'} aria-disabled={!unlocked} className={unlocked ? 'campaign-region-card' : 'campaign-region-card is-locked'} style={{ '--campaign-accent': item.accent } as CSSProperties}><span>{unlocked ? <MapPinned /> : <LockKeyhole />}</span><div><small>Região {String(item.order).padStart(2, '0')} · {item.subtitle}</small><h2>{item.title}</h2><p>{unlocked ? item.description : 'Complete os encounters da região anterior para dissipar a névoa.'}</p></div></Link>;
        })}
      </div>
    </section>
  );
}
