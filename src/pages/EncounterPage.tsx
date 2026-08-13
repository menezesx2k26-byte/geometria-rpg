import { ArrowLeft, Lightbulb, Swords } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GeometryFigure } from '../components/encounter/GeometryFigure';
import { FeedbackPanel, InventorySkillChip, QuestFrame, UnlockBanner } from '../components/rpg';
import { findEncounter, skills } from '../data/bootstrap';
import { validateApplication } from '../engine/encounterEngine';
import { useProgress } from '../state/progress';
import type { Encounter } from '../types/domain';

function EncounterSession({ encounter }: { encounter: Encounter }) {
  const { completeEncounter, recordAttempt } = useProgress();
  const [selectedSkillId, setSelectedSkillId] = useState<string>();
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [knownRelationIds, setKnownRelationIds] = useState<string[]>(encounter.initialRelationIds);
  const [feedback, setFeedback] = useState<{ state: 'correct' | 'incorrect'; message: string }>();
  const [visibleHintCount, setVisibleHintCount] = useState(0);
  const [solved, setSolved] = useState(false);

  const inventory = useMemo(
    () => encounter.inventorySkillIds
      .map((id) => skills.find((skill) => skill.id === id))
      .filter((skill) => skill !== undefined),
    [encounter],
  );
  const knownRelations = encounter.relations.filter((relation) => knownRelationIds.includes(relation.id));

  const toggleObject = (objectId: string) => {
    setFeedback(undefined);
    setSelectedObjectIds((current) =>
      current.includes(objectId)
        ? current.filter((id) => id !== objectId)
        : [...current, objectId],
    );
  };

  const applySkill = () => {
    const result = validateApplication(encounter, knownRelationIds, selectedSkillId, selectedObjectIds);
    recordAttempt(
      encounter.id,
      result.ruleId ?? 'application',
      [selectedSkillId ?? 'no-skill', ...selectedObjectIds],
      result.correct,
      encounter.diagnosticTags,
    );
    setFeedback({ state: result.correct ? 'correct' : 'incorrect', message: result.message });
    if (!result.correct) return;

    const nextRelationIds = [...new Set([...knownRelationIds, ...result.producedRelationIds])];
    setKnownRelationIds(nextRelationIds);
    setSelectedObjectIds([]);
    setSelectedSkillId(undefined);

    const completed = encounter.completionRelationIds.every((id) => nextRelationIds.includes(id));
    if (completed) {
      const unlockedSkills = skills.filter((skill) => encounter.unlockSkillIds.includes(skill.id));
      completeEncounter(
        encounter.id,
        unlockedSkills.map((skill) => skill.id),
        unlockedSkills.map((skill) => skill.codexEntryId),
      );
      setSolved(true);
    }
  };

  if (solved) {
    return (
      <section className="page encounter-page">
        <UnlockBanner title={encounter.title}>
          {encounter.unlockSkillIds.length
            ? `Novas skills registradas: ${encounter.unlockSkillIds.map((id) => skills.find((skill) => skill.id === id)?.shortTitle).filter(Boolean).join(' · ')}.`
            : 'A aplicação foi registrada no seu histórico local.'}
        </UnlockBanner>
        <article className="debrief-card">
          <span className="eyebrow">Resolução</span>
          <h2>O argumento completo</h2>
          <p>{encounter.resolution}</p>
          <h3>Debrief</h3>
          <p>{encounter.debrief}</p>
        </article>
        <div className="completion-actions">
          {encounter.id === 'crossroads-opv' && (
            <Link className="primary-action" to="/encounter/ordered-correspondence">Próximo encounter</Link>
          )}
          <Link className="secondary-action" to="/map">Voltar ao mapa</Link>
        </div>
      </section>
    );
  }

  const asksForCriterion = knownRelationIds.includes('relation-opv');

  return (
    <section className="page encounter-page">
      <header className="encounter-header">
        <Link to="/map" className="icon-link" aria-label="Voltar ao mapa"><ArrowLeft /></Link>
        <div>
          <small>{encounter.subtitle}</small>
          <h1>{encounter.title}</h1>
        </div>
        <span>{encounter.difficulty}/5</span>
      </header>

      <QuestFrame label={encounter.title}>
        <div className="encounter-objective">
          <span className="eyebrow">Objetivo</span>
          <strong>{encounter.objective}</strong>
        </div>

        <div className="gameplay-layout">
          <GeometryFigure
            encounter={encounter}
            selectedObjectIds={selectedObjectIds}
            onToggle={toggleObject}
          />

          <aside className="action-workbench">
            <span className="eyebrow">Aplicação matemática</span>
            <h2>
              {asksForCriterion
                ? 'As relações satisfazem um critério. Qual deles permite avançar?'
                : 'Escolha uma skill e os objetos aos quais ela se aplica.'}
            </h2>

            <div className="workbench-step">
              <strong>1 · Skill</strong>
              <div className="skill-inventory">
                {inventory.map((skill) => (
                  <button
                    type="button"
                    key={skill.id}
                    className={selectedSkillId === skill.id ? 'is-selected' : ''}
                    onClick={() => {
                      if (selectedSkillId !== skill.id) setSelectedObjectIds([]);
                      setSelectedSkillId(skill.id);
                      setFeedback(undefined);
                    }}
                  >
                    <InventorySkillChip skill={skill} state="available" />
                  </button>
                ))}
              </div>
            </div>

            <div className="workbench-step">
              <strong>2 · Objetos</strong>
              <p>
                {selectedObjectIds.length
                  ? selectedObjectIds.map((id, index) => `${index + 1}. ${encounter.objects.find((object) => object.id === id)?.label}`).join(' · ')
                  : 'Toque nos objetos da figura ou use os alvos textuais abaixo dela.'}
              </p>
            </div>

            {feedback && <FeedbackPanel state={feedback.state}>{feedback.message}</FeedbackPanel>}

            <button
              type="button"
              className="primary-action primary-action--wide"
              disabled={!selectedSkillId || selectedObjectIds.length === 0}
              onClick={applySkill}
            >
              <Swords size={18} /> Confirmar aplicação
            </button>

            <section className="relation-workspace">
              <strong>Workspace de relações</strong>
              {knownRelations.length ? (
                <ol>
                  {knownRelations.map((relation) => (
                    <li key={relation.id}><span>{relation.notation}</span><small>{relation.reason}</small></li>
                  ))}
                </ol>
              ) : <p>Nenhuma relação registrada ainda.</p>}
            </section>

            <section className="layered-hints">
              {encounter.hints.slice(0, visibleHintCount).map((hint, index) => (
                <p key={hint}><Lightbulb size={15} /><span><strong>Pista {index + 1}:</strong> {hint}</span></p>
              ))}
              {visibleHintCount < encounter.hints.length && (
                <button type="button" className="text-action" onClick={() => setVisibleHintCount((count) => count + 1)}>
                  Mostrar {visibleHintCount ? 'próxima pista' : 'uma pista'}
                </button>
              )}
            </section>
          </aside>
        </div>
      </QuestFrame>
    </section>
  );
}

export function EncounterPage() {
  const { id = '' } = useParams();
  const encounter = findEncounter(id);

  if (!encounter) {
    return (
      <section className="page empty-page">
        <h1>Encounter não encontrado</h1>
        <Link to="/map">Voltar ao mapa</Link>
      </section>
    );
  }

  return <EncounterSession key={encounter.id} encounter={encounter} />;
}
