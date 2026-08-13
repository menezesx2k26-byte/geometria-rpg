import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { encounters, regions, skills } from '../data/bootstrap';
import { useProgress } from '../state/progress';

export function MapPage() {
  const { progress } = useProgress();
  const region = regions[0];
  if (!region) return null;

  return (
    <section className="page map-page">
      <div className="hero">
        <span className="eyebrow">Região 01 · descoberta ativa</span>
        <h1>{region.title}</h1>
        <p>{region.description}</p>
      </div>

      <div className="region-path" aria-label="Trilha de habilidades">
        {skills.map((skill, index) => {
          const profile = progress.skills[skill.id];
          const locked = profile?.state === 'locked';
          return (
            <article className={`skill-node skill-node--${profile?.state ?? 'locked'}`} key={skill.id}>
              <div className="skill-node__index">{locked ? <LockKeyhole size={18} /> : index + 1}</div>
              <div>
                <small>{skill.shortTitle}</small>
                <h2>{skill.title}</h2>
                <p>{skill.description}</p>
              </div>
              <span className="state-label">{profile?.state ?? 'locked'}</span>
            </article>
          );
        })}
      </div>

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
