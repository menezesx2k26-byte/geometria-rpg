import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
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
            <header className="map-region__header">
              <span className="eyebrow">{region.subtitle}</span>
              <h2>{region.title}</h2>
            </header>
            <div className="region-path" aria-label={`Trilha: ${region.title}`}>
              {visibleSkills.map((skill, index) => {
                if (!skill) return null;
                const profile = progress.skills[skill.id];
                const locked = profile?.state === 'locked';
                return (
                  <article
                    className={`skill-node skill-node--${profile?.state ?? 'locked'}`}
                    key={skill.id}
                  >
                    <div className="skill-node__index">
                      {locked ? <LockKeyhole size={18} /> : index + 1}
                    </div>
                    <div>
                      <small>{skill.shortTitle}</small>
                      <h3>{skill.title}</h3>
                      <p>{skill.description}</p>
                    </div>
                    <span className="state-label">{profile?.state ?? 'locked'}</span>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="encounter-card">
        <span className="encounter-card__icon"><Sparkles size={20} /></span>
        <div>
          <small>Encounter disponível</small>
          <h2>{encounters[0]?.title}</h2>
          <p>{encounters[0]?.briefing}</p>
        </div>
        <Link to={`/encounter/${encounters[0]?.id}`} className="primary-action">
          Investigar <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
