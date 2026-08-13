import { ArrowLeft, Check, Crosshair, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FeedbackPanel, UnlockBanner } from '../components/rpg';
import { useProgress } from '../state/progress';

interface LabTarget {
  id: string;
  prompt: string;
  accepts: (x: number, y: number) => boolean;
  explanation: (x: number, y: number) => string;
  skillId: string;
}

const targets: LabTarget[] = [
  { id: 'q1-quadrant', prompt: 'Escolha um ponto no 2º quadrante.', accepts: (x, y) => x < 0 && y > 0, explanation: (x, y) => `(${x}, ${y}) tem x<0 e y>0: está no 2º quadrante.`, skillId: 'quadrants-signs' },
  { id: 'q1-diagonal', prompt: 'Escolha um ponto não nulo sobre y = −x.', accepts: (x, y) => x !== 0 && y === -x, explanation: (x, y) => `Em (${x}, ${y}), a segunda coordenada é o oposto da primeira.`, skillId: 'diagonal-lines' },
  { id: 'q1-axis', prompt: 'Escolha um ponto sobre o eixo y, mas fora da origem.', accepts: (x, y) => x === 0 && y !== 0, explanation: (x, y) => `(${x}, ${y}) tem x=0; por isso pertence ao eixo y, não a um quadrante.`, skillId: 'cartesian-coordinates' },
];

const gridValues = [-4,-3,-2,-1,0,1,2,3,4];

export function CoordinateLabPage() {
  const { completeEncounter, recordAttempt } = useProgress();
  const [targetIndex, setTargetIndex] = useState(0);
  const [selected, setSelected] = useState<[number, number]>();
  const [feedback, setFeedback] = useState<'correct' | 'incorrect'>();
  const [solved, setSolved] = useState(false);
  const target = targets[targetIndex];

  if (!target) return null;
  if (solved) return <section className="page"><UnlockBanner title="Cartógrafo do Plano">Você investigou sinais, diagonais e eixos diretamente no plano cartesiano.</UnlockBanner><div className="completion-actions"><Link className="primary-action" to="/campaign/analytical/analytic-plane/analytic-q01">Voltar à questão 1</Link><Link className="secondary-action" to="/campaign/analytical">Abrir campanha</Link></div></section>;

  const verify = () => {
    if (!selected) return;
    const [x, y] = selected;
    const correct = target.accepts(x, y);
    recordAttempt('coordinate-sign-lab', target.id, [`${x},${y}`], correct, correct ? [] : ['algebra-linear'], { skillIds: [target.skillId], masteryDimensions: ['recognition', 'application'], hintsUsed: 0, position: '/lab/coordinates' });
    setFeedback(correct ? 'correct' : 'incorrect');
    if (correct && targetIndex === targets.length - 1) {
      completeEncounter('coordinate-sign-lab', targets.map((item) => item.skillId), targets.map((item) => `codex-${item.skillId}`));
      setSolved(true);
    }
  };

  const advance = () => { setTargetIndex((index) => index + 1); setSelected(undefined); setFeedback(undefined); };

  return (
    <section className="page coordinate-lab-page">
      <Link className="back-link" to="/campaign/analytical/analytic-plane/analytic-q01"><ArrowLeft size={16} /> Questão 1</Link>
      <div className="coordinate-lab-heading"><span className="eyebrow">Laboratório cartesiano · {targetIndex + 1}/{targets.length}</span><h1>Cartografe uma relação.</h1><p>Toque em um ponto. O painel textual mantém coordenadas e sinais sincronizados com o gráfico.</p></div>
      <div className="coordinate-lab-layout">
        <div className="cartesian-board">
          <div className="cartesian-grid" role="grid" aria-label="Plano cartesiano de -4 a 4">
            {gridValues.slice().reverse().map((y) => (
              <div className="cartesian-row" role="row" key={y}>
                {gridValues.map((x) => (
                  <button type="button" role="gridcell" aria-label={`Ponto (${x}, ${y})`} key={`${x},${y}`} className={`${x === 0 ? 'on-y-axis ' : ''}${y === 0 ? 'on-x-axis ' : ''}${selected?.[0] === x && selected[1] === y ? 'is-selected' : ''}`} onClick={() => { setSelected([x,y]); setFeedback(undefined); }}><span /></button>
                ))}
              </div>
            ))}
            <span className="diagonal diagonal--positive" aria-hidden="true" /><span className="diagonal diagonal--negative" aria-hidden="true" />
          </div>
          <div className="axis-labels" aria-hidden="true"><span>x</span><span>y</span></div>
        </div>
        <aside className="coordinate-decision-panel">
          <Crosshair />
          <span className="eyebrow">Alvo</span><h2>{target.prompt}</h2>
          <div className="coordinate-readout">{selected ? <><strong>({selected[0]}, {selected[1]})</strong><span>x {selected[0] > 0 ? '> 0' : selected[0] < 0 ? '< 0' : '= 0'} · y {selected[1] > 0 ? '> 0' : selected[1] < 0 ? '< 0' : '= 0'}</span><small>{selected[1] === selected[0] ? 'Está em y=x.' : selected[1] === -selected[0] ? 'Está em y=-x.' : 'Não está em uma diagonal principal.'}</small></> : <span>Nenhum ponto selecionado.</span>}</div>
          {feedback && <FeedbackPanel state={feedback}>{feedback === 'correct' && selected ? target.explanation(...selected) : 'Esse ponto não satisfaz todas as condições. Leia os sinais antes de tentar novamente.'}</FeedbackPanel>}
          <button type="button" className="primary-action primary-action--wide" disabled={!selected} onClick={feedback === 'correct' ? advance : verify}>{feedback === 'correct' ? <><Check size={17} /> Próximo alvo</> : <><Crosshair size={17} /> Verificar ponto</>}</button>
          {feedback === 'incorrect' && <button type="button" className="text-action" onClick={() => { setSelected(undefined); setFeedback(undefined); }}><RotateCcw size={15} /> Limpar tentativa</button>}
        </aside>
      </div>
    </section>
  );
}
