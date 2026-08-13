import { ArrowRight, BookOpen, Castle, Check, LockKeyhole, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BossFrame } from '../components/rpg';
import { useProgress } from '../state/progress';

const path = [
  { id: 'triangle-congruence', title: 'Correspondência Ordenada', route: '/encounter/ordered-correspondence' },
  { id: 'opv', title: 'OPV', route: '/encounter/crossroads-opv' },
  { id: 'sas', title: 'LAL', route: '/encounter/crossroads-opv' },
  { id: 'isosceles-theorem', title: 'Teorema do Isósceles', route: '/proof/isosceles-base-angles?mode=training' },
  { id: 'asa', title: 'ALA', route: '/proof/asa-contradiction?mode=training', hiddenTitle: '???' },
  { id: 'sss', title: 'LLL', route: '/training' },
];

export function VerticalSlicePage() {
  const { progress } = useProgress();
  return <section className="page vertical-slice-page"><div className="slice-hero"><Castle /><span className="eyebrow">Prova de conceito · 10–15 minutos</span><h1>Fortaleza da Congruência</h1><p>Uma sequência jogável de correspondência, OPV, critérios, prova e descoberta. A teoria aparece no Codex depois da ação.</p></div><div className="slice-skill-path">{path.map((item, index) => { const profile = progress.skills[item.id]; const discovered = progress.discoveredSkillIds.includes(item.id); const title = item.hiddenTitle && !discovered ? item.hiddenTitle : item.title; const available = index < 4 || discovered; return <Link key={item.id} to={available ? item.route : '#'} aria-disabled={!available} className={available ? 'slice-skill' : 'slice-skill is-locked'}><span>{profile?.state === 'mastered' ? <Check /> : available ? <Swords /> : <LockKeyhole />}</span><div><small>Etapa {index + 1}</small><strong>{title}</strong>{profile && <em>{Math.round(profile.mastery)}/100</em>}</div></Link>; })}</div><BossFrame><div className="slice-missions"><article><span className="eyebrow">Quest principal</span><h2>OPV → LAL → consequência</h2><p>Prove △AFB≅△HFR e extraia AB≅HR.</p><Link className="primary-action" to="/encounter/crossroads-opv">Entrar <ArrowRight size={16}/></Link></article><article><span className="eyebrow">Quest oficial 15</span><h2>ALA → x → y → perímetros</h2><p>Resposta oficial: x=14, y=10 e razão=1.</p><Link className="primary-action" to="/encounter/official-q15">Resolver <ArrowRight size={16}/></Link></article><article><span className="eyebrow">Boss Proof</span><h2>Bissetriz ⇒ mediana e altura</h2><p>Construa as duas cadeias no Proof Engine.</p><Link className="primary-action" to="/proof/isosceles-cevian?mode=training">Provar <ArrowRight size={16}/></Link></article></div></BossFrame><Link className="slice-codex-link" to="/codex"><BookOpen/><span><strong>Codex mínimo</strong><small>Entradas desbloqueadas por descoberta e prova.</small></span></Link></section>;
}
