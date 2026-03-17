// src/test/upgradeManager.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { UpgradeManager } from '../systems/UpgradeManager';
import { TowerUpgrade } from '../config/towerUpgrades';

describe('UpgradeManager', () => {
  let manager: UpgradeManager;

  beforeEach(() => {
    manager = new UpgradeManager({} as Phaser.Scene);
  });

  describe('calculateUpgradeCost', () => {
    it('should calculate base cost correctly', () => {
      const upgrade: TowerUpgrade = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        icon: '⚡',
        type: 'ability',
        baseCost: 100,
        unlocksAtWave: 1,
        effect: {},
      };

      const cost = manager.calculateUpgradeCost(upgrade, 1, 1, 1000);
      expect(cost).toBe(100);
    });

    it('should increase cost based on tower level', () => {
      const upgrade: TowerUpgrade = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        icon: '⚡',
        type: 'ability',
        baseCost: 100,
        unlocksAtWave: 1,
        effect: {},
      };

      // Level 1: 系数1.0
      const costLevel1 = manager.calculateUpgradeCost(upgrade, 1, 1, 1000);
      expect(costLevel1).toBe(100);

      // Level 2: 系数1.3
      const costLevel2 = manager.calculateUpgradeCost(upgrade, 2, 1, 1000);
      expect(costLevel2).toBe(130);

      // Level 3: 系数1.6
      const costLevel3 = manager.calculateUpgradeCost(upgrade, 3, 1, 1000);
      expect(costLevel3).toBe(160);
    });

    it('should apply wave multiplier correctly', () => {
      const upgrade: TowerUpgrade = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        icon: '⚡',
        type: 'ability',
        baseCost: 100,
        unlocksAtWave: 5,
        effect: {},
      };

      // 波次系数: max(1.0, min(1.0 + (10-5)*0.05, 1.5)) = 1.25
      const cost = manager.calculateUpgradeCost(upgrade, 1, 10, 1000);
      expect(cost).toBe(125);
    });

    it('should handle edge cases', () => {
      const upgrade: TowerUpgrade = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        icon: '⚡',
        type: 'ability',
        baseCost: 100,
        unlocksAtWave: 1,
        effect: {},
      };

      // 波次低于解锁波次
      const costEarly = manager.calculateUpgradeCost(upgrade, 1, 1, 1000);
      expect(costEarly).toBeGreaterThanOrEqual(100);

      // 敌人血量为0
      const costZeroEnemy = manager.calculateUpgradeCost(upgrade, 1, 1, 0);
      expect(costZeroEnemy).toBeGreaterThanOrEqual(50); // 最低0.5倍率
    });
  });

  describe('getAvailableUpgrades', () => {
    it('should return available upgrades for pistol', () => {
      const upgrades = manager.getAvailableUpgrades('pistol', 1, 5, new Set());
      expect(upgrades.length).toBeGreaterThan(0);

      // 应包含第一个能力(波次3解锁)
      const ability1 = upgrades.find(u => u.id === 'pistol_ability_1');
      expect(ability1).toBeDefined();
    });

    it('should not show locked upgrades', () => {
      const upgrades = manager.getAvailableUpgrades('pistol', 1, 1, new Set());

      // 波次1时,能力1(波次3解锁)不应显示
      const ability1 = upgrades.find(u => u.id === 'pistol_ability_1');
      expect(ability1).toBeUndefined();
    });

    it('should not show already purchased upgrades', () => {
      const purchased = new Set(['pistol_ability_1']);
      const upgrades = manager.getAvailableUpgrades('pistol', 1, 5, purchased);

      const ability1 = upgrades.find(u => u.id === 'pistol_ability_1');
      expect(ability1).toBeUndefined();
    });

    it('should show evolutions at level 3', () => {
      const upgrades = manager.getAvailableUpgrades('pistol', 3, 5, new Set());

      // 应包含进化选项
      const evolution = upgrades.find(u => u.type === 'evolution');
      expect(evolution).toBeDefined();
    });
  });
});
