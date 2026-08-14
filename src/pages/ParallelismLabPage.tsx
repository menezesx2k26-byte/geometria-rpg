import { JourneyRunner } from '../components/learning/JourneyRunner';
import { parallelismStages } from '../data/interactiveJourneys';

function ParallelismDiagram({ stageIndex }: { stageIndex: number }) {
  const boss = stageIndex === parallelismStages.length - 1;
  return (
    <figure className="journey-diagram parallel-diagram" aria-label={boss ? 'Quadrilátero com diagonais' : 'Paralelas cortadas por transversal'}>
      <svg viewBox="0 0 420 330" role="img">
        {boss ? <>
          <polygon id="polygon:ABCD" points="80,82 310,82 360,260 130,260" />
          <line id="segment:AC" className="model-line model-line--r" x1="80" y1="82" x2="360" y2="260" />
          <line id="segment:BD" className="model-line model-line--s" x1="310" y1="82" x2="130" y2="260" />
          <circle id="point:M" className="model-point is-intersection" cx="220" cy="171" r="8" />
          {['A','B','C','D','M'].map((label, index) => <text key={label} x={[59,319,369,105,229][index]} y={[76,76,282,282,163][index]}>{label}</text>)}
          <path className="tick" d="M145 117l-10 14M292 216l-10 14M267 116l10 14M163 216l10 14" />
        </> : <>
          <line id="line:r" className="parallel-base" x1="35" y1="92" x2="385" y2="92" />
          <line id="line:s" className="parallel-base" x1="35" y1="244" x2="385" y2="244" />
          <line id="line:t" className="transversal" x1="125" y1="20" x2="290" y2="310" />
          <path id="angle:alpha" className="angle-arc" d="M181 92 A35 35 0 0 0 167 122" />
          <path id="angle:beta" className="angle-arc" d="M234 244 A35 35 0 0 0 249 214" />
          <text x="151" y="138">α</text><text x="258" y="214">β</text><text x="365" y="78">r</text><text x="365" y="232">s</text><text x="300" y="303">t</text>
        </>}
      </svg>
      <figcaption>{boss ? 'As diagonais se cortam em M; as marcas representam dois pontos médios.' : 'Classifique os ângulos pela posição antes de calcular ou concluir paralelismo.'}</figcaption>
    </figure>
  );
}

export function ParallelismLabPage() {
  return (
    <JourneyRunner
      journeyId="parallelism-bridge"
      kicker="Vertical slice · Lista Euclidiana 2"
      title="Passagem das Paralelas"
      description="Reconheça famílias angulares, traduza uma relação em equação, use a conversa para provar paralelismo e finalize com a caracterização do paralelogramo por diagonais."
      stages={parallelismStages}
      completionTitle="Arquiteto das Paralelas"
      completionText="Você provou paralelismo sem assumi-lo e usou uma diagonal como construção que conecta hipóteses ao objetivo."
      backTo="/vertical-slice"
      backLabel="Rotas jogáveis"
      renderDiagram={(stageIndex) => <ParallelismDiagram stageIndex={stageIndex} />}
    />
  );
}
