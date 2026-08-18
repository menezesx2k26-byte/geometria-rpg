import type { Encounter, GeometryObject } from '../../types/domain';

interface GeometryFigureProps {
  encounter: Encounter;
  selectedObjectIds: string[];
  onToggle: (id: string) => void;
  showPalette?: boolean;
  readOnly?: boolean;
}

function ObjectButton({ object, order, onToggle }: { object: GeometryObject; order?: number | undefined; onToggle: () => void }) {
  return (
    <button type="button" className="figure-object-button" onClick={onToggle}>
      {order ? <span>{order}</span> : null}{object.label}
    </button>
  );
}

export function GeometryFigure({ encounter, selectedObjectIds, onToggle, showPalette = true, readOnly = false }: GeometryFigureProps) {
  const selectableIds = new Set(encounter.applicationRules.flatMap((rule) => rule.objectIds));
  const selectableObjects = encounter.objects.filter((object) => selectableIds.has(object.id));

  return (
    <div className={`interactive-figure interactive-figure--${encounter.figureKind}`}>
      {encounter.figureKind === 'crossed-triangles' ? (
        <svg viewBox="0 0 640 430" aria-label="Triângulos AFB e HFR com retas cruzando em F" role="img">
          <polygon points="90,85 318,215 92,348" className={selectedObjectIds.includes('triangle-afb') ? 'is-selected' : ''} onClick={() => onToggle('triangle-afb')} />
          <polygon points="548,82 318,215 550,350" className={selectedObjectIds.includes('triangle-hfr') ? 'is-selected' : ''} onClick={() => onToggle('triangle-hfr')} />
          <line x1="90" y1="85" x2="550" y2="350" />
          <line x1="92" y1="348" x2="548" y2="82" />
          <line x1="90" y1="85" x2="92" y2="348" className="triangle-side" />
          <line x1="548" y1="82" x2="550" y2="350" className="triangle-side" />
          <path d="M278 193 A47 47 0 0 0 278 239" className="angle-mark" />
          <path d="M358 193 A47 47 0 0 1 358 239" className="angle-mark" />
          <path d="M185 139 l-8 14 M194 144 l-8 14 M449 291 l-8 14 M458 296 l-8 14" className="tick-mark" />
          <path d="M183 294 l8 14 M447 128 l8 14" className="tick-mark" />
          {[
            ['A', 72, 67], ['B', 72, 382], ['F', 306, 207], ['H', 557, 66], ['R', 560, 383],
          ].map(([label, x, y]) => <text key={String(label)} x={Number(x)} y={Number(y)}>{label}</text>)}
        </svg>
      ) : (
        <svg viewBox="0 0 640 430" aria-label="Triângulos ABC e DEF" role="img">
          {/* Keep a wide central gutter: C/E labels must remain distinct on narrow mobile viewports. */}
          <polygon points="50,340 160,70 260,340" />
          <polygon points="380,340 490,70 590,340" />
          <path d="M100 225 l14 6 M430 225 l14 6 M215 205 l14 -6 M545 205 l14 -6" className="tick-mark" />
          {[
            ['A', 152, 55], ['B', 25, 375], ['C', 265, 375], ['D', 482, 55], ['E', 348, 375], ['F', 594, 375],
          ].map(([label, x, y]) => (
            <text
              key={String(label)}
              x={Number(x)}
              y={Number(y)}
              className={selectedObjectIds.includes(`vertex-${String(label).toLowerCase()}`) ? 'is-highlighted' : ''}
            >
              {label}
            </text>
          ))}
        </svg>
      )}

      {showPalette && <div className="figure-object-palette" aria-label="Objetos selecionáveis">
        {selectableObjects.map((object) => {
          const selectedIndex = selectedObjectIds.indexOf(object.id);
          return (
            <ObjectButton
              key={object.id}
              object={object}
              order={selectedIndex >= 0 ? selectedIndex + 1 : undefined}
              onToggle={() => { if (!readOnly) onToggle(object.id); }}
            />
          );
        })}
      </div>}
    </div>
  );
}
