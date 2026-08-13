import { ArrowRight, FlaskConical, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { proofs } from '../data/proofs';

export function TrainingPage() {
  return (
    <section className="page">
      <div className="page-heading">
        <span className="eyebrow">Oficina de argumentos</span>
        <h1>Provas não se assistem. Elas se constroem.</h1>
        <p>Escolha treino para receber pistas ou exame para validar a mesma cadeia sem apoio.</p>
      </div>
      <div className="training-grid">
        {proofs.map((proof) => (
          <article className="training-card" key={proof.id}>
            <small>{proof.subtitle}</small>
            <h2>{proof.title}</h2>
            <p><strong>Tese:</strong> {proof.thesis}</p>
            <div>
              <Link className="primary-action" to={`/proof/${proof.id}?mode=training`}><FlaskConical size={16} /> Treino <ArrowRight size={16} /></Link>
              <Link className="secondary-action" to={`/proof/${proof.id}?mode=exam`}><ShieldAlert size={16} /> Exame</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
