import { ArrowRight, BookMarked, LockKeyhole } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { codexEntries, encounters, findCodexEntry, skills } from '../data/bootstrap';
import { Math } from '../components/math/Math';
import { CodexCard, InventorySkillChip } from '../components/rpg';
import { useProgress } from '../state/progress';

const practiceRoutes = [
  { route: '/lab/parallelism', label: 'Passagem das Paralelas', skillIds: ['parallel-angle-families', 'parallel-converse-skill', 'parallelogram-characterization'] },
  { route: '/lab/line-forge', label: 'Forja das Retas', skillIds: ['coordinate-midpoint', 'coordinate-collinearity', 'general-line-equation', 'line-solution-set', 'vertical-horizontal-lines', 'supporting-line', 'linear-system-classification', 'system-intersection-interpretation', 'coordinate-median'] },
  { route: '/lab/exercise-48', label: 'Modelagem Métrica 48', skillIds: ['figure-to-equation', 'general-line-equation', 'system-intersection-interpretation', 'distance-formula-skill', 'exact-distance-proof', 'coordinate-proof'] },
  { route: '/lab/crossover', label: 'Ponte das Duas Linguagens', skillIds: ['median', 'coordinate-median', 'perpendicular-bisector', 'system-intersection-interpretation'] },
];

const skillExamples: Record<string, string> = {
  'general-line-equation': 'B=(0,−1), C=(−3,2) e P=(x,y) colineares produzem x+y+1=0.',
  'line-solution-set': '(−1,0) e (0,−1) pertencem a x+y+1=0 porque zeram a expressão.',
  'vertical-horizontal-lines': 'x=3 mantém x fixo e deixa y livre: é uma reta vertical.',
  'linear-system-classification': 'x+y=3 e x+y=5 formam SI: não há solução e as retas são paralelas distintas.',
  'system-intersection-interpretation': 'x+y=4 e x−y=2 têm solução (3,1), logo r∩s={(3,1)}.',
  'figure-to-equation': 'No exercício 48, derive M e N antes de construir as retas BN e MC.',
  'exact-distance-proof': 'PB=2√5/3 e PN=√5/3 permitem concluir exatamente PB=2PN.',
  'parallel-converse-skill': 'Alternos internos congruentes permitem concluir que as duas retas são paralelas.',
};

export function CodexPage() {
  const { id } = useParams();
  const { progress } = useProgress();
  const entry = id ? findCodexEntry(id) : undefined;
  const entrySkill = entry ? skills.find((skill) => skill.id === entry.skillId) : undefined;
  const entryProfile = entrySkill ? progress.skills[entrySkill.id] : undefined;
  const relatedEncounters = entrySkill ? encounters.filter((encounter) => [...encounter.requires, ...encounter.teaches, ...encounter.reinforces].includes(entrySkill.id)) : [];
  const relatedPractice = entrySkill ? practiceRoutes.filter((item) => item.skillIds.includes(entrySkill.id)) : [];

  if (entry) {
    const unlocked = progress.discoveredCodexEntryIds.includes(entry.id) || entry.unlockedByDefault;
    return (
      <section className="page codex-detail">
        <Link to="/codex" className="back-link">← Índice do Codex</Link>
        {unlocked ? (
          <article className="codex-scroll">
            <span className="eyebrow">Teorema descoberto</span>
            {entrySkill && entryProfile && (
              <InventorySkillChip skill={entrySkill} state={entryProfile.state} />
            )}
            <h1>{entry.title}</h1>
            <p>{entry.summary}</p>
            <section className="codex-section"><small>FORMALIZAÇÃO</small><blockquote>{entry.statement}</blockquote>{entry.formula && <Math expression={entry.formula} display />}</section>
            {entrySkill && <div className="codex-reference-grid">
              <section className="codex-section"><small>PRÉ-REQUISITOS</small><p>{entrySkill.prerequisites.length ? entrySkill.prerequisites.map((id) => skills.find((item) => item.id === id)?.title ?? id).join(' · ') : 'Nenhum: esta é uma habilidade de entrada.'}</p></section>
              <section className="codex-section"><small>EXEMPLO</small><p>{skillExamples[entrySkill.id] ?? `Reconheça ${entrySkill.shortTitle.toLowerCase()} em uma figura e justifique a relação antes de calcular.`}</p></section>
              <section className="codex-section"><small>ERRO COMUM</small><p>{entrySkill.tags.includes('reta') ? 'Confiar na aparência ou comparar equações como texto em vez de testar pertencimento e equivalência.' : 'Usar a conclusão como hipótese ou nomear a relação sem verificar seus objetos.'}</p></section>
              <section className="codex-section"><small>FONTE</small><p>{entry.sourceRefs.map((source) => `${source.origin} · ${source.reference}`).join(' | ')}</p></section>
            </div>}
            {(relatedEncounters.length > 0 || relatedPractice.length > 0) && <section className="codex-practice"><BookMarked /><div><small>PRATICAR / PROVAR</small>{relatedEncounters.map((item) => <Link key={item.id} to={`/encounter/${item.id}`}>{item.title} <ArrowRight size={14} /></Link>)}{relatedPractice.map((item) => <Link key={item.route} to={item.route}>{item.label} <ArrowRight size={14} /></Link>)}</div></section>}
          </article>
        ) : (
          <div className="locked-panel"><LockKeyhole /><h1>Entrada ainda selada</h1><p>Resolva o encontro relacionado para revelar este teorema.</p></div>
        )}
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-heading"><span className="eyebrow">Conhecimento conquistado</span><h1>Codex Euclidiano</h1><p>A teoria aparece depois da investigação — como registro do que você conseguiu justificar.</p></div>
      <div className="codex-grid">
        {codexEntries.map((item) => {
          const unlocked = progress.discoveredCodexEntryIds.includes(item.id) || item.unlockedByDefault;
          return <CodexCard key={item.id} entry={item} unlocked={Boolean(unlocked)} />;
        })}
      </div>
    </section>
  );
}
