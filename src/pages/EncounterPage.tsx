import { ArrowLeft, Lightbulb, Swords } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GeometryFigure } from '../components/encounter/GeometryFigure';
import { MissionRewardCard } from '../components/campaign/MissionRewardCard';
import { CompetencyDebrief } from '../components/learning/CompetencyDebrief';
import { FeedbackPanel, InventorySkillChip, QuestFrame, UnlockBanner } from '../components/rpg';
import { findEncounter, skills } from '../data/bootstrap';
import { validateApplication } from '../engine/encounterEngine';
import { useProgress } from '../state/progress';
import type { Encounter } from '../types/domain';
import type { DiagnosticTag, MasteryDimension } from '../types/domain';

function objectLabel(encounter: Encounter, objectId: string) {
  return encounter.objects.find((object) => object.id === objectId)?.label ?? objectId;
}

function formatPairs(encounter: Encounter, selectedObjectIds: string[]) {
  if (!selectedObjectIds.length) return '';
  const pairs: string[] = [];
  for (let index = 0; index < selectedObjectIds.length; index += 2) {
    const left = objectLabel(encounter, selectedObjectIds[index] ?? '');
    const rightId = selectedObjectIds[index + 1];
    const right = rightId ? objectLabel(encounter, rightId) : '…';
    pairs.push(`Par ${Math.floor(index / 2) + 1}: ${left} ↔ ${right}`);
  }
  return pairs.join(' · ');
}

