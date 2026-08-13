import { BrainCircuit } from 'lucide-react';
import { useProgress } from '../state/progress';

export function ReviewPage() {
  const { progress, resetProgress } = useProgress();
  const incorrect = progress.attempts.filter((attempt) => !attempt.correct);
  return <section className="page"><div className="page-heading"><span className="eyebrow">Diagnóstico local</span><h1>Revisão estratégica</h1><p>Seus erros viram pistas para o próximo treino, não punições.</p></div><div className="review-card"><BrainCircuit size={28} /><div><strong>{incorrect.length} decisões para revisar</strong><p>{progress.attempts.length} tentativas registradas neste dispositivo.</p></div><button type="button" className="text-action" onClick={resetProgress}>Reiniciar progresso</button></div></section>;
}
