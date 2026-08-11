"use client";

import { Check, LockKeyhole, Sparkles } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { getAsset } from "../lib/assets";
import type { SkillType } from "../types/geometry";

export function RPGDivider() {
  return <div className="rpg-divider" aria-hidden="true"><span /><i>◇</i><span /></div>;
}

export function MasteryBar({ value, label = "Domínio" }: { value: number; label?: string }) {
  return (
    <div className="mastery" aria-label={`${label}: ${value}%`}>
      <div className="mastery__meta"><span>{label}</span><strong>{value}%</strong></div>
      <div className="mastery__track"><span style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export function SkillBadge({ asset, title, type, locked = false, size = "medium" }: { asset?: string; title: string; type: SkillType; locked?: boolean; size?: "small" | "medium" | "large" }) {
  const src = getAsset(asset);
  return (
    <div className={`skill-badge skill-badge--${type} skill-badge--${size} ${locked ? "is-locked" : ""}`}>
      {src ? <Image src={src} width={512} height={510} sizes="(max-width: 600px) 120px, 160px" alt={`Emblema de ${title}`} /> : <div className="skill-badge__fallback" aria-hidden="true">△</div>}
      {locked && <span className="skill-badge__lock"><LockKeyhole size={16} /> bloqueado</span>}
    </div>
  );
}

export function UnlockBanner({ title, type = "Habilidade desbloqueada" }: { title: string; type?: string }) {
  return (
    <div className="unlock-banner" role="status">
      <Sparkles aria-hidden="true" />
      <span><small>{type}</small><strong>{title}</strong></span>
      <Check aria-hidden="true" />
    </div>
  );
}

export function Checkpoint({ children, onComplete, complete }: { children: ReactNode; onComplete: () => void; complete: boolean }) {
  return (
    <section className={`checkpoint ${complete ? "is-complete" : ""}`}>
      <div className="checkpoint__flame" aria-hidden="true">△</div>
      <div><p className="eyebrow">Checkpoint</p>{children}</div>
      <button className="button button--primary" onClick={onComplete}>{complete ? "Seção estudada" : "Marcar como estudada"}</button>
    </section>
  );
}

export function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <header className="section-title">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      <RPGDivider />
    </header>
  );
}
