import { Crosshair } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TrainingPage() {
  return <section className="page empty-page"><Crosshair size={32} /><span className="eyebrow">Treino rápido</span><h1>Recupere uma relação da memória</h1><p>O primeiro treino será liberado depois que você concluir a investigação de OPV.</p><Link className="primary-action" to="/encounter/crossroads-opv">Ir ao encounter</Link></section>;
}
