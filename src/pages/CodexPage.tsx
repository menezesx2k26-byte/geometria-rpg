import { BookOpen, LockKeyhole } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { codexEntries, findCodexEntry } from '../data/bootstrap';
import { Math } from '../components/math/Math';
import { useProgress } from '../state/progress';

export function CodexPage() {
  const { id } = useParams();
  const { progress } = useProgress();
  const entry = id ? findCodexEntry(id) : undefined;

  if (entry) {
    const unlocked = progress.discoveredCodexEntryIds.includes(entry.id) || entry.unlockedByDefault;
    return (
      <section className="page codex-detail">
        <Link to="/codex" className="back-link">← Índice do Codex</Link>
        {unlocked ? (
          <article className="codex-scroll">
            <span className="eyebrow">Teorema descoberto</span>
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
          return unlocked ? (
            <Link className="codex-card" to={`/codex/${item.id}`} key={item.id}><BookOpen /><small>{item.skillId.toUpperCase()}</small><h2>{item.title}</h2><p>{item.summary}</p></Link>
          ) : (
            <article className="codex-card is-locked" key={item.id}><LockKeyhole /><small>SELADO</small><h2>Descoberta não registrada</h2><p>Avance pela trilha para revelar.</p></article>
          );
        })}
      </div>
    </section>
  );
}
