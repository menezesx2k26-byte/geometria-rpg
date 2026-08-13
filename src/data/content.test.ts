import { describe, expect, it } from 'vitest';
import { analyticalCampaignQuests, validateAnalyticalCampaign } from './campaignAnalytical';
import { euclideanCampaignQuests, validateEuclideanCampaign } from './campaignEuclidean';
import { assetMap } from './assetMap';
import { codexEntries, encounters, regions, skills } from './bootstrap';
import { validateContent } from './contentValidation';
import { proofs } from './proofs';
import { validateProofs } from './proofValidation';

describe('data validation', () => {
  it('keeps all skill, encounter and asset links valid', () => {
    expect(validateContent({ skills, regions, encounters, codexEntries, assetManifest: assetMap })).toEqual([]);
  });
  it('keeps proof dependencies acyclic and complete', () => expect(validateProofs(proofs)).toEqual([]));
  it('covers the official campaigns exactly', () => {
    expect(validateEuclideanCampaign()).toEqual([]);
    expect(euclideanCampaignQuests).toHaveLength(43);
    expect(validateAnalyticalCampaign()).toEqual([]);
    expect(analyticalCampaignQuests).toHaveLength(30);
  });
});
