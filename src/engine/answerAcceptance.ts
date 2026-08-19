import {
  angleCongruenceEquivalent,
  angleEquivalent,
  keywordEquivalent,
  lineEquivalent,
  normalizeMathText,
  pointEquivalent,
  scalarEquivalent,
  segmentEquivalent,
  triangleCorrespondenceEquivalent,
} from './mathAnswerEngine';

export function isAcceptedOption(
  selectedId: string | undefined,
  canonicalId: string,
  acceptedAlternativeIds: readonly string[] = [],
) {
  return Boolean(selectedId && (selectedId === canonicalId || acceptedAlternativeIds.includes(selectedId)));
}

export function sameMembers(left: readonly string[], right: readonly string[]) {
  if (left.length !== right.length) return false;
  const counts = new Map<string, number>();
  for (const value of left) counts.set(value, (counts.get(value) ?? 0) + 1);
  for (const value of right) {
    const count = counts.get(value) ?? 0;
    if (count <= 0) return false;
    if (count === 1) counts.delete(value);
    else counts.set(value, count - 1);
  }
  return counts.size === 0;
}

export function matchesUnorderedGroups(selectedIds: readonly string[], groups: readonly (readonly string[])[]) {
  const total = groups.reduce((sum, group) => sum + group.length, 0);
  if (selectedIds.length !== total || groups.some((group) => group.length === 0)) return false;
  const match = (offset: number, remaining: readonly (readonly string[])[]): boolean => {
    if (!remaining.length) return offset === selectedIds.length;
    return remaining.some((group, index) => {
      const candidate = selectedIds.slice(offset, offset + group.length);
      if (!sameMembers(candidate, group)) return false;
      return match(offset + group.length, [...remaining.slice(0, index), ...remaining.slice(index + 1)]);
    });
  };
  return match(0, groups);
}

const journeyAlternatives: Readonly<Record<string, readonly string[]>> = {
  'choose-distances': ['distance-all'],
};

export function acceptedJourneyOptionIds(stageId: string) {
  return journeyAlternatives[stageId] ?? [];
}

export type FreeTextScope = 'journey' | 'microquest' | 'official-q15' | 'correspondence-lesson';

export interface FreeTextValidationResult {
  supported: boolean;
  correct: boolean;
  message: string;
}

type Validator = (input: string) => boolean;

const validators = new Map<string, Validator>();
const key = (scope: FreeTextScope, id: string) => `${scope}:${id}`;
const register = (scope: FreeTextScope, id: string, validator: Validator) => validators.set(key(scope, id), validator);

// Correspondência: orientação do segmento/ângulo e permutações sincronizadas são equivalentes.
register('microquest', 'correspondence-pairs', (input) => segmentEquivalent(input, 'D', 'F'));
register('microquest', 'included-angle', (input) => angleEquivalent(input, 'B'));
register('microquest', 'cevian-classification', (input) => keywordEquivalent(input, ['mediana', 'median']));
register('correspondence-lesson', 'guided-b-e', (input) => keywordEquivalent(input, ['e', 'verticee', 'vérticee']));
register('correspondence-lesson', 'guided-c-f', (input) => keywordEquivalent(input, ['f', 'verticef', 'vérticef']));
register('correspondence-lesson', 'guided-side', (input) => segmentEquivalent(input, 'D', 'E'));
register('correspondence-lesson', 'guided-angle', (input) => angleEquivalent(input, 'F'));

// Questão oficial 15: aceita notação equivalente, cálculo equivalente e razão simplificada/não simplificada.
register('official-q15', 'q15-opv', (input) => angleCongruenceEquivalent(input, 'BCA', 'DCE'));
register('official-q15', 'q15-asa', (input) => keywordEquivalent(input, ['ala', 'angulo-lado-angulo', 'ângulo-lado-ângulo', 'anguloladoangulo']));
register('official-q15', 'q15-order', (input) => triangleCorrespondenceEquivalent(input, 'CBA', 'CDE'));
register('official-q15', 'q15-x', (input) => scalarEquivalent(input, 14, 'x'));
register('official-q15', 'q15-y', (input) => scalarEquivalent(input, 10, 'y'));
register('official-q15', 'q15-perimeter', (input) => scalarEquivalent(input, 1));

// Jornadas analíticas: somente etapas em que a equivalência pode ser decidida deterministicamente.
register('journey', 'midpoint-bc', (input) => pointEquivalent(input, { x: -1.5, y: 0.5 }));
register('journey', 'generic-point-line', (input) => lineEquivalent(input, { a: 1, b: 1, c: 1 }));
register('journey', 'solve-angle-x', (input) => scalarEquivalent(input, 15, 'x'));
register('journey', 'median-boss', (input) => lineEquivalent(input, { a: 3, b: 7, c: 1 }));
register('journey', 'solve-system', (input) => {
  const normalized = normalizeMathText(input);
  if (pointEquivalent(input, { x: 2 / 3, y: 2 / 3 })) return true;
  const pointMatch = input.match(/\([^()]+\)/);
  return Boolean(pointMatch && pointEquivalent(pointMatch[0], { x: 2 / 3, y: 2 / 3 }) && (normalized.includes('2/3') || normalized.includes('0.666')));
});
register('journey', 'solve-angle-x', (input) => scalarEquivalent(input, 15, 'x'));

export function supportsFreeTextAnswer(scope: FreeTextScope, id: string) {
  return validators.has(key(scope, id));
}

export function validateFreeTextAnswer(scope: FreeTextScope, id: string, input: string): FreeTextValidationResult {
  const validator = validators.get(key(scope, id));
  if (!validator) {
    return {
      supported: false,
      correct: false,
      message: 'Esta etapa usa uma interação estruturada; não há comparação textual para evitar falsos negativos.',
    };
  }
  const trimmed = input.trim();
  if (!trimmed) return { supported: true, correct: false, message: 'Escreva uma resposta antes de verificar.' };
  const correct = validator(trimmed);
  return {
    supported: true,
    correct,
    message: correct
      ? 'Forma matematicamente equivalente aceita.'
      : 'A forma digitada não é equivalente à relação pedida. Você pode usar outra notação matematicamente equivalente.',
  };
}
