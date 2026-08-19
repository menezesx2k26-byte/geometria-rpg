import { ArrowLeftRight, ArrowRight, BookOpen, Braces, Castle, Check, GitBranch, LockKeyhole, Ruler, Swords } from 'lucide-react';
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
  return (
    <section className="page vertical-slice-page">
      <div className="slice-hero"><Castle /><span className="eyebrow">Rotas jogáveis · ação antes da formalização</span><h1>Escolha uma expedição.</h1><p>Cinco vertical slices cobrem congruência, paralelismo, retas, modelagem métrica e transferência. Cada rota exige decisões, registra erros semânticos e persiste domínio por competência.</p></div>
      <div className="journey-route-grid">
        <a className="journey-route-card is-current" href="#congruence-route"><Castle /><small>EUCLIDIANA · LISTA 1</small><strong>Fortaleza da Congruência</strong><span>Correspondência → OPV → LAL → prova</span></a>
        <Link className="journey-route-card" to="/lab/parallelism"><GitBranch /><small>EUCLIDIANA · LISTA 2</small><strong>Passagem das Paralelas</strong><span>Ângulos → conversa → paralelogramo</span></Link>
        <Link className="journey-route-card" to="/lab/line-forge"><Braces /><small>ANALÍTICA · RETAS</small><strong>Forja das Retas</strong><span>Pontos → equações → SPD/SI/SPI</span></Link>
        <Link className="journey-route-card is-boss" to="/lab/exercise-48"><Ruler /><small>CHEFE · EXERCÍCIO 48</small><strong>Modelagem Métrica</strong><span>Figura → sistema → distância exata</span></Link>
        <Link className="journey-route-card" to="/lab/crossover"><ArrowLeftRight /><small>TRANSFERÊNCIA</small><strong>Ponte das Linguagens</strong><span>Sintética ↔ analítica em 3 encontros</span></Link>
      </div>
      <div id="congruence-route" className="slice-section-heading"><span className="eyebrow">Rota 01 · 10–15 minutos</span><h2>Fortaleza da Congruência</h2><p>A teoria aparece no Codex depois da ação matemática.</p></div>
      <div className="slice-skill-path">
        {path.map((item, index) => {
          const profile = progress.skills[item.id];
          const discovered = progress.discoveredSkillIds.includes(item.id);
          const title = item.hiddenTitle && !discovered ? item.hiddenTitle : item.title;
          const available = index < 4 || discovered;
          const content = <><span>{profile?.state === 'mastered' ? <Check /> : available ? <Swords /> : <LockKeyhole />}</span><div><small>Etapa {index + 1}</small><strong>{title}</strong>{profile && <em>{Math.round(profile.mastery)}/100</em>}</div></>;
          return available
            ? <Link key={item.id} to={item.route} className="slice-skill">{content}</Link>
            : <article key={item.id} className="slice-skill is-locked" aria-label={`${title} bloqueada`}>{content}</article>;
        })}
      </div>
      <BossFrame><div className="slice-missions"><article><span className="eyebrow">Quest principal</span><h2>OPV → LAL → consequência</h2><p>Prove △AFB≅△HFR e extraia AB≅HR.</p><Link className="primary-action" to="/encounter/crossroads-opv">Entrar <ArrowRight size={16}/></Link></article><article><span className="eyebrow">Quest oficial 15</span><h2>ALA → x → y → perímetros</h2><p>Resposta oficial: x=14, y=10 e razão=1.</p><Link className="primary-action" to="/encounter/official-q15">Resolver <ArrowRight size={16}/></Link></article><article><span className="eyebrow">Prova-chefe</span><h2>Bissetriz ⇒ mediana e altura</h2><p>Construa as duas cadeias no motor de provas.</p><Link className="primary-action" to="/proof/isosceles-cevian?mode=training">Provar <ArrowRight size={16}/></Link></article></div></BossFrame>
      <Link className="slice-codex-link" to="/codex"><BookOpen/><span><strong>Codex mínimo</strong><small>Entradas desbloqueadas por descoberta e prova.</small></span></Link>
    </section>
  );
}
