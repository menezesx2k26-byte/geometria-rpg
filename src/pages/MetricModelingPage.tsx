import { JourneyRunner } from '../components/learning/JourneyRunner';
import { exercise48Stages } from '../data/interactiveJourneys';
import { buildExercise48Model, formatFraction } from '../engine/analyticGeometryEngine';

const model = buildExercise48Model();

function Exercise48Diagram({ stageIndex }: { stageIndex: number }) {
  const revealAuxiliary = stageIndex >= 1;
  const revealLines = stageIndex >= 2;
  const revealP = stageIndex >= 5;
  const revealMetric = stageIndex >= 6;
  return (
    <figure className="journey-diagram ex48-diagram" aria-label="Figura do exercício 48">
      <svg viewBox="0 0 390 360" role="img" aria-labelledby="ex48-title">
        <title id="ex48-title">Triângulo OBC com pontos médios M e N e interseção P</title>
        <defs><pattern id="ex48-grid" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M 38 0 L 0 0 0 38" /></pattern></defs>
        <rect width="390" height="360" fill="url(#ex48-grid)" />
        <polygon id="polygon:OBC" points="62,302 62,62 302,302" />
        {revealLines && <>
          <line id="line:r-BN" className="model-line model-line--r" x1="62" y1="62" x2="182" y2="302" />
          <line id="line:s-MC" className="model-line model-line--s" x1="62" y1="182" x2="302" y2="302" />
        </>}
        {revealMetric && <>
          <line id="segment:PB" className="metric-segment metric-segment--double" x1="142" y1="222" x2="62" y2="62" />
          <line id="segment:PN" className="metric-segment" x1="142" y1="222" x2="182" y2="302" />
        </>}
        <circle id="point:O" className="model-point" cx="62" cy="302" r="6" /><text x="38" y="326">O</text>
        <circle id="point:B" className="model-point" cx="62" cy="62" r="6" /><text x="39" y="54">B</text>
        <circle id="point:C" className="model-point" cx="302" cy="302" r="6" /><text x="312" y="326">C</text>
        {revealAuxiliary && <>
          <circle id="point:M" className="model-point is-focus" cx="62" cy="182" r="7" /><text x="37" y="177">M</text>
          <circle id="point:N" className="model-point is-focus" cx="182" cy="302" r="7" /><text x="174" y="334">N</text>
        </>}
        {revealP && <><circle id="point:P" className="model-point is-intersection" cx="142" cy="222" r="8" /><text x="151" y="214">P</text></>}
      </svg>
      <figcaption>
        {revealP
          ? `P=(${formatFraction(model.points.P.x)},${formatFraction(model.points.P.y)}) · PB=${model.distances.PB.text} · PN=${model.distances.PN.text}`
          : 'A figura revela objetos progressivamente; nenhuma equação é entregue antes da modelagem.'}
      </figcaption>
    </figure>
  );
}

export function MetricModelingPage() {
  return (
    <JourneyRunner
      journeyId="exercise-48-modeling"
      kicker="Vertical slice · figura → prova métrica"
      title="O Enigma das Duas Cevianas"
      description="Reconstrua o exercício 48 inteiro: leia a figura, derive pontos auxiliares, escolha retas, monte o sistema e só então prove a relação entre distâncias exatas."
      stages={exercise48Stages}
      completionTitle="Modelador Métrico"
      completionText="Você explicou a cadeia inteira sem receber a equação pronta: figura → dados → pontos → retas → sistema → solução → interpretação → prova."
      backTo="/vertical-slice"
      backLabel="Rotas jogáveis"
      renderDiagram={(stageIndex) => <Exercise48Diagram stageIndex={stageIndex} />}
    />
  );
}
