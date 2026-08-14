import { ArrowLeftRight, Binary, Shapes } from 'lucide-react';
import { JourneyRunner } from '../components/learning/JourneyRunner';
import { crossoverStages } from '../data/interactiveJourneys';

function CrossoverDiagram({ stageIndex }: { stageIndex: number }) {
  const labels = [
    ['vértice → ponto médio', 'midpoint + reta'],
    ['ponto comum', 'solução do sistema'],
    ['ponto médio + ⟂', 'coordenadas + equação'],
  ][stageIndex] ?? ['', ''];
  return (
    <figure className="journey-diagram crossover-diagram" aria-label="Tradução entre geometria sintética e analítica">
      <div className="language-card"><Shapes /><small>LINGUAGEM SINTÉTICA</small><strong>{labels[0]}</strong></div>
      <ArrowLeftRight className="language-bridge" aria-hidden="true" />
      <div className="language-card"><Binary /><small>LINGUAGEM ANALÍTICA</small><strong>{labels[1]}</strong></div>
      <figcaption>A estrutura geométrica deve sobreviver à tradução.</figcaption>
    </figure>
  );
}

export function CrossoverPage() {
  return (
    <JourneyRunner
      journeyId="synthetic-analytic-crossover"
      kicker="Rota alternativa · transferência"
      title="A Ponte das Duas Linguagens"
      description="Resolva três encontros híbridos. A meta não é decorar duas soluções, mas reconhecer a mesma estrutura em representações sintética e analítica."
      stages={crossoverStages}
      completionTitle="Tradutor Geométrico"
      completionText="Você reconheceu mediana, interseção e mediatriz nas duas linguagens. Esse tipo de solução aumenta domínio de transferência."
      backTo="/vertical-slice"
      backLabel="Rotas jogáveis"
      renderDiagram={(stageIndex) => <CrossoverDiagram stageIndex={stageIndex} />}
    />
  );
}
