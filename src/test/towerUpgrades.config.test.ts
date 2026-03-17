// src/test/towerUpgrades.config.test.ts
import { describe, it, expect } from 'vitest';
import { TOWER_UPGRADES, getTowerUpgradeById } from '../config/towerUpgrades';

describe('TowerUpgrades Config', () => {
  it('should export valid upgrade configurations', () => {
    expect(TOWER_UPGRADES).toBeDefined();
    expect(TOWER_UPGRADES.pistol).toBeDefined();
    expect(TOWER_UPGRADES.machinegun).toBeDefined();
  });

  it('should have valid upgrade structure for pistol', () => {
    const pistolUpgrades = TOWER_UPGRADES.pistol;
    expect(pistolUpgrades.abilities).toHaveLength(2);
    expect(pistolUpgrades.evolutions).toHaveLength(2);

    // 检查第一个能力的属性
    const ability1 = pistolUpgrades.abilities[0];
    expect(ability1.id).toBe('pistol_ability_1');
    expect(ability1.name).toBe('快速装填');
    expect(ability1.baseCost).toBe(60);
    expect(ability1.unlocksAtWave).toBe(3);
  });

  it('should support upgrade lookup by ID', () => {
    const upgrade = getTowerUpgradeById('pistol_ability_1');
    expect(upgrade).toBeDefined();
    expect(upgrade?.name).toBe('快速装填');
  });
});
