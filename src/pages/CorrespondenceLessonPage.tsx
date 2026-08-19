import { ArrowLeft, ArrowRight, Check, ScrollText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GeometryFigure } from '../components/encounter/GeometryFigure';
import { FeedbackPanel } from '../components/rpg';
import { findEncounter } from '../data/bootstrap';
import { useProgress } from '../state/progress';
import { isAcceptedOption } from '../engine/answerAcceptance';

interface LessonStage {
  id: string;
  kicker: string;
  title: string;
  text: string;
  highlights: string[];
  prompt?: string;
  options?: { id: string; label: string }[];
  correctId?: string;
  success?: string;
}

const stages: LessonStage[] = [
  {
    id: 'read-statement', kicker: 'Contexto', title: 'Os nomes formam um mapa.',
    text: 'Quando escrevemos △ABC ≅ △DEF, a posição de cada letra informa qual vértice ocupa o mesmo papel no outro triângulo.', highlights: [],
  },
  {
    id: 'teach-a-d', kicker: 'Exemplo guiado', title: 'Primeiro com primeiro.',
    text: 'A é a primeira letra de △ABC e D é a primeira de △DEF. Portanto, A ↔ D.', highlights: ['vertex-a', 'vertex-d'],
  },
  {
    id: 'guided-b-e', kicker: 'Sua vez', title: 'Segundo com segundo.',
    text: 'B ocupa a segunda posição em △ABC.', highlights: ['vertex-b'], prompt: 'Qual vértice corresponde a B?',
    options: [{ id: 'D', label: 'D' }, { id: 'E', label: 'E' }, { id: 'F', label: 'F' }], correctId: 'E', success: 'Exato: B ↔ E, pois ambos ocupam a segunda posição.',
  },
  {
    id: 'guided-c-f', kicker: 'Sua vez', title: 'Terceiro com terceiro.',
    text: 'C ocupa a terceira posição em △ABC.', highlights: ['vertex-c'], prompt: 'Qual vértice corresponde a C?',
    options: [{ id: 'D', label: 'D' }, { id: 'F', label: 'F' }, { id: 'E', label: 'E' }], correctId: 'F', success: 'Correto: C ↔ F fecha o mapa dos vértices.',
  },
  {
    id: 'guided-side', kicker: 'Transferência', title: 'Os lados herdam seus extremos.',
    text: 'AB liga o primeiro ao segundo vértice. Seu correspondente deve ligar D a E.', highlights: ['vertex-a', 'vertex-b', 'vertex-d', 'vertex-e'], prompt: 'Qual lado corresponde a AB?',
    options: [{ id: 'DF', label: 'DF' }, { id: 'EF', label: 'EF' }, { id: 'DE', label: 'DE' }, { id: 'ED', label: 'ED' }], correctId: 'DE', success: 'Isso: AB ↔ DE; ED nomeia o mesmo segmento. Os dois extremos foram preservados.',
  },
  {
    id: 'guided-angle', kicker: 'Transferência', title: 'O vértice nomeia o ângulo.',
    text: 'O ângulo ∠C está no terceiro vértice. Use o mesmo mapa de posições.', highlights: ['vertex-c', 'vertex-f'], prompt: 'Qual ângulo corresponde a ∠C?',
    options: [{ id: 'angle-d', label: '∠D' }, { id: 'angle-f', label: '∠F' }, { id: 'angle-e', label: '∠E' }], correctId: 'angle-f', success: 'Perfeito: ∠C ↔ ∠F.',
  },
  {
    id: 'formalize', kicker: 'Regra formal', title: 'Uma ordem, três consequências.',
    text: '△ABC ≅ △DEF determina A↔D, B↔E, C↔F; então AB↔DE, BC↔EF, AC↔DF e os ângulos seguem os mesmos vértices.', highlights: ['vertex-a', 'vertex-b', 'vertex-c', 'vertex-d', 'vertex-e', 'vertex-f'],
  },
  {
    id: 'challenge', kicker: 'Desafio', title: 'Agora construa o mapa completo.',
    text: 'No encontro, você aplicará a regra aos vértices, depois aos lados e finalmente aos ângulos. A missão só termina quando a cadeia inteira estiver correta.', highlights: [],
  },
];

export function CorrespondenceLessonPage() {
  const encounter = useMemo(() => findEncounter('ordered-correspondence'), []);
  const { recordAttempt } = useProgress();
  const [stageIndex, setStageIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string>();
  const [feedback, setFeedback] = useState<'correct' | 'incorrect'>();
  const stage = stages[stageIndex];

  if (!encounter || !stage) return null;
  const interactive = Boolean(stage.options?.length);
  const isFinal = stageIndex === stages.length - 1;

  const verify = () => {
    if (!selectedId || !stage.correctId) return;
    const correct = isAcceptedOption(selectedId, stage.correctId, stage.id === 'guided-side' ? ['ED'] : []);
    recordAttempt('ordered-correspondence', `lesson-${stage.id}`, [selectedId], correct, correct ? [] : ['ordered-correspondence'], {
      skillIds: ['triangle-congruence'],
      masteryDimensions: ['recognition', 'application'],
      hintsUsed: 0,
      position: '/mission/ordered-correspondence',
    });
    setFeedback(correct ? 'correct' : 'incorrect');
  };

  const advance = () => {
    setStageIndex((index) => Math.min(stages.length - 1, index + 1));
    setSelectedId(undefined);
    setFeedback(undefined);
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <section className="page lesson-page">
      <Link className="back-link" to="/map"><ArrowLeft size={16} /> Caminho</Link>
      <header className="lesson-heading">
        <span className="eyebrow">Mini lesson · A Ordem dos Vértices</span>
        <h1>Leia a congruência como um mapa.</h1>
        <div className="lesson-progress" aria-label={`Etapa ${stageIndex + 1} de ${stages.length}`}>
          <span style={{ width: `${((stageIndex + 1) / stages.length) * 100}%` }} />
        </div>
      </header>

      <div className="lesson-layout">
        <GeometryFigure encounter={encounter} selectedObjectIds={stage.highlights} onToggle={() => undefined} showPalette={false} readOnly />
        <article className="lesson-card">
          <span className="eyebrow">{stage.kicker} · {stageIndex + 1}/{stages.length}</span>
          <h2>{stage.title}</h2>
          <p>{stage.text}</p>
          {stage.prompt && <h3>{stage.prompt}</h3>}
          {stage.options && (
            <div className="lesson-options" role="group" aria-label={stage.prompt}>
              {stage.options.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={selectedId === option.id ? 'is-selected' : ''}
                  aria-pressed={selectedId === option.id}
                  disabled={feedback === 'correct'}
                  onClick={() => { setSelectedId(option.id); setFeedback(undefined); }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          {feedback && (
            <FeedbackPanel state={feedback}>
              {feedback === 'correct' ? stage.success : 'Compare a posição da letra em cada nome, da esquerda para a direita.'}
            </FeedbackPanel>
          )}
          {isFinal ? (
            <Link className="primary-action primary-action--wide" to="/encounter/ordered-correspondence"><ScrollText size={17} /> Iniciar desafio</Link>
          ) : interactive && feedback !== 'correct' ? (
            <button type="button" className="primary-action primary-action--wide" disabled={!selectedId} onClick={verify}>Verificar resposta</button>
          ) : (
            <button type="button" className="primary-action primary-action--wide" onClick={advance}>
              {feedback === 'correct' && <Check size={17} />} Continuar <ArrowRight size={17} />
            </button>
          )}
        </article>
      </div>
    </section>
  );
}
