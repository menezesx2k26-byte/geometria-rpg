import { useId, type KeyboardEvent } from 'react';
import type { Encounter, GeometryObject } from '../../types/domain';

interface GeometryFigureProps {
  encounter: Encounter;
  selectedObjectIds: string[];
  onToggle: (id: string) => void;
  showPalette?: boolean;
  readOnly?: boolean;
  visibleObjectIds?: string[];
  selectionPresentation?: 'sequence' | 'pairs';
  showCorrespondenceMarks?: boolean;
}

function ObjectButton({
  object,
  badge,
  selected,
  onToggle,
}: {
  object: GeometryObject;
  badge?: number | undefined;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="figure-object-button"
      aria-pressed={selected}
      onClick={onToggle}
    >
      {badge ? <span aria-hidden="true">{badge}</span> : null}
      {object.label}
    </button>
  );
}

function activationHandler(onActivate: () => void) {
  return (event: KeyboardEvent<SVGPolygonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onActivate();
  };
}

export function GeometryFigure({
  encounter,
  selectedObjectIds,
  onToggle,
  showPalette = true,
  readOnly = false,
  visibleObjectIds,
  selectionPresentation = 'sequence',
  showCorrespondenceMarks = true,
}: GeometryFigureProps) {
  const figureId = useId();
  const titleId = `${figureId}-title`;
  const descId = `${figureId}-desc`;
  const selectableIds = new Set(encounter.applicationRules.flatMap((rule) => rule.objectIds));
  const visibleIds = visibleObjectIds ? new Set(visibleObjectIds) : undefined;
  const selectableObjects = encounter.objects.filter(
    (object) => selectableIds.has(object.id) && (!visibleIds || visibleIds.has(object.id)),
  );

  const toggleTriangle = (id: string) => {
    if (!readOnly && selectableIds.has(id) && (!visibleIds || visibleIds.has(id))) onToggle(id);
  };

  return (
    <div className={`interactive-figure interactive-figure--${encounter.figureKind}`}>
      {encounter.figureKind === 'crossed-triangles' ? (
        <svg viewBox="0 0 640 430" preserveAspectRatio="xMidYMid meet" aria-labelledby={`${titleId} ${descId}`} role="img">
          <title id={titleId}>Triângulos AFB e HFR com retas concorrentes em F</title>
          <desc id={descId}>AF é congruente a FH; BF é congruente a FR; os ângulos AFB e HFR são opostos pelo vértice.</desc>

          <polygon
            points="90,85 318,215 92,348"
            className={selectedObjectIds.includes('triangle-afb') ? 'is-selected' : ''}
            role={readOnly ? undefined : 'button'}
            tabIndex={!readOnly && selectableIds.has('triangle-afb') ? 0 : undefined}
            aria-label={!readOnly ? 'Selecionar triângulo AFB' : undefined}
            aria-pressed={!readOnly ? selectedObjectIds.includes('triangle-afb') : undefined}
            onClick={() => toggleTriangle('triangle-afb')}
            onKeyDown={activationHandler(() => toggleTriangle('triangle-afb'))}
          />
          <polygon
            points="548,82 318,215 550,350"
            className={selectedObjectIds.includes('triangle-hfr') ? 'is-selected' : ''}
            role={readOnly ? undefined : 'button'}
            tabIndex={!readOnly && selectableIds.has('triangle-hfr') ? 0 : undefined}
            aria-label={!readOnly ? 'Selecionar triângulo HFR' : undefined}
            aria-pressed={!readOnly ? selectedObjectIds.includes('triangle-hfr') : undefined}
            onClick={() => toggleTriangle('triangle-hfr')}
            onKeyDown={activationHandler(() => toggleTriangle('triangle-hfr'))}
          />

          <line x1="90" y1="85" x2="550" y2="350" />
          <line x1="92" y1="348" x2="548" y2="82" />
          <line x1="90" y1="85" x2="92" y2="348" className="triangle-side" />
          <line x1="548" y1="82" x2="550" y2="350" className="triangle-side" />

          <path d="M278 193 A47 47 0 0 0 278 239" className="angle-mark" />
          <path d="M358 193 A47 47 0 0 1 358 239" className="angle-mark" />

          {/* Hipóteses corretas: AF ≅ FH (uma marca) e BF ≅ FR (duas marcas). */}
          <path d="M208 143 l-8 14 M429 142 l8 14" className="tick-mark" />
          <path d="M194 279 l8 14 M208 270 l8 14 M431 272 l-8 14 M445 280 l-8 14" className="tick-mark" />

          {[
            ['A', 72, 67], ['B', 72, 382], ['F', 318, 207], ['H', 566, 66], ['R', 568, 383],
          ].map(([label, x, y]) => (
            <text key={String(label)} x={Number(x)} y={Number(y)} textAnchor="middle">{label}</text>
          ))}
        </svg>
      ) : (
        <svg viewBox="0 0 640 430" preserveAspectRatio="xMidYMid meet" aria-labelledby={`${titleId} ${descId}`} role="img">
          <title id={titleId}>Triângulos ABC e DEF</title>
          <desc id={descId}>Dois triângulos usados para interpretar a correspondência declarada pela notação de congruência.</desc>

          <polygon points="60,340 170,70 280,340" />
          <polygon points="360,340 470,70 580,340" />

          {showCorrespondenceMarks ? (
            <>
              {/* AB ↔ DE: uma marca. */}
              <path d="M109 221 l12 5 M409 221 l12 5" className="tick-mark" />
              {/* AC ↔ DF: duas marcas. */}
              <path d="M219 216 l12 -5 M226 230 l12 -5 M519 216 l12 -5 M526 230 l12 -5" className="tick-mark" />
              {/* BC ↔ EF: três marcas. */}
              <path d="M151 331 v18 M170 331 v18 M189 331 v18 M451 331 v18 M470 331 v18 M489 331 v18" className="tick-mark" />
            </>
          ) : null}

          {[
            ['A', 170, 52], ['B', 45, 382], ['C', 295, 382], ['D', 470, 52], ['E', 345, 382], ['F', 595, 382],
          ].map(([label, x, y]) => (
            <text
              key={String(label)}
              x={Number(x)}
              y={Number(y)}
              textAnchor="middle"
              className={selectedObjectIds.includes(`vertex-${String(label).toLowerCase()}`) ? 'is-highlighted' : ''}
            >
              {label}
            </text>
          ))}
        </svg>
      )}

      {showPalette && (
        <div className="figure-object-palette" aria-label="Objetos selecionáveis">
          {selectableObjects.map((object) => {
            const selectedIndex = selectedObjectIds.indexOf(object.id);
            const badge = selectedIndex >= 0
              ? selectionPresentation === 'pairs'
                ? Math.floor(selectedIndex / 2) + 1
                : selectedIndex + 1
              : undefined;
            return (
              <ObjectButton
                key={object.id}
                object={object}
                selected={selectedIndex >= 0}
                badge={badge}
                onToggle={() => { if (!readOnly) onToggle(object.id); }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
