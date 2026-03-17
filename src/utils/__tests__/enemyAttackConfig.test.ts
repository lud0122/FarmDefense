import { describe, expect, it } from 'vitest';
import { resolveEnemyAttackConfig } from '../enemyAttackConfig';

describe('enemyAttackConfig', () => {
  it('returns defaults for missing values', () => {
    const result = resolveEnemyAttackConfig({
      key: 'rabbit',
      name: '兔子',
      health: 10,
      speed: 100,
      reward: 1,
      size: 16,
      color: 0xffffff
    });

    expect(result.attackDamage).toBe(0);
    expect(result.attackCooldown).toBe(Number.POSITIVE_INFINITY);
    expect(result.attackRange).toBe(0);
    expect(result.isValidForTowerBreaker).toBe(false);
  });

  it('validates legal tower-breaker attack config', () => {
    const result = resolveEnemyAttackConfig({
      key: 'boar',
      name: '野猪',
      health: 100,
      speed: 80,
      reward: 25,
      size: 24,
      color: 0x8b4513,
      attackDamage: 12,
      attackCooldown: 900,
      attackRange: 24
    });

    expect(result.isValidForTowerBreaker).toBe(true);
  });

  it('marks invalid attack values as not valid', () => {
    const result = resolveEnemyAttackConfig({
      key: 'fox',
      name: '狐狸',
      health: 50,
      speed: 120,
      reward: 15,
      size: 20,
      color: 0xff6347,
      attackDamage: 0,
      attackCooldown: Infinity,
      attackRange: 0
    });

    expect(result.isValidForTowerBreaker).toBe(false);
  });
});
