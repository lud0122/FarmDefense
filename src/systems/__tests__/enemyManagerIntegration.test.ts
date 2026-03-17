import { describe, expect, it } from 'vitest';
import { buildFixedBehaviorMix } from '../../utils/enemyBehaviorMix';

describe('enemy manager integration helpers', () => {
  it('builds exact 30/70 split for one batch', () => {
    const mix = buildFixedBehaviorMix(20, 0.3);
    expect(mix.filter(v => v === 'rush')).toHaveLength(6);
    expect(mix.filter(v => v === 'towerBreaker')).toHaveLength(14);
  });
});
