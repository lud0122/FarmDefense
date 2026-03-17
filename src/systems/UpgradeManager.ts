// src/systems/UpgradeManager.ts
import { TowerUpgrade, TOWER_UPGRADES, getTowerUpgradeById } from '../config/towerUpgrades';

export interface GameState {
  currentWave: number;
  economySystem: {
    getMoney(): number;
    spendMoney(amount: number): boolean;
  };
}

export class UpgradeManager {
  private scene: Phaser.Scene;
  private baseDifficultyHealth: number = 1000; // 第5波敌人总生命值

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 计算升级价格
   * 最终价格 = 基础价格 × 波次系数 × 难度系数 × 塔楼等级系数
   */
  public calculateUpgradeCost(
    upgrade: TowerUpgrade,
    towerLevel: number,
    currentWave: number,
    totalEnemyHealth: number
  ): number {
    // 波次系数: max(1.0, min(1.0 + (当前波次 - 解锁波次) × 0.05, 1.5))
    const waveBonus = Math.max(0, currentWave - upgrade.unlocksAtWave) * 0.05;
    const waveMultiplier = Math.max(1.0, Math.min(1.0 + waveBonus, 1.5));

    // 难度系数: max(0.5, min(1.0 + (敌人总生命 / 基准生命 - 1.0) × 0.5, 2.0))
    const safeBaseHealth = Math.max(this.baseDifficultyHealth, 1);
    const difficultyRatio = totalEnemyHealth / safeBaseHealth;
    const difficultyBonus = (difficultyRatio - 1.0) * 0.5;
    const difficultyMultiplier = Math.max(0.5, Math.min(1.0 + difficultyBonus, 2.0));

    // 塔楼等级系数
    const levelMultipliers: Record<number, number> = {
      1: 1.0,
      2: 1.3,
      3: 1.6,
    };
    const levelMultiplier = levelMultipliers[towerLevel] || 1.0;

    // 计算最终价格
    const finalCost = Math.floor(
      upgrade.baseCost * waveMultiplier * difficultyMultiplier * levelMultiplier
    );

    return finalCost;
  }

  /**
   * 获取塔楼可购买的升级列表
   */
  public getAvailableUpgrades(
    towerKey: string,
    towerLevel: number,
    currentWave: number,
    purchasedUpgrades: Set<string>
  ): TowerUpgrade[] {
    const config = TOWER_UPGRADES[towerKey];
    if (!config) return [];

    const available: TowerUpgrade[] = [];

    // 检查特殊能力升级
    for (const ability of config.abilities) {
      // 已购买的不显示
      if (purchasedUpgrades.has(ability.id)) continue;
      // 未解锁的不显示
      if (currentWave < ability.unlocksAtWave) continue;
      // 需要塔楼等级的检查
      if (ability.requiredTowerLevel && towerLevel < ability.requiredTowerLevel) continue;

      available.push(ability);
    }

    // 检查进化分支（仅3级时显示）
    if (towerLevel >= 3) {
      for (const evolution of config.evolutions) {
        if (purchasedUpgrades.has(evolution.id)) continue;
        if (currentWave < evolution.unlocksAtWave) continue;

        available.push(evolution);
      }
    }

    return available;
  }

  /**
   * 验证是否可以购买升级
   */
  public canPurchaseUpgrade(
    upgrade: TowerUpgrade,
    currentMoney: number,
    cost: number
  ): boolean {
    return currentMoney >= cost;
  }

  /**
   * 通过ID获取升级配置
   */
  public getUpgradeById(upgradeId: string): TowerUpgrade | null {
    return getTowerUpgradeById(upgradeId);
  }
}
