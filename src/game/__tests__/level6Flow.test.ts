import { describe, expect, it } from 'vitest';
import { LEVELS } from '../../config/levels';

describe('level6 flow contract', () => {
  it('has level 6 with behavior mix', () => {
    const level6 = LEVELS.find(level => level.number === 6);
    expect(level6).toBeDefined();
    expect(level6?.behaviorMix).toEqual({
      rushRatio: 0.3,
      towerBreakerRatio: 0.7
    });
  });
});
