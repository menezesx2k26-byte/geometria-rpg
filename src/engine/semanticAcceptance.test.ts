import { describe, expect, it } from 'vitest';
import { encounters } from '../data/bootstrap';
import { proofs } from '../data/proofs';
import { validateApplication } from './encounterEngine';
import { validateProofStep } from './proofEngine';

describe('mathematically equivalent answer paths', () => {
  it('accepts correspondence pairs in any pair order and orientation', () => {
    const encounter = encounters.find((item) => item.id === 'ordered-correspondence');
    expect(encounter).toBeDefined();
    if (!encounter) return;
    expect(validateApplication(encounter, [], 'triangle-congruence', ['vertex-d', 'vertex-a', 'vertex-f', 'vertex-c', 'vertex-e', 'vertex-b']))
      .toMatchObject({ correct: true, producedRelationIds: ['relation-correspondence'] });
  });

  it('rejects wrong pairings even when the same six vertices are present', () => {
    const encounter = encounters.find((item) => item.id === 'ordered-correspondence');
    expect(encounter).toBeDefined();
    if (!encounter) return;
    expect(validateApplication(encounter, [], 'triangle-congruence', ['vertex-a', 'vertex-b', 'vertex-d', 'vertex-e', 'vertex-c', 'vertex-f']))
      .toMatchObject({ correct: false, kind: 'wrong-order' });
  });

  it('accepts generic Definição when it names the same point-midpoint definition', () => {
    const proof = proofs.find((item) => item.id === 'isosceles-cevian');
    const step = proof?.steps.find((item) => item.id === 'midpoint-d');
    expect(proof).toBeDefined();
    expect(step).toBeDefined();
    if (!proof || !step) return;
    expect(validateProofStep(proof, step, ['base-parts'], { involvedObjects: [], justification: 'definition', answerIds: [] }))
      .toMatchObject({ correct: true, kind: 'accepted' });
  });
});
