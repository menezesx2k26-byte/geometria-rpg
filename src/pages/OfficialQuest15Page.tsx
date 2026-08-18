import { ArrowLeft, Check, Swords } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FeedbackPanel, QuestFrame, UnlockBanner } from '../components/rpg';
import { MissionRewardCard } from '../components/campaign/MissionRewardCard';
import { CompetencyDebrief } from '../components/learning/CompetencyDebrief';
import { officialQuest15 } from '../data/officialQuest15';
import { useProgress } from '../state/progress';

export function OfficialQuest15Page() {
  const { completeEncounter, recordAttempt } = useProgress();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string>();
  const [relations, setRelations] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect'>();
  const [solved, setSolved] = useState(false);
  const step = officialQuest15.steps[stepIndex];

  if (solved) return <section className="page"><UnlockBanner title="Questão 15 resolvida">Resposta oficial confirmada: {officialQuest15.officialAnswer}</UnlockBanner><MissionRewardCard completionId={officialQuest15.id} /><CompetencyDebrief encounterId={officialQuest15.id} /><article className="debrief-card"><span className="eyebrow">Debrief</span><h2>Da figura à razão</h2><p>O percurso exigiu OPV, escolha explícita de ALA, correspondência ordenada, duas equações e a consequência métrica da congruência.</p></article><div className="completion-actions"><Link className="secondary-action" to="/review">Abrir diagnóstico</Link></div></section>;
  if (!step) return null;

  const verify = () => {
    if (!selectedId) return;
    const correct = selectedId === step.correctId;
    const tag = step.id === 'q15-opv' ? 'opv-recognition' : step.id === 'q15-order' ? 'ordered-correspondence' : step.id === 'q15-x' || step.id === 'q15-y' ? 'algebra-linear' : step.id === 'q15-asa' ? 'proof-gap' : 'segment-vs-measure';
    recordAttempt(officialQuest15.id, step.id, [selectedId], correct, correct ? [] : [tag], { skillIds: [step.id === 'q15-asa' ? 'asa' : step.id === 'q15-opv' ? 'opv' : step.id === 'q15-order' ? 'triangle-congruence' : 'angle-algebra'], masteryDimensions: ['application', 'justification', 'transfer'], hintsUsed: 0, position: '/encounter/official-q15' });
    setFeedback(correct ? 'correct' : 'incorrect');
  };

  const advance = () => {
    setRelations((current) => [...current, step.relation]);
    if (stepIndex === officialQuest15.steps.length - 1) {
      completeEncounter(officialQuest15.id, ['asa', 'triangle-congruence', 'cpctc'], ['codex-asa', 'codex-triangle-congruence', 'codex-cpctc']);
      setSolved(true);
      return;
    }
    setStepIndex((index) => index + 1); setSelectedId(undefined); setFeedback(undefined);
  };

  return <section className="page"><Link className="back-link" to="/vertical-slice"><ArrowLeft size={16} /> Fortaleza</Link><header className="official-quest-header"><span className="eyebrow">Questão oficial 15 · {stepIndex + 1}/{officialQuest15.steps.length}</span><h1>{officialQuest15.title}</h1><p>{officialQuest15.sourceQuestion}</p></header><QuestFrame><div className="official-quest-layout"><section className="official-diagram"><svg viewBox="0 0 620 390" role="img" aria-label="Triângulos CBA e CDE formados por duas retas cruzando em C"><polygon points="70,310 260,70 310,195"/><polygon points="310,195 555,82 500,320"/><line x1="70" y1="310" x2="555" y2="82"/><line x1="260" y1="70" x2="500" y2="320"/><text x="48" y="340">B</text><text x="245" y="52">A</text><text x="300" y="190">C</text><text x="560" y="75">D</text><text x="505" y="350">E</text></svg><aside>{officialQuest15.hypothesis.map((item) => <span key={item}>{item}</span>)}</aside></section><section className="official-workbench"><h2>{step.prompt}</h2><div className="proof-choice-grid">{step.options.map((option) => <button type="button" key={option.id} className={selectedId === option.id ? 'proof-choice is-selected' : 'proof-choice'} onClick={() => { setSelectedId(option.id); setFeedback(undefined); }}>{option.label}</button>)}</div>{feedback && <FeedbackPanel state={feedback}>{feedback === 'correct' ? step.success : step.error}</FeedbackPanel>}<button type="button" className="primary-action primary-action--wide" disabled={!selectedId} onClick={feedback === 'correct' ? advance : verify}>{feedback === 'correct' ? <><Check size={17}/>Registrar e avançar</> : <><Swords size={17}/>Sustentar resposta</>}</button><div className="relation-workspace"><strong>Argumento construído</strong><ol>{relations.map((relation) => <li key={relation}>{relation}</li>)}</ol></div></section></div></QuestFrame></section>;
}
