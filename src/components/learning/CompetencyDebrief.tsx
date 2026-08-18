import { BrainCircuit, Gauge, ShieldCheck } from 'lucide-react';
import { confidenceLabel, findHardCompetency } from '../../data/competencies';
import { useProgress } from '../../state/progress';

export function CompetencyDebrief({ encounterId }: { encounterId: string }) {
  const { progress } = useProgress();
  const attempts = progress.attemptsV4.filter((attempt) =>
    attempt.legacyEncounterId === encounterId || attempt.challengeId.startsWith(`${encounterId}:`));
  const competencyIds = [...new Set(attempts.flatMap((attempt) => attempt.evidence.map((item) => item.competencyId)))];
  if (!competencyIds.length) return null;

  const entries = competencyIds
    .map((id) => ({ definition: findHardCompetency(id), state: progress.competencyStates[id] }))
    .filter((item) => item.definition && item.state)
    .sort((left, right) => right.state.mastery - left.state.mastery)
    .slice(0, 4);

  return (
    <section className="competency-debrief" aria-label="Competências observadas nesta atividade">
      <header><BrainCircuit /><div><span className="eyebrow">Leitura adaptativa</span><h2>O que esta missão observou</h2></div></header>
      <p>XP celebra a atividade; estas estimativas usam somente as decisões matemáticas registradas. A confiança cresce com volume e variedade de evidências.</p>
      <div>
        {entries.map(({ definition, state }) => definition && (
          <article key={definition.id}>
            <span><ShieldCheck size={16} /> {definition.rpgName}</span>
            <strong>{Math.round(state.mastery * 100)}%</strong>
            <small><Gauge size={14} /> confiança {confidenceLabel(state.evidenceCount, state.confidence)} · {state.evidenceCount} evidência{state.evidenceCount === 1 ? '' : 's'}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
