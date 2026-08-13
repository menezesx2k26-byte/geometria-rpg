import { ArrowLeft, Check, FlaskConical, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { BossFrame, FeedbackPanel, UnlockBanner } from '../components/rpg';
import { findProof } from '../data/proofs';
import { skills } from '../data/bootstrap';
import {
  justificationLabels,
  nextReadyProofStep,
  validateProofStep,
  type ProofCandidate,
} from '../engine/proofEngine';
import { useProgress } from '../state/progress';
import type { Proof, ProofChoice, ProofJustification, ProofStep } from '../types/domain';

function ChoiceButton({ choice, selected, order, onClick }: { choice: ProofChoice; selected: boolean; order?: number | undefined; onClick: () => void }) {
  return (
    <button type="button" className={selected ? 'proof-choice is-selected' : 'proof-choice'} onClick={onClick}>
      {order ? <span>{order}</span> : null}{choice.label}
    </button>
  );
}

function ProofInteractionPanel({
  step,
  candidate,
  setCandidate,
}: {
  step: ProofStep;
  candidate: ProofCandidate;
  setCandidate: (candidate: ProofCandidate) => void;
}) {
  const toggleObject = (id: string) => setCandidate({
    ...candidate,
    involvedObjects: candidate.involvedObjects.includes(id)
      ? candidate.involvedObjects.filter((item) => item !== id)
      : [...candidate.involvedObjects, id],
  });
  const chooseJustification = (justification: ProofJustification) => setCandidate({ ...candidate, justification });
  const chooseAnswer = (id: string) => setCandidate({
    ...candidate,
    answerIds: step.interaction === 'order-cards'
      ? candidate.answerIds.includes(id)
        ? candidate.answerIds.filter((item) => item !== id)
        : [...candidate.answerIds, id]
      : [id],
  });

  if (step.interaction === 'build-step') {
    return (
      <div className="proof-builder-grid">
        <fieldset><legend>Objetos</legend>{step.objectOptions.map((choice) => <ChoiceButton key={choice.id} choice={choice} selected={candidate.involvedObjects.includes(choice.id)} onClick={() => toggleObject(choice.id)} />)}</fieldset>
        <fieldset><legend>Relação</legend>{step.relationOptions.map((choice) => <ChoiceButton key={choice.id} choice={choice} selected={candidate.relation === choice.id} onClick={() => setCandidate({ ...candidate, relation: choice.id })} />)}</fieldset>
        <fieldset><legend>Justificativa</legend>{step.justificationOptions.map((item) => <ChoiceButton key={item} choice={{ id: item, label: justificationLabels[item] }} selected={candidate.justification === item} onClick={() => chooseJustification(item)} />)}</fieldset>
      </div>
    );
  }

  if (step.interaction === 'complete-justification') {
    return <div className="proof-choice-grid">{step.justificationOptions.map((item) => <ChoiceButton key={item} choice={{ id: item, label: justificationLabels[item] }} selected={candidate.justification === item} onClick={() => chooseJustification(item)} />)}</div>;
  }

  return (
    <div className="proof-choice-grid">
      {step.answerOptions.map((choice) => {
        const index = candidate.answerIds.indexOf(choice.id);
        return <ChoiceButton key={choice.id} choice={choice} selected={index >= 0} order={step.interaction === 'order-cards' && index >= 0 ? index + 1 : undefined} onClick={() => chooseAnswer(choice.id)} />;
      })}
    </div>
  );
}

function emptyCandidate(): ProofCandidate {
  return { involvedObjects: [], answerIds: [] };
}

function ProofSession({ proof, mode }: { proof: Proof; mode: 'training' | 'exam' }) {
  const { completeEncounter, recordAttempt } = useProgress();
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [activeStepId, setActiveStepId] = useState(proof.steps[0]?.id ?? '');
  const [candidate, setCandidate] = useState<ProofCandidate>(emptyCandidate);
  const [feedback, setFeedback] = useState<{ state: 'correct' | 'incorrect'; message: string }>();
  const [solved, setSolved] = useState(false);
  const activeStep = proof.steps.find((step) => step.id === activeStepId) ?? proof.steps[0];

  const progressPercent = Math.round((completedStepIds.length / proof.steps.length) * 100);
  const canValidate = Boolean(
    candidate.involvedObjects.length || candidate.relation || candidate.justification || candidate.answerIds.length,
  );

  const selectStep = (stepId: string) => {
    if (completedStepIds.includes(stepId)) return;
    setActiveStepId(stepId);
    setCandidate(emptyCandidate());
    setFeedback(undefined);
  };

  const validate = () => {
    if (!activeStep) return;
    const result = validateProofStep(proof, activeStep, completedStepIds, candidate);
    recordAttempt(
      `proof:${proof.id}`,
      activeStep.id,
      [...candidate.involvedObjects, candidate.relation ?? '', candidate.justification ?? '', ...candidate.answerIds].filter(Boolean),
      result.correct,
      [result.kind === 'logical-jump' || activeStep.interaction === 'order-cards' ? 'proof-order' : 'justification-choice'],
    );
    setFeedback({ state: result.correct ? 'correct' : 'incorrect', message: result.message });
    if (!result.correct) return;

    const nextCompleted = [...new Set([...completedStepIds, activeStep.id])];
    setCompletedStepIds(nextCompleted);
    setCandidate(emptyCandidate());
    if (nextCompleted.length === proof.steps.length) {
      const unlocks = skills.filter((skill) => proof.unlockSkillIds.includes(skill.id));
      completeEncounter(`proof:${proof.id}`, unlocks.map((skill) => skill.id), unlocks.map((skill) => skill.codexEntryId));
      setSolved(true);
      return;
    }
    const next = nextReadyProofStep(proof, nextCompleted);
    if (next) setActiveStepId(next.id);
  };

  if (solved) {
    return (
      <>
        <UnlockBanner title={proof.title}>Boss Proof concluída. {proof.unlockSkillIds.length ? 'Uma nova habilidade foi registrada.' : 'A cadeia lógica foi validada.'}</UnlockBanner>
        <article className="debrief-card"><span className="eyebrow">Debrief</span><h2>Estrutura da prova</h2><p>{proof.debrief}</p></article>
        <div className="completion-actions"><Link className="primary-action" to="/training">Voltar ao treino</Link><Link className="secondary-action" to="/map">Abrir mapa</Link></div>
      </>
    );
  }

  if (!activeStep) return null;

  return (
    <BossFrame>
      <div className="proof-layout">
        <section className="proof-map" aria-label="Passos da prova">
          <div className="proof-progress"><span style={{ width: `${progressPercent}%` }} /><strong>{progressPercent}%</strong></div>
          {proof.steps.map((step, index) => (
            <button
              type="button"
              key={step.id}
              className={`${activeStep.id === step.id ? 'is-active ' : ''}${completedStepIds.includes(step.id) ? 'is-complete' : ''}`}
              onClick={() => selectStep(step.id)}
            >
              <span>{completedStepIds.includes(step.id) ? <Check size={14} /> : index + 1}</span>
              <small>{step.statement}</small>
            </button>
          ))}
        </section>

        <section className="proof-workbench">
          <span className="eyebrow">{activeStep.interaction.replaceAll('-', ' ')}</span>
          <h2>{activeStep.prompt}</h2>
          {mode === 'training' && <p className="proof-hint">{activeStep.hint}</p>}
          {mode === 'exam' && <p className="exam-note"><ShieldAlert size={16} /> Pistas e dependências ficam ocultas no modo exame.</p>}

          <ProofInteractionPanel step={activeStep} candidate={candidate} setCandidate={setCandidate} />

          {feedback && <FeedbackPanel state={feedback.state}>{feedback.message}</FeedbackPanel>}
          <button type="button" className="primary-action primary-action--wide" disabled={!canValidate} onClick={validate}>
            Validar passo
          </button>
        </section>
      </div>
    </BossFrame>
  );
}

export function ProofPage() {
  const { id = '' } = useParams();
  const [searchParams] = useSearchParams();
  const proof = findProof(id);
  const mode = searchParams.get('mode') === 'exam' ? 'exam' : 'training';
  const hypotheses = useMemo(() => proof?.hypothesis ?? [], [proof]);

  if (!proof) return <section className="page empty-page"><h1>Prova não encontrada</h1><Link to="/training">Voltar ao treino</Link></section>;

  return (
    <section className="page proof-page">
      <header className="proof-header">
        <Link to="/training" className="icon-link" aria-label="Voltar ao treino"><ArrowLeft /></Link>
        <div><span className="eyebrow">{proof.subtitle}</span><h1>{proof.title}</h1></div>
        <nav aria-label="Modo da prova">
          <Link className={mode === 'training' ? 'is-active' : ''} to={`/proof/${proof.id}?mode=training`}><FlaskConical size={15} /> Treino</Link>
          <Link className={mode === 'exam' ? 'is-active' : ''} to={`/proof/${proof.id}?mode=exam`}><ShieldAlert size={15} /> Exame</Link>
        </nav>
      </header>
      <div className="proof-brief"><div><small>Hipóteses</small>{hypotheses.map((item) => <span key={item}>{item}</span>)}</div><div><small>Tese</small><strong>{proof.thesis}</strong></div></div>
      <ProofSession key={`${proof.id}:${mode}`} proof={proof} mode={mode} />
    </section>
  );
}
