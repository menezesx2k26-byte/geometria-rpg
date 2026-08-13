import { describe, expect, it } from 'vitest';
import { proofs } from '../data/proofs';
import { validateProofStep } from './proofEngine';

const proof = proofs.find((item) => item.id === 'isosceles-cevian');

describe('proof engine', () => {
  it('accepts a correct proof step', () => {
    expect(proof).toBeDefined();
    const step = proof?.steps.find((item) => item.id === 'iso-given');
    if (!proof || !step) return;
    expect(validateProofStep(proof, step, [], { involvedObjects: ['segment-ac', 'segment-ab'], relation: 'congruent', justification: 'hypothesis', answerIds: [] })).toMatchObject({ correct: true });
  });

  it('detects a logical jump and names missing dependencies', () => {
    expect(proof).toBeDefined();
    const step = proof?.steps.find((item) => item.id === 'triangles-sas');
    if (!proof || !step) return;
    const result = validateProofStep(proof, step, [], { involvedObjects: [], answerIds: ['triangles-sas'] });
    expect(result).toMatchObject({ correct: false, kind: 'logical-jump' });
    expect(result.message).toContain('AB ≅ AC');
  });

  it('rejects a wrong justification', () => {
    expect(proof).toBeDefined();
    const step = proof?.steps.find((item) => item.id === 'bisected-angle');
    if (!proof || !step) return;
    expect(validateProofStep(proof, step, [], { involvedObjects: [], justification: 'OPV', answerIds: [] })).toMatchObject({ correct: false, kind: 'justification' });
  });

  it('accepts the valid auxiliary construction and rejects the useless one', () => {
    const asa = proofs.find((item) => item.id === 'asa-contradiction');
    const step = asa?.steps.find((item) => item.id === 'construct-f-prime');
    if (!asa || !step) return;
    expect(validateProofStep(asa, step, ['audit-leap', 'assume-less'], { involvedObjects: [], answerIds: ['construct-inside'] })).toMatchObject({ correct: true });
    expect(validateProofStep(asa, step, ['audit-leap', 'assume-less'], { involvedObjects: [], answerIds: ['construct-midpoint'] })).toMatchObject({ correct: false, kind: 'answer' });
  });

  it('rejects a wrong card order', () => {
    expect(proof).toBeDefined();
    const step = proof?.steps.find((item) => item.id === 'linear-pair');
    if (!proof || !step) return;
    expect(validateProofStep(proof, step, ['angles-at-d', 'collinear-bdc'], { involvedObjects: [], answerIds: ['linear-pair', 'angles-at-d', 'collinear-bdc'] })).toMatchObject({ correct: false, kind: 'answer' });
  });

  it('accepts an equivalent order of independent premises', () => {
    expect(proof).toBeDefined();
    const step = proof?.steps.find((item) => item.id === 'linear-pair');
    if (!proof || !step) return;
    expect(validateProofStep(proof, step, ['angles-at-d', 'collinear-bdc'], { involvedObjects: [], answerIds: ['collinear-bdc', 'angles-at-d', 'linear-pair'] })).toMatchObject({ correct: true, kind: 'accepted' });
  });
});
