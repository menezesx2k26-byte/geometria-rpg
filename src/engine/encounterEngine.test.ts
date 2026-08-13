import { describe, expect, it } from 'vitest';
import { encounters } from '../data/bootstrap';
import { validateApplication } from './encounterEngine';

const pilot = encounters.find((encounter) => encounter.id === 'crossroads-opv');
const correspondence = encounters.find((encounter) => encounter.id === 'ordered-correspondence');

describe('encounter engine', () => {
  it('accepts OPV, then LAL, then the corresponding consequence', () => {
    expect(pilot).toBeDefined();
    if (!pilot) return;
    const opv = validateApplication(pilot, pilot.initialRelationIds, 'opv', ['angle-afb', 'angle-hfr']);
    expect(opv).toMatchObject({ correct: true, producedRelationIds: ['relation-opv'] });
    const sas = validateApplication(pilot, [...pilot.initialRelationIds, ...opv.producedRelationIds], 'sas', ['triangle-afb', 'triangle-hfr']);
    expect(sas).toMatchObject({ correct: true, producedRelationIds: ['relation-triangles-sas'] });
    const cpctc = validateApplication(pilot, [...pilot.initialRelationIds, ...opv.producedRelationIds, ...sas.producedRelationIds], 'cpctc', ['segment-ab', 'segment-hr']);
    expect(cpctc).toMatchObject({ correct: true, producedRelationIds: ['relation-ab-hr'] });
  });

  it('rejects LAL before the included angle is justified', () => {
    expect(pilot).toBeDefined();
    if (!pilot) return;
    expect(validateApplication(pilot, pilot.initialRelationIds, 'sas', ['triangle-afb', 'triangle-hfr'])).toMatchObject({ correct: false, kind: 'missing-relation' });
  });

  it('rejects inverted ordered correspondence', () => {
    expect(correspondence).toBeDefined();
    if (!correspondence) return;
    expect(validateApplication(correspondence, [], 'triangle-congruence', ['vertex-a', 'vertex-e', 'vertex-b', 'vertex-d', 'vertex-c', 'vertex-f'])).toMatchObject({ correct: false, kind: 'wrong-order' });
  });
});
