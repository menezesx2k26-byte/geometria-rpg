import { LockKeyhole } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { codexEntries, findCodexEntry, skills } from '../data/bootstrap';
import { Math } from '../components/math/Math';
import { CodexCard, InventorySkillChip } from '../components/rpg';
import { useProgress } from '../state/progress';

export function CodexPage() {
  const { id } = useParams();
  const { progress } = useProgress();
  const entry = id ? findCodexEntry(id) : undefined;
  const entrySkill = entry ? skills.find((skill) => skill.id === entry.skillId) : undefined;
  const entryProfile = entrySkill ? progress.skills[entrySkill.id] : undefined;

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
            <blockquote>{entry.statement}</blockquote>
            {entry.formula && <Math expression={entry.formula} display />}
          </article>
        ) : (
          <div className="locked-panel"><LockKeyhole /><h1>Entrada ainda selada</h1><p>Resolva o encounter relacionado para revelar este teorema.</p></div>
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