function EncounterSession({ encounter }: { encounter: Encounter }) {
  const { completeEncounter, recordAttempt } = useProgress();
  const singleSkillId = encounter.inventorySkillIds.length === 1 ? encounter.inventorySkillIds[0] : undefined;
  const [selectedSkillId, setSelectedSkillId] = useState<string | undefined>(singleSkillId);
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
  const pendingRules = encounter.applicationRules.filter(
    (rule) => !rule.producesRelationIds.every((id) => knownRelationIds.includes(id)),
  );
  const actionableRules = pendingRules.filter(
    (rule) => rule.requiresRelationIds.every((id) => knownRelationIds.includes(id)),
  );
  const activeRule = actionableRules.length === 1 ? actionableRules[0] : undefined;
  const isOrderedCorrespondence = encounter.id === 'ordered-correspondence';
  const scopedObjectIds = isOrderedCorrespondence && activeRule ? activeRule.objectIds : undefined;
  const expectedObjectCount = scopedObjectIds?.length;

  const orderedStagePrompt = activeRule?.id === 'rule-correspondence'
    ? 'Forme três pares de vértices correspondentes.'
    : activeRule?.id === 'rule-side-correspondence'
      ? 'Use os vértices já registrados para formar três pares de lados correspondentes.'
      : activeRule?.id === 'rule-angle-correspondence'
        ? 'Finalize formando três pares de ângulos correspondentes.'
        : 'Forme os pares correspondentes.';

  const orderedHints = activeRule?.id === 'rule-correspondence'
    ? [
        'Na escrita △ABC ≅ △DEF, compare letras que ocupam a mesma posição nos nomes dos triângulos.',
        'A orientação do desenho não define a correspondência; a notação escrita é que manda.',
        'Você pode registrar os três pares em qualquer ordem, e também pode começar por qualquer extremidade do par.',
      ]
    : activeRule?.id === 'rule-side-correspondence'
      ? [
          'Use os pares de vértices que você já registrou para transportar as extremidades de cada lado.',
          'Se X↔Y e Z↔W, então o lado XZ corresponde ao lado YW.',
          'A ordem em que os três pares de lados são registrados não muda a correspondência.',
        ]
      : activeRule?.id === 'rule-angle-correspondence'
        ? [
            'O vértice do ângulo determina qual ângulo do outro triângulo lhe corresponde.',
            'Use a correspondência de vértices já registrada; não dependa da aparência do desenho.',
            'Assim como nos lados, a ordem de registro dos três pares de ângulos é livre.',
          ]
        : encounter.hints;

  const activeHints = isOrderedCorrespondence ? orderedHints : encounter.hints;
  const displayObjective = isOrderedCorrespondence
    ? 'Interprete △ABC ≅ △DEF e construa as correspondências de vértices, lados e ângulos sem depender da posição visual dos triângulos.'
    : encounter.objective;

  const toggleObject = (objectId: string) => {
    if (scopedObjectIds && !scopedObjectIds.includes(objectId)) return;
    setFeedback(undefined);
    setSelectedObjectIds((current) => {
      const selectedIndex = current.indexOf(objectId);
      if (selectedIndex >= 0) {
        if (isOrderedCorrespondence) {
          const pairStart = Math.floor(selectedIndex / 2) * 2;
          const pairIds = new Set(current.slice(pairStart, pairStart + 2));
          return current.filter((id) => !pairIds.has(id));
        }
        return current.filter((id) => id !== objectId);
      }
      if (expectedObjectCount && current.length >= expectedObjectCount) return current;
      return [...current, objectId];
    });
  };

  const applySkill = () => {
    const result = validateApplication(encounter, knownRelationIds, selectedSkillId, selectedObjectIds);
    const rule = encounter.applicationRules.find((item) => item.id === result.ruleId);
    const diagnosticTags: DiagnosticTag[] = result.correct
      ? []
      : result.kind === 'wrong-order'
        ? ['ordered-correspondence']
        : rule?.skillId === 'opv'
          ? ['opv-recognition']
          : rule?.skillId === 'sas' && result.kind === 'missing-relation'
            ? ['proof-gap']
            : rule?.skillId === 'sas'
              ? ['included-angle']
              : ['ordered-correspondence'];
    const masteryDimensions: MasteryDimension[] = rule?.skillId === 'sas'
      ? ['application', 'justification', 'transfer']
      : rule?.skillId === 'opv'
        ? ['recognition', 'application', 'justification']
        : ['recognition', 'application'];
    recordAttempt(
      encounter.id,
      result.ruleId ?? 'application',
      [selectedSkillId ?? 'no-skill', ...selectedObjectIds],
      result.correct,
      diagnosticTags,
      {
        skillIds: rule ? [rule.skillId] : [],
        masteryDimensions,
        hintsUsed: visibleHintCount,
        position: `/encounter/${encounter.id}`,
      },
    );
    setFeedback({ state: result.correct ? 'correct' : 'incorrect', message: result.message });
    if (!result.correct) return;

    const nextRelationIds = [...new Set([...knownRelationIds, ...result.producedRelationIds])];
    setKnownRelationIds(nextRelationIds);
    setSelectedObjectIds([]);
    setSelectedSkillId(singleSkillId);
    setVisibleHintCount(0);

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
        <MissionRewardCard completionId={encounter.id} />
        <CompetencyDebrief encounterId={encounter.id} />
        <article className="debrief-card">
          <span className="eyebrow">Resolução</span>
          <h2>O argumento completo</h2>
          <p>{encounter.resolution}</p>
          <h3>Debrief</h3>
          <p>{encounter.debrief}</p>
        </article>
        <div className="completion-actions">
          <Link className="secondary-action" to="/map">Voltar ao mapa</Link>
        </div>
      </section>
    );
  }

  const asksForCriterion = knownRelationIds.includes('relation-opv') && !knownRelationIds.includes('relation-triangles-sas');
  const asksForConsequence = knownRelationIds.includes('relation-triangles-sas') && !knownRelationIds.includes('relation-ab-hr');
  const pairSummary = isOrderedCorrespondence ? formatPairs(encounter, selectedObjectIds) : '';
  const canConfirm = Boolean(
    selectedSkillId
    && selectedObjectIds.length > 0
    && (!expectedObjectCount || selectedObjectIds.length === expectedObjectCount),
  );

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
          <strong>{displayObjective}</strong>
          {isOrderedCorrespondence ? (
            <div className="workspace-card">
              <span className="eyebrow">Dado</span>
              <p><strong>△ABC ≅ △DEF</strong></p>
              <small>A correspondência deve ser lida da notação, não inferida pela posição visual do desenho.</small>
            </div>
          ) : null}
        </div>

        <div className="gameplay-layout">
          <GeometryFigure
            encounter={encounter}
            selectedObjectIds={selectedObjectIds}
            onToggle={toggleObject}
            visibleObjectIds={scopedObjectIds}
            selectionPresentation={isOrderedCorrespondence ? 'pairs' : 'sequence'}
            showCorrespondenceMarks={!isOrderedCorrespondence}
          />

          <aside className="action-workbench">
            <span className="eyebrow">Aplicação matemática</span>
            <h2>
              {isOrderedCorrespondence
                ? orderedStagePrompt
                : asksForConsequence
                  ? 'A congruência está provada. Qual consequência corresponde aos lados externos?'
                  : asksForCriterion
                    ? 'As relações satisfazem um critério. Qual deles permite avançar?'
                    : 'Escolha uma skill e os objetos aos quais ela se aplica.'}
            </h2>

            <div className="workbench-step">
              <strong>{singleSkillId ? 'Skill em foco' : '1 · Skill'}</strong>
              <div className="skill-inventory">
                {inventory.map((skill) => (
                  <button
                    type="button"
                    key={skill.id}
                    className={selectedSkillId === skill.id ? 'is-selected' : ''}
                    aria-pressed={selectedSkillId === skill.id}
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
              <strong>{isOrderedCorrespondence ? 'Monte os pares' : '2 · Objetos'}</strong>
              <p>
                {isOrderedCorrespondence
                  ? pairSummary || 'Toque em dois objetos para formar um par. A ordem dos três pares e o sentido dentro de cada par não alteram a resposta.'
                  : selectedObjectIds.length
                    ? selectedObjectIds.map((id, index) => `${index + 1}. ${objectLabel(encounter, id)}`).join(' · ')
                    : 'Toque nos objetos da figura ou use os alvos textuais abaixo dela.'}
              </p>
              {isOrderedCorrespondence && expectedObjectCount ? (
                <small>{Math.floor(selectedObjectIds.length / 2)}/3 pares completos · {selectedObjectIds.length}/{expectedObjectCount} objetos selecionados</small>
              ) : null}
            </div>

            {feedback && <FeedbackPanel state={feedback.state}>{feedback.message}</FeedbackPanel>}

            <button
              type="button"
              className="primary-action primary-action--wide"
              disabled={!canConfirm}
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
              {activeHints.slice(0, visibleHintCount).map((hint, index) => (
                <p key={hint}><Lightbulb size={15} /><span><strong>Pista {index + 1}:</strong> {hint}</span></p>
              ))}
              {visibleHintCount < activeHints.length && (
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
        <h1>Encontro não encontrado</h1>
        <Link to="/map">Voltar ao mapa</Link>
      </section>
    );
  }

  return <EncounterSession key={encounter.id} encounter={encounter} />;
}
