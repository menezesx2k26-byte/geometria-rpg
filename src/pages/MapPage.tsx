import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Checkpoint, QuestFrame, RegionBanner, RPGDivider, SkillNode } from '../components/rpg';
import { encounters, regions, skills } from '../data/bootstrap';
import { useProgress } from '../state/progress';

export function MapPage() {
  const { progress } = useProgress();
  const visibleRegions = regions.filter(
    (region) =>
      region.visibility === 'visibleButLocked' ||
      region.skillIds.some((id) => progress.discoveredSkillIds.includes(id)),
  );

  return (
    <section className="page map-page">
      <div className="hero">
        <span className="eyebrow">Mapa euclidiano · névoa ativa</span>
        <h1>O conhecimento aparece quando você abre um caminho.</h1>
        <p>
          Habilidades visíveis mostram o próximo objetivo. Descobertas avançadas continuam
          ocultas até que seus pré-requisitos sejam dominados.
        </p>
      </div>
      <Link className="vertical-slice-cta" to="/vertical-slice"><span>5 rotas jogáveis</span><strong>Escolher uma expedição matemática</strong><ArrowRight /></Link>

      <RPGDivider label="Trilhas reveladas" />

      {visibleRegions.map((region) => {
        const visibleSkills = region.skillIds
          .map((id) => skills.find((skill) => skill.id === id))
          .filter((skill) =>
            skill &&
            (skill.visibility === 'visibleButLocked' ||
              progress.discoveredSkillIds.includes(skill.id)),
          );
        if (!visibleSkills.length) return null;
        return (
          <section className="map-region" key={region.id}>
            <RegionBanner region={region} index={regions.indexOf(region)} />
            <div className="region-path" aria-label={`Trilha: ${region.title}`}>
              {visibleSkills.map((skill) => {
                if (!skill) return null;
                const profile = progress.skills[skill.id];
                return profile ? <SkillNode key={skill.id} skill={skill} profile={profile} /> : null;
              })}
            </div>
            <Checkpoint
              title={region.title}
              complete={region.skillIds.length > 0 && region.skillIds.every((id) => progress.skills[id]?.state === 'mastered')}
            />
          </section>
        );
      })}

      <QuestFrame>
        <div className="encounter-card">
          <div>
            <small>Encounter disponível</small>
            <h2>{encounters[0]?.title}</h2>
            <p>{encounters[0]?.briefing}</p>
          </div>
          <Link to={`/encounter/${encounters[0]?.id}`} className="primary-action">
            Investigar <ArrowRight size={17} />
          </Link>
        </div>
      </QuestFrame>
    </section>
  );
}
