import { describe, expect, it } from 'vitest';
import { RushBehavior } from '../RushBehavior';
import { TowerBreakerBehavior } from '../TowerBreakerBehavior';

describe('enemy behaviors', () => {
  it('rush behavior delegates to default movement', () => {
    let moved = false;
    const behavior = new RushBehavior();
    behavior.update(
      {
        x: 0,
        y: 0,
        currentSpeed: 100,
        config: { key: 'rabbit' },
        moveByBehaviorDefault: () => {
          moved = true;
        },
        moveToPoint: () => undefined
      },
      { getTowers: () => [] },
      1000,
      16
    );

    expect(moved).toBe(true);
  });

  it('tower breaker attacks when in contact range and cooldown elapsed', () => {
    let damage = 0;
    const behavior = new TowerBreakerBehavior({
      attackDamage: 10,
      attackCooldownMs: 500,
      attackRangePx: 20,
      targetSearchIntervalMs: 0
    });

    const enemy = {
      x: 10,
      y: 10,
      currentSpeed: 100,
      config: { key: 'boar' },
      moveByBehaviorDefault: () => undefined,
      moveToPoint: () => undefined
    };

    const tower = {
      x: 10,
      y: 10,
      active: true,
      takeDamage: (amount: number) => {
        damage += amount;
      }
    };

    behavior.update(enemy, { getTowers: () => [tower] }, 1000, 16);
    behavior.update(enemy, { getTowers: () => [tower] }, 1200, 16);
    behavior.update(enemy, { getTowers: () => [tower] }, 1601, 16);

    expect(damage).toBe(20);
  });

  it('tower breaker falls back to default movement when no tower exists', () => {
    let fallbackMoved = false;
    const behavior = new TowerBreakerBehavior({
      attackDamage: 10,
      attackCooldownMs: 500,
      attackRangePx: 20,
      targetSearchIntervalMs: 0
    });

    behavior.update(
      {
        x: 0,
        y: 0,
        currentSpeed: 100,
        config: { key: 'fox' },
        moveByBehaviorDefault: () => {
          fallbackMoved = true;
        },
        moveToPoint: () => undefined
      },
      { getTowers: () => [] },
      1000,
      16
    );

    expect(fallbackMoved).toBe(true);
  });
});
