import {
  BookOpen,
  Check,
  Crown,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { assetMap } from '../../data/assetMap';
import type { CodexEntry, MasteryProfile, Region, Skill, SkillState } from '../../types/domain';

export function RPGHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="rpg-header">
      <NavLink to="/map" className="brand" aria-label="Geometria RPG — mapa">
        <span className="brand__mark"><span>G</span></span>
        <span>
          <strong>Geometria RPG</strong>
          <small>Academia Euclidiana</small>
        </span>
      </NavLink>
      <div className="rpg-header__status">
        <ShieldCheck size={15} /> {children ?? 'Progresso local'}
      </div>
    </header>
  );
}

export function RegionBanner({ region, index }: { region: Region; index: number }) {
  return (
    <header className="region-banner" style={{ '--region-accent': region.accent } as CSSProperties}>
      <span className="region-banner__number">{String(index + 1).padStart(2, '0')}</span>
      <div>
        <span className="eyebrow">{region.subtitle}</span>
        <h2>{region.title}</h2>
      </div>
    </header>
  );
}

export function SkillBadge({ skill, state }: { skill: Skill; state: SkillState }) {
  const image = assetMap[`skill:${skill.id}`];
  return (
    <span className={`skill-badge skill-badge--${state}`} aria-hidden="true">
      {image ? <img src={image} alt="" /> : <span>{skill.shortTitle.slice(0, 3)}</span>}
    </span>
  );
}

export function MasteryBar({ profile, compact = false }: { profile: MasteryProfile; compact?: boolean }) {
  const percent = Math.round(profile.mastery);
  return (
    <div className={compact ? 'mastery-bar mastery-bar--compact' : 'mastery-bar'}>
      <span className="mastery-bar__label">Domínio <strong>{percent}%</strong></span>
      <span className="mastery-bar__track" aria-label={`${percent}% de domínio`}>
        <span style={{ width: `${percent}%` }} />
      </span>
    </div>
  );
}

export function SkillNode({ skill, profile }: { skill: Skill; profile: MasteryProfile }) {
  const locked = profile.state === 'locked';
  return (
    <article className={`skill-node skill-node--${profile.state}`}>
      <SkillBadge skill={skill} state={profile.state} />
      <div className="skill-node__body">
        <small>{skill.shortTitle}</small>
        <h3>{skill.title}</h3>
        <p>{skill.description}</p>
        <MasteryBar profile={profile} compact />
      </div>
      <span className="state-label">
        {locked && <LockKeyhole size={13} />} {profile.state}
      </span>
    </article>
  );
}

export function UnlockBanner({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="unlock-banner" role="status">
      <Sparkles size={24} />
      <div><small>Resultado desbloqueado</small><strong>{title}</strong><p>{children}</p></div>
    </aside>
  );
}

export function QuestFrame({ children, label = 'Quest' }: { children: ReactNode; label?: string }) {
  return (
    <section className="quest-frame">
      <img src={assetMap['encounter-quest']} alt="" className="quest-frame__crest" />
      <span className="sr-only">{label}</span>
      {children}
    </section>
  );
}

export function BossFrame({ children }: { children: ReactNode }) {
  return (
    <section className="boss-frame">
      <img src={assetMap['encounter-boss']} alt="Boss Proof" />
      <div>{children}</div>
    </section>
  );
}

export function Checkpoint({ title, complete = false }: { title: string; complete?: boolean }) {
  return (
    <div className={`checkpoint ${complete ? 'is-complete' : ''}`}>
      <Crown size={20} /> <span>Checkpoint</span> <strong>{title}</strong>
    </div>
  );
}

export function RPGDivider({ label }: { label?: string }) {
  return <div className="rpg-divider" aria-hidden={!label}><span>{label ?? '◆'}</span></div>;
}

export function CodexCard({ entry, unlocked }: { entry: CodexEntry; unlocked: boolean }) {
  if (!unlocked) {
    return (
      <article className="codex-card is-locked">
        <LockKeyhole />
        <small>SELADO</small>
        <h2>Descoberta não registrada</h2>
        <p>Avance pela trilha para revelar.</p>
      </article>
    );
  }
  return (
    <Link className="codex-card" to={`/codex/${entry.id}`}>
      <BookOpen />
      <small>{entry.skillId.toUpperCase()}</small>
      <h2>{entry.title}</h2>
      <p>{entry.summary}</p>
    </Link>
  );
}

export function FeedbackPanel({
  state,
  children,
}: {
  state: 'correct' | 'incorrect';
  children: ReactNode;
}) {
  return (
    <div className={`feedback-panel feedback-panel--${state}`} role="status">
      {state === 'correct' ? <Check size={20} /> : <X size={20} />}
      <div>{children}</div>
    </div>
  );
}

export function InventorySkillChip({ skill, state }: { skill: Skill; state: SkillState }) {
  return (
    <span className={`inventory-chip inventory-chip--${state}`}>
      <SkillBadge skill={skill} state={state} />
      <span>{skill.shortTitle}</span>
    </span>
  );
}
