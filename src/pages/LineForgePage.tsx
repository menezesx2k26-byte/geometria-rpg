import type { ReactNode } from 'react';
import { JourneyRunner } from '../components/learning/JourneyRunner';
import { lineForgeStages } from '../data/interactiveJourneys';

function Point({ id, label, x, y, focus = false }: { id: string; label: string; x: number; y: number; focus?: boolean }) {
  return (
    <>
      <circle id={id} className={focus ? 'model-point is-focus' : 'model-point'} cx={x} cy={y} r={focus ? 7 : 6} />
      <text x={x + 10} y={y - 10}>{label}</text>
    </>
  );
}

function LineForgeDiagram({ stageIndex }: { stageIndex: number }) {
  const collinearityStage = stageIndex === 1;
  const xAxisY = collinearityStage ? 300 : 180;
  const yAxisX = collinearityStage ? 130 : 210;

  let scene: ReactNode;
  let caption: string;

  if (stageIndex === 0) {
    scene = <>
      <line className="model-line model-line--r" x1="90" y1="100" x2="210" y2="220" />
      <Point id="point:B" label="B (0,−1)" x={210} y={220} />
      <Point id="point:C" label="C (−3,2)" x={90} y={100} />
      <Point id="point:M" label="M" x={150} y={160} focus />
    </>;
    caption = 'B=(0,−1), C=(−3,2) e M=(−3/2,1/2): o ponto médio está exatamente no segmento BC.';
  } else if (stageIndex === 1) {
    scene = <>
      <line className="model-line model-line--gold" x1="110" y1="360" x2="230" y2="0" />
      <Point id="point:A" label="A (0,0)" x={130} y={300} />
      <Point id="point:B" label="B (1,3)" x={170} y={180} focus />
      <Point id="point:D" label="D (2,6)" x={210} y={60} />
    </>;
    caption = 'A, B e D estão alinhados: o desenho acompanha o determinante nulo, sem substituir a justificativa.';
  } else if (stageIndex <= 3) {
    scene = <>
      <line id="line:r" className="model-line model-line--r" x1="30" y1="40" x2="350" y2="360" />
      <Point id="point:B" label="B (0,−1)" x={210} y={220} />
      <Point id="point:C" label="C (−3,2)" x={90} y={100} />
      {stageIndex === 3 && <Point id="point:intercept" label="(−1,0)" x={170} y={180} focus />}
    </>;
    caption = 'A reta desenhada satisfaz x+y+1=0 e passa exatamente pelos pontos usados na derivação.';
  } else if (stageIndex === 4) {
    scene = <>
      <line id="line:x3" className="model-line model-line--r" x1="330" y1="18" x2="330" y2="342" />
      <line id="line:y1" className="model-line model-line--s" x1="18" y1="140" x2="402" y2="140" />
      <text x="338" y="44">x=3</text>
      <text x="340" y="132">y=1</text>
    </>;
    caption = 'x=3 mantém a abscissa constante (reta vertical); y=1 mantém a ordenada constante (reta horizontal).';
  } else if (stageIndex <= 6) {
    scene = <>
      <line id="line:AB" className="model-line model-line--r" x1="170" y1="300" x2="270" y2="0" />
      {stageIndex === 5 && <line id="line:AC" className="model-line model-line--gold" x1="18" y1="180" x2="402" y2="180" />}
      <Point id="point:A" label="A (0,0)" x={210} y={180} />
      <Point id="point:B" label="B (1,3)" x={250} y={60} focus />
      {stageIndex === 5 && <Point id="point:C" label="C (4,0)" x={370} y={180} />}
    </>;
    caption = stageIndex === 5
      ? '↔AB satisfaz 3x−y=0 e ↔AC satisfaz y=0; as retas suporte contêm as extremidades dos segmentos.'
      : 'r: 3x−y=0 representa todos — e somente — os pontos (x,y) que satisfazem a equação.';
  } else if (stageIndex === 7) {
    scene = <>
      <line id="line:system-r" className="model-line model-line--r" x1="190" y1="0" x2="420" y2="230" />
      <line id="line:system-s" className="model-line model-line--s" x1="130" y1="340" x2="420" y2="50" />
      <Point id="point:P" label="P (3,1)" x={330} y={140} focus />
    </>;
    caption = 'x+y=4 e x−y=2 se encontram exatamente em P=(3,1): uma solução, um ponto comum.';
  } else if (stageIndex === 8) {
    scene = <>
      <line id="line:si-r" className="model-line model-line--r" x1="150" y1="0" x2="402" y2="252" />
      <line id="line:si-s" className="model-line model-line--s" x1="230" y1="0" x2="402" y2="172" />
    </>;
    caption = 'x+y=3 e x+y=5 produzem retas distintas e paralelas: o sistema não possui solução.';
  } else if (stageIndex === 9) {
    scene = <>
      <line id="line:spi-r" className="model-line model-line--r" x1="30" y1="30" x2="390" y2="210" />
      <line id="line:spi-s" className="model-line model-line--s model-line--overlay" x1="30" y1="30" x2="390" y2="210" />
    </>;
    caption = 'x+2y−3=0 e 2x+4y−6=0 são duas escritas da mesma reta: infinitas soluções comuns.';
  } else {
    scene = <>
      <line id="line:median" className="model-line model-line--gold" x1="20" y1="104" x2="400" y2="267" />
      <Point id="point:A" label="A (2,−1)" x={290} y={220} />
      <Point id="point:midpoint-bc" label="M_BC (−3/2,1/2)" x={150} y={160} focus />
    </>;
    caption = 'A mediana final é a reta que passa por A=(2,−1) e pelo ponto médio M_BC=(−3/2,1/2).';
  }

  return (
    <figure className="journey-diagram analytic-grid-diagram" aria-label="Plano cartesiano da Forja das Retas">
      <svg viewBox="0 0 420 360" role="img" aria-labelledby="line-forge-title line-forge-desc">
        <title id="line-forge-title">Objetos geométricos da etapa atual</title>
        <desc id="line-forge-desc">A representação muda com a etapa e preserva exatamente as coordenadas, retas e interseções usadas no enunciado.</desc>
        <defs><pattern id="line-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" /></pattern></defs>
        <rect width="420" height="360" fill="url(#line-grid)" />
        <line id="line:x-axis" className="axis" x1="18" y1={xAxisY} x2="402" y2={xAxisY} />
        <line id="line:y-axis" className="axis" x1={yAxisX} y1="18" x2={yAxisX} y2="342" />
        {scene}
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function LineForgePage() {
  return (
    <JourneyRunner
      journeyId="line-forge"
      kicker="Vertical slice · Lista Analítica 2"
      title="Forja das Retas"
      description="Construa a linguagem das retas na ordem canônica: ponto, colinearidade, equação geral, conjunto solução, sistema e interpretação. O coeficiente angular fica para uma rota posterior."
      stages={lineForgeStages}
      completionTitle="Forjador de Retas"
      completionText="Você passou de pontos e figuras a retas e sistemas, distinguindo SPD, SI e SPI sem comparar equações como strings."
      backTo="/vertical-slice"
      backLabel="Rotas jogáveis"
      renderDiagram={(stageIndex) => <LineForgeDiagram stageIndex={stageIndex} />}
    />
  );
}
