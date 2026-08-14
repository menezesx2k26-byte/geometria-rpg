import { JourneyRunner } from '../components/learning/JourneyRunner';
import { lineForgeStages } from '../data/interactiveJourneys';

function LineForgeDiagram({ stageIndex }: { stageIndex: number }) {
  const showLine = stageIndex >= 2;
  const showSupport = stageIndex >= 5;
  const showSystem = stageIndex >= 7 && stageIndex <= 9;
  const showMedian = stageIndex >= 10;
  return (
    <figure className="journey-diagram analytic-grid-diagram" aria-label="Plano cartesiano da Forja das Retas">
      <svg viewBox="0 0 420 360" role="img" aria-labelledby="line-forge-title">
        <title id="line-forge-title">Objetos geométricos da etapa atual</title>
        <defs><pattern id="line-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" /></pattern></defs>
        <rect width="420" height="360" fill="url(#line-grid)" />
        <line id="line:x-axis" className="axis" x1="18" y1="180" x2="402" y2="180" />
        <line id="line:y-axis" className="axis" x1="210" y1="18" x2="210" y2="342" />
        {showLine && <line id="line:r" className="model-line model-line--r" x1="30" y1="20" x2="370" y2="360" />}
        {showSupport && <>
          <line id="line:AB" className="model-line model-line--s" x1="120" y1="360" x2="230" y2="30" />
          <line id="line:AC" className="model-line model-line--gold" x1="80" y1="180" x2="390" y2="180" />
        </>}
        {showSystem && <>
          <line id="line:system-r" className="model-line model-line--r" x1="30" y1="320" x2="385" y2="36" />
          <line id="line:system-s" className="model-line model-line--s" x1="30" y1="35" x2="385" y2="320" />
          <circle id="point:P" className="model-point is-focus" cx="270" cy="140" r="7" />
          <text x="282" y="133">P</text>
        </>}
        {!showSystem && !showMedian && <>
          <circle id="point:B" className="model-point" cx="210" cy="220" r="6" /><text x="219" y="240">B</text>
          <circle id="point:C" className="model-point" cx="90" cy="100" r="6" /><text x="65" y="92">C</text>
          <circle id="point:M" className="model-point is-focus" cx="150" cy="160" r="7" /><text x="132" y="151">M</text>
        </>}
        {showMedian && <>
          <line id="line:median" className="model-line model-line--gold" x1="40" y1="285" x2="385" y2="137" />
          <circle id="point:A" className="model-point" cx="290" cy="220" r="6" /><text x="301" y="217">A</text>
          <circle id="point:midpoint-bc" className="model-point is-focus" cx="150" cy="160" r="7" /><text x="126" y="151">M</text>
        </>}
      </svg>
      <figcaption>{showMedian ? 'Boss: a mediana conecta A ao ponto médio de BC.' : showSystem ? 'Duas retas: o sistema descreve seus pontos comuns.' : 'Selecione relações pelo cálculo; o desenho apenas mantém os objetos sincronizados.'}</figcaption>
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
