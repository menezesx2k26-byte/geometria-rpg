import { describe, expect, it } from 'vitest';
import { arrangePairingOptions, hasHorizontalAnswerLeak } from './pairingLayout';

describe('pairing layout', () => {
  const canonical = ['A', 'D', 'B', 'E', 'C', 'F'];

  it('never places a correct pair side by side', () => {
    for (let seed = 0; seed < 100; seed += 1) {
      const layout = arrangePairingOptions(canonical, `session-${seed}`);
      expect(layout).toHaveLength(6);
      expect(new Set(layout)).toEqual(new Set(canonical));
      expect(hasHorizontalAnswerLeak(layout, canonical)).toBe(false);
    }
  });

  it('varies the layout across sessions', () => {
    const layouts = new Set(
      Array.from({ length: 20 }, (_, seed) => arrangePairingOptions(canonical, `session-${seed}`).join(',')),
    );
    expect(layouts.size).toBeGreaterThan(1);
  });

  it('detects the original answer-revealing layout', () => {
    expect(hasHorizontalAnswerLeak(['A', 'D', 'B', 'E', 'C', 'F'], canonical)).toBe(true);
  });
});
