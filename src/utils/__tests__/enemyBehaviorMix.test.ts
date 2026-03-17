import { describe, expect, it } from 'vitest';
import { buildFixedBehaviorMix, shuffleBehaviorMix } from '../enemyBehaviorMix';

describe('enemyBehaviorMix', () => {
  it('builds fixed 30/70 split for total 10', () => {
    const mix = buildFixedBehaviorMix(10, 0.3);
    const rushCount = mix.filter(v => v === 'rush').length;
    const towerBreakerCount = mix.filter(v => v === 'towerBreaker').length;

    expect(mix).toHaveLength(10);
    expect(rushCount).toBe(3);
    expect(towerBreakerCount).toBe(7);
  });

  it('uses rounded rush count for odd totals', () => {
    const mix = buildFixedBehaviorMix(7, 0.3);
    const rushCount = mix.filter(v => v === 'rush').length;
    const towerBreakerCount = mix.filter(v => v === 'towerBreaker').length;

    expect(rushCount).toBe(2);
    expect(towerBreakerCount).toBe(5);
  });

  it('shuffles while preserving counts', () => {
    const source = ['rush', 'rush', 'towerBreaker', 'towerBreaker', 'towerBreaker'] as const;
    const values = [0.9, 0.1, 0.4, 0.8, 0.3];
    let index = 0;
    const rng = () => {
      const value = values[index % values.length];
      index += 1;
      return value;
    };

    const shuffled = shuffleBehaviorMix([...source], rng);

    expect(shuffled).toHaveLength(source.length);
    expect(shuffled.filter(v => v === 'rush')).toHaveLength(2);
    expect(shuffled.filter(v => v === 'towerBreaker')).toHaveLength(3);
  });
});
