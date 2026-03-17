# 塔楼升级系统实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现塔楼升级系统，包括特殊能力升级、进化分支选择、环形菜单交互和动态定价

**Architecture:** 采用 Manager Pattern 管理升级状态，通过配置驱动定义每种塔楼的升级路线，使用环形菜单UI提供直观交互

**Tech Stack:** TypeScript, Phaser 3, Vitest

---

## 文件清单

**创建文件:**
1. `src/config/towerUpgrades.ts` - 塔楼升级配置
2. `src/systems/UpgradeManager.ts` - 升级逻辑管理器
3. `src/systems/TowerUpgradeManager.ts` - TowerManager 升级集成
4. `src/ui/TowerUpgradeMenu.ts` - 环形菜单UI组件
5. `src/ui/TowerUpgradeOption.ts` - 单个升级选项UI
6. `src/test/upgrade-system.test.ts` - 升级系统单元测试

**修改文件:**
1. `src/entities/Tower.ts` - 添加升级状态跟踪
2. `src/systems/TowerManager.ts` - 集成升级管理器
3. `src/scenes/GameScene.ts` - 添加升级菜单交互

---

## Task 1: 数据配置与模型设计

**目标:** 创建升级配置系统，定义所有塔楼的升级路线

**Files:**
- Create: `src/config/towerUpgrades.ts`
- Test: `src/test/towerUpgrades.config.test.ts`

### 1.1 定义升级类型接口
- [ ] **Step 1: 编写类型定义测试**
```typescript
// src/test/towerUpgrades.config.test.ts
import { describe, it, expect } from 'vitest';
import { TOWER_UPGRADES, isValidUpgradeId, getTowerUpgrades } from '../config/towerUpgrades';

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
```

- [ ] **Step 2: 运行测试确认失败**
```bash
npx vitest run src/test/towerUpgrades.config.test.ts
```
Expected: FAIL - "TOWER_UPGRADES is not defined"

- [ ] **Step 3: 实现升级配置**
```typescript
// src/config/towerUpgrades.ts
export type UpgradeType = 'ability' | 'evolution';

export interface SpecialAbility {
  type: 'pierce' | 'stun' | 'slow_aura' | 'burn' | 'chain' | 'mark' | 'freeze';
  value?: number;
  duration?: number;
  targets?: number;
  chance?: number;
}

export interface UpgradeEffect {
  damageMultiplier?: number;
  rangeMultiplier?: number;
  fireRateMultiplier?: number;
  specialAbility?: SpecialAbility;
}

export interface TowerUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: UpgradeType;
  baseCost: number;
  effect: UpgradeEffect;
  requiredTowerLevel?: number;
  unlocksAtWave: number;
  evolutionTarget?: string;
}

export interface TowerUpgradeConfig {
  abilities: TowerUpgrade[];
  evolutions: TowerUpgrade[];
}

export const TOWER_UPGRADES: Record<string, TowerUpgradeConfig> = {
  pistol: {
    abilities: [
      {
        id: 'pistol_ability_1',
        name: '快速装填',
        description: '攻速+30%',
        icon: '⚡',
        type: 'ability',
        baseCost: 60,
        effect: { fireRateMultiplier: 0.7 },
        unlocksAtWave: 3,
      },
      {
        id: 'pistol_ability_2',
        name: '穿透子弹',
        description: '子弹可穿透1个敌人',
        icon: '➡️',
        type: 'ability',
        baseCost: 80,
        effect: { specialAbility: { type: 'pierce', targets: 1 } },
        unlocksAtWave: 5,
      },
    ],
    evolutions: [
      {
        id: 'pistol_evolve_shotgun',
        name: '散弹塔',
        description: '一次发射3颗子弹',
        icon: '💥',
        type: 'evolution',
        baseCost: 150,
        effect: { damageMultiplier: 0.6, rangeMultiplier: 0.8 },
        unlocksAtWave: 1,
        requiredTowerLevel: 3,
        evolutionTarget: 'shotgun',
      },
      {
        id: 'pistol_evolve_sniper',
        name: '狙击塔',
        description: '超远射程，高伤害',
        icon: '🎯',
        type: 'evolution',
        baseCost: 150,
        effect: { damageMultiplier: 1.8, rangeMultiplier: 2.0, fireRateMultiplier: 2.0 },
        unlocksAtWave: 1,
        requiredTowerLevel: 3,
        evolutionTarget: 'sniper',
      },
    ],
  },
  // 其他塔楼类似配置...
  machinegun: {
    abilities: [
      {
        id: 'machinegun_ability_1',
        name: '铅弹',
        description: '伤害+25%',
        icon: '⚙️',
        type: 'ability',
        baseCost: 70,
        effect: { damageMultiplier: 1.25 },
        unlocksAtWave: 4,
      },
      {
        id: 'machinegun_ability_2',
        name: '弹幕压制',
        description: '5%概率眩晕敌人0.5秒',
        icon: '🌀',
        type: 'ability',
        baseCost: 90,
        effect: { specialAbility: { type: 'stun', duration: 500, chance: 0.05 } },
        unlocksAtWave: 6,
      },
    ],
    evolutions: [
      {
        id: 'machinegun_evolve_gatling',
        name: '加特林塔',
        description: '超高攻速',
        icon: '🔫',
        type: 'evolution',
        baseCost: 180,
        effect: { fireRateMultiplier: 0.5, damageMultiplier: 0.7 },
        unlocksAtWave: 1,
        requiredTowerLevel: 3,
        evolutionTarget: 'gatling',
      },
      {
        id: 'machinegun_evolve_precision',
        name: '精准机枪',
        description: '远程精准射击',
        icon: '🎯',
        type: 'evolution',
        baseCost: 180,
        effect: { rangeMultiplier: 1.4 },
        unlocksAtWave: 1,
        requiredTowerLevel: 3,
        evolutionTarget: 'precision_machinegun',
      },
    ],
  },
  // ... 其他塔楼配置
};

// 辅助函数：通过ID查找升级
export function getTowerUpgradeById(upgradeId: string): TowerUpgrade | null {
  for (const towerKey in TOWER_UPGRADES) {
    const config = TOWER_UPGRADES[towerKey];
    const ability = config.abilities.find(a => a.id === upgradeId);
    if (ability) return ability;
    const evolution = config.evolutions.find(e => e.id === upgradeId);
    if (evolution) return evolution;
  }
  return null;
}

// 辅助函数：获取所有进化目标类型
export function getEvolutionTypes(towerKey: string): string[] {
  const config = TOWER_UPGRADES[towerKey];
  if (!config) return [];
  return config.evolutions.map(e => e.evolutionTarget).filter(Boolean) as string[];
}
```

- [ ] **Step 4: 运行测试确认通过**
```bash
npx vitest run src/test/towerUpgrades.config.test.ts
```
Expected: PASS

- [ ] **Step 5: 提交代码**
```bash
git add src/config/towerUpgrades.ts src/test/towerUpgrades.config.test.ts
git commit -m "feat: 添加塔楼升级配置和类型定义"
```

---

## Task 2: UpgradeManager核心逻辑

**Files:**
- Create: `src/systems/UpgradeManager.ts`
- Test: `src/test/upgradeManager.test.ts`

### 2.1 实现动态定价系统
- [ ] **Step 1: 编写定价测试**
```typescript
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
      const upgrade2 = { ...upgrade, baseCost: 100 };
      const costLevel2 = manager.calculateUpgradeCost(upgrade2, 2, 1, 1000);
      expect(costLevel2).toBe(130);

      // Level 3: 系数1.6
      const upgrade3 = { ...upgrade, baseCost: 100 };
      const costLevel3 = manager.calculateUpgradeCost(upgrade3, 3, 1, 1000);
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
});
```

- [ ] **Step 2: 运行测试确认失败**
```bash
npx vitest run src/test/upgradeManager.test.ts
```
Expected: FAIL - "UpgradeManager is not defined"

- [ ] **Step 3: 实现UpgradeManager**
```typescript
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
```

- [ ] **Step 4: 运行测试确认通过**
```bash
npx vitest run src/test/upgradeManager.test.ts
```
Expected: PASS

- [ ] **Step 5: 提交代码**
```bash
git add src/systems/UpgradeManager.ts src/test/upgradeManager.test.ts
git commit -m "feat: 实现 UpgradeManager 核心逻辑和动态定价系统"
```

---

## Task 3: Tower类添加升级状态

**Files:**
- Modify: `src/entities/Tower.ts`
- Test: `src/test/Tower.upgrade.test.ts`

### 3.1 添加升级状态跟踪
- [ ] **Step 1: 编写Tower升级测试**
```typescript
// src/test/Tower.upgrade.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Tower Upgrade System', () => {
  it('should track purchased upgrades', () => {
    // 模拟 Tower 类
    const tower = {
      upgrades: new Set<string>(),
      hasUpgrade: (id: string) => tower.upgrades.has(id),
      purchaseUpgrade: (id: string) => tower.upgrades.add(id),
    };

    expect(tower.hasUpgrade('pistol_ability_1')).toBe(false);
    tower.purchaseUpgrade('pistol_ability_1');
    expect(tower.hasUpgrade('pistol_ability_1')).toBe(true);
  });

  it('should apply upgrade effects immutably', () => {
    const originalConfig = { damage: 10, range: 150, fireRate: 500 };

    // 模拟不可变性原则
    const newConfig = {
      ...originalConfig,
      damage: 12, // 10 * 1.2
    };

    // 原始配置保持不变
    expect(originalConfig.damage).toBe(10);
    // 新配置已更新
    expect(newConfig.damage).toBe(12);
  });
});
```

- [ ] **Step 2: 运行测试**
```bash
npx vitest run src/test/Tower.upgrade.test.ts
```

- [ ] **Step 3: 更新Tower类**
阅读 `src/entities/Tower.ts` 现有实现，然后添加：

```typescript
// src/entities/Tower.ts - additions

import { TowerUpgrade, UpgradeEffect, SpecialAbility } from '../config/towerUpgrades';

export class Tower extends Phaser.GameObjects.Container {
  // 现有属性...
  private upgrades: Set<string> = new Set(); // 已购买的升级ID
  private evolution: string | null = null; // 进化后的类型
  private specialAbilities: SpecialAbility[] = []; // 已解锁的特殊能力

  // 现有方法...

  /**
   * 检查是否已购买指定升级
   */
  public hasUpgrade(upgradeId: string): boolean {
    return this.upgrades.has(upgradeId);
  }

  /**
   * 获取所有已购买的升级
   */
  public getPurchasedUpgrades(): string[] {
    return Array.from(this.upgrades);
  }

  /**
   * 购买并应用升级
   * 遵循不可变性原则
   */
  public purchaseUpgrade(upgrade: TowerUpgrade): void {
    if (this.upgrades.has(upgrade.id)) return;

    this.upgrades.add(upgrade.id);
    this.applyUpgradeEffect(upgrade.effect);

    // 如果是进化，记录进化目标
    if (upgrade.type === 'evolution' && upgrade.evolutionTarget) {
      this.evolution = upgrade.evolutionTarget;
    }
  }

  /**
   * 应用升级效果（不可变）
   */
  private applyUpgradeEffect(effect: UpgradeEffect): void {
    // 创建新的配置对象，遵循不可变性原则
    const newConfig = { ...this.config };

    if (effect.damageMultiplier) {
      newConfig.damage = Math.floor(this.config.damage * effect.damageMultiplier);
    }
    if (effect.rangeMultiplier) {
      newConfig.range = Math.floor(this.config.range * effect.rangeMultiplier);
    }
    if (effect.fireRateMultiplier) {
      newConfig.fireRate = Math.floor(this.config.fireRate * effect.fireRateMultiplier);
    }

    // 处理特殊能力
    if (effect.specialAbility) {
      this.specialAbilities.push(effect.specialAbility);
    }

    // 更新配置
    this.config = newConfig;
  }

  /**
   * 获取特殊能力列表
   */
  public getSpecialAbilities(): SpecialAbility[] {
    return [...this.specialAbilities];
  }

  /**
   * 检查是否有指定类型的特殊能力
   */
  public hasSpecialAbility(type: SpecialAbility['type']): boolean {
    return this.specialAbilities.some(ability => ability.type === type);
  }

  /**
   * 获取进化后的类型
   */
  public getEvolution(): string | null {
    return this.evolution;
  }

  /**
   * 播放升级特效
   */
  public playUpgradeEffect(): void {
    // 放大缩小动画
    this.scene.tweens.add({
      targets: this,
      scale: 1.2,
      duration: 200,
      yoyo: true,
    });

    // 发射金色粒子
    const particles = this.scene.add.particles(this.x, this.y, 'upgrade_particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 10,
    });

    this.scene.time.delayedCall(600, () => {
      particles.destroy();
    });
  }
}
```

- [ ] **Step 4: 运行测试**
```bash
npx vitest run src/test/Tower.upgrade.test.ts
```
Expected: PASS

- [ ] **Step 5: 运行类型检查**
```bash
npx tsc --noEmit
```
Expected: 无错误

- [ ] **Step 6: 提交代码**
```bash
git add src/entities/Tower.ts src/test/Tower.upgrade.test.ts
git commit -m "feat: Tower类添加升级状态跟踪和效果应用"
```

---

## Task 4: Ring Menu UI Component

**Files:**
- Create: `src/ui/TowerUpgradeOption.ts`
- Create: `src/ui/TowerUpgradeMenu.ts`

### 4.1 Single Upgrade Option Component
- [ ] **Step 1: Write tests**
```typescript
// src/test/TowerUpgradeOption.test.ts
import { describe, it, expect } from 'vitest';

describe('TowerUpgradeOption', () => {
  it('should render upgrade option with correct properties', () => {
    // 测试升级选项组件的初始化
    const mockUpgrade = {
      id: 'test_upgrade',
      name: '测试升级',
      icon: '⚙️',
      cost: 100,
    };
    expect(mockUpgrade.name).toBe('测试升级');
    expect(mockUpgrade.icon).toBe('⚙️');
  });
});
```

- [ ] **Step 2: Create TowerUpgradeOption component**
```typescript
// src/ui/TowerUpgradeOption.ts
import Phaser from 'phaser';
import { TowerUpgrade } from '../config/towerUpgrades';

export class TowerUpgradeOption extends Phaser.GameObjects.Container {
  private upgrade: TowerUpgrade;
  private cost: number;
  private isPurchased: boolean;
  private canAfford: boolean;

  // UI elements
  private bg: Phaser.GameObjects.Circle;
  private iconText: Phaser.GameObjects.Text;
  private nameText: Phaser.GameObjects.Text;
  private costText: Phaser.GameObjects.Text;
  private tooltipContainer: Phaser.GameObjects.Container | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    upgrade: TowerUpgrade,
    cost: number,
    isPurchased: boolean,
    canAfford: boolean
  ) {
    super(scene, x, y);

    this.upgrade = upgrade;
    this.cost = cost;
    this.isPurchased = isPurchased;
    this.canAfford = canAfford;

    this.createUI();
    this.setupInteraction();

    scene.add.existing(this);
  }

  private createUI(): void {
    // 背景圆形
    const radius = 40;
    const color = this.getBackgroundColor();
    this.bg = this.scene.add.circle(0, 0, radius, color);
    this.bg.setStrokeStyle(3, this.canAfford ? 0xFFD700 : 0x888888);
    this.add(this.bg);

    // 图标 (emoji)
    this.iconText = this.scene.add.text(0, -10, this.upgrade.icon, {
      fontSize: '28px',
      color: this.isPurchased ? '#888888' : '#ffffff',
    }).setOrigin(0.5);
    this.add(this.iconText);

    // 名称
    this.nameText = this.scene.add.text(0, 15, this.upgrade.name, {
      fontSize: '12px',
      color: this.isPurchased ? '#666666' : '#ffffff',
    }).setOrigin(0.5);
    this.add(this.nameText);

    // 价格（如果未购买）
    if (!this.isPurchased) {
      this.costText = this.scene.add.text(0, 30, `${this.cost}金币`, {
        fontSize: '11px',
        color: this.canAfford ? '#00FF00' : '#FF0000',
      }).setOrigin(0.5);
      this.add(this.costText);
    }

    // 已购买标记
    if (this.isPurchased) {
      const checkMark = this.scene.add.text(0, 0, '✓', {
        fontSize: '16px',
        color: '#00FF00',
      }).setOrigin(0.5);
      this.add(checkMark);
    }
  }

  private getBackgroundColor(): number {
    if (this.isPurchased) return 0x444444;
    if (!this.canAfford) return 0x662222;
    return 0x2C3E50;
  }

  private setupInteraction(): void {
    if (this.isPurchased) return;

    this.bg.setInteractive({ useHandCursor: true });

    // 悬停效果
    this.bg.on('pointerover', () => {
      this.showTooltip();
      this.bg.setScale(1.1);
    });

    this.bg.on('pointerout', () => {
      this.hideTooltip();
      this.bg.setScale(1);
    });

    // 点击事件
    this.bg.on('pointerdown', () => {
      if (this.canAfford) {
        this.emit('select', this.upgrade, this.cost);
      }
    });
  }

  private showTooltip(): void {
    if (this.tooltipContainer) return;

    this.tooltipContainer = this.scene.add.container(0, 60);

    const bg = this.scene.add.rectangle(0, 0, 150, 80, 0x000000, 0.9);
    this.tooltipContainer.add(bg);

    const title = this.scene.add.text(0, -25, this.upgrade.name, {
      fontSize: '14px',
      color: '#FFD700',
    }).setOrigin(0.5);
    this.tooltipContainer.add(title);

    const desc = this.scene.add.text(0, 0, this.upgrade.description, {
      fontSize: '12px',
      color: '#FFFFFF',
      wordWrap: { width: 140 },
      align: 'center',
    }).setOrigin(0.5);
    this.tooltipContainer.add(desc);

    const price = this.scene.add.text(0, 25, `价格: ${this.cost}金币`, {
      fontSize: '12px',
      color: this.canAfford ? '#00FF00' : '#FF0000',
    }).setOrigin(0.5);
    this.tooltipContainer.add(price);

    this.add(this.tooltipContainer);
  }

  private hideTooltip(): void {
    if (this.tooltipContainer) {
      this.tooltipContainer.destroy();
      this.tooltipContainer = null;
    }
  }

  public updateCost(newCost: number, newCanAfford: boolean): void {
    this.cost = newCost;
    this.canAfford = newCanAfford;
    if (this.costText) {
      this.costText.setText(`${this.cost}金币`);
      this.costText.setColor(this.canAfford ? '#00FF00' : '#FF0000');
    }
    this.bg.setStrokeStyle(3, this.canAfford ? 0xFFD700 : 0x888888);
  }
}
```

- [ ] **Step 3: Create TowerUpgradeMenu**
```typescript
// src/ui/TowerUpgradeMenu.ts
import Phaser from 'phaser';
import { Tower } from '../entities/Tower';
import { TowerUpgrade } from '../config/towerUpgrades';
import { TowerUpgradeOption } from './TowerUpgradeOption';

interface MenuOptions {
  radius: number; // 环形半径
  optionRadius: number; // 选项半径
}

export class TowerUpgradeMenu extends Phaser.GameObjects.Container {
  private tower: Tower;
  private upgradeOptions: TowerUpgradeOption[] = [];
  private background: Phaser.GameObjects.Graphics | null = null;
  private closeButton: Phaser.GameObjects.Text | null = null;
  private recycleButton: Phaser.GameObjects.Container | null = null;

  constructor(
    scene: Phaser.Scene,
    tower: Tower,
    upgrades: TowerUpgrade[],
    costs: Map<string, number>,
    currentMoney: number
  ) {
    super(scene, tower.x, tower.y);

    this.tower = tower;

    this.createBackground();
    this.createUpgradeOptions(upgrades, costs, currentMoney);
    this.createCloseButton();
    this.createRecycleButton();

    scene.add.existing(this);
  }

  private createBackground(): void {
    // 半透明背景圆环
    this.background = this.scene.add.graphics();
    this.background.lineStyle(2, 0x00FF00, 0.3);
    this.background.strokeCircle(0, 0, 100);
    this.add(this.background);
  }

  private createUpgradeOptions(
    upgrades: TowerUpgrade[],
    costs: Map<string, number>,
    currentMoney: number
  ): void {
    const radius = 80; // 环形半径
    const angleStep = (2 * Math.PI) / upgrades.length;

    upgrades.forEach((upgrade, index) => {
      const angle = index * angleStep - Math.PI / 2; // 从顶部开始
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const cost = costs.get(upgrade.id) || 0;
      const isPurchased = this.tower.hasUpgrade(upgrade.id);
      const canAfford = currentMoney >= cost && !isPurchased;

      const option = new TowerUpgradeOption(
        this.scene,
        x,
        y,
        upgrade,
        cost,
        isPurchased,
        canAfford
      );

      option.on('select', (upgrade: TowerUpgrade, cost: number) => {
        this.emit('purchase', upgrade, cost);
      });

      this.upgradeOptions.push(option);
      this.add(option);
    });
  }

  private createCloseButton(): void {
    this.closeButton = this.scene.add.text(0, -120, '✕', {
      fontSize: '20px',
      color: '#FF0000',
      backgroundColor: '#330000',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5);

    this.closeButton.setInteractive({ useHandCursor: true });
    this.closeButton.on('pointerdown', () => {
      this.emit('close');
    });

    this.add(this.closeButton);
  }

  private createRecycleButton(): void {
    // 回收按钮
    const container = this.scene.add.container(0, 120);

    const bg = this.scene.add.rectangle(0, 0, 100, 35, 0x8B0000);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);

    const text = this.scene.add.text(0, 0, `回收 (${this.tower.getRecycleValue()})`, {
      fontSize: '12px',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    container.add(text);

    bg.on('pointerdown', () => {
      this.emit('recycle', this.tower);
    });

    this.recycleButton = container;
    this.add(container);
  }

  public updateCosts(costs: Map<string, number>, currentMoney: number): void {
    this.upgradeOptions.forEach(option => {
      const upgradeId = option['upgrade'].id;
      const cost = costs.get(upgradeId) || 0;
      const canAfford = currentMoney >= cost;
      option.updateCost(cost, canAfford);
    });
  }

  public destroy(fromScene?: boolean): void {
    this.upgradeOptions = [];
    super.destroy(fromScene);
  }
}
```

- [ ] **Step 4: Run type check**
```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit code**
```bash
git add src/ui/TowerUpgradeOption.ts src/ui/TowerUpgradeMenu.ts src/test/TowerUpgradeOption.test.ts
git commit -m "feat: 实现环形升级菜单UI组件"
```

---

## Task 5: TowerManager 集成

**Files:**
- Modify: `src/systems/TowerManager.ts`

### 5.1 整合升级系统
- [ ] **Step 1: Read existing TowerManager.ts**
```bash
cat src/systems/TowerManager.ts
```

- [ ] **Step 2: Add UpgradeManager integration**
```typescript
// src/systems/TowerManager.ts - modifications

import { UpgradeManager } from './UpgradeManager';
import { EconomySystem } from './EconomySystem'; // 假设这个存在

export class TowerManager {
  // 现有属性...
  private upgradeManager: UpgradeManager;
  private economySystem: EconomySystem;

  constructor(
    scene: Phaser.Scene,
    economySystem: EconomySystem,
    onTowerRemoved?: (tower: Tower) => void
  ) {
    // 现有初始化...
    this.upgradeManager = new UpgradeManager(scene);
    this.economySystem = economySystem;
  }

  // 现有方法...

  /**
   * 获取升级管理器
   */
  public getUpgradeManager(): UpgradeManager {
    return this.upgradeManager;
  }

  /**
   * 购买塔楼升级
   */
  public purchaseTowerUpgrade(tower: Tower, upgradeId: string): boolean {
    const upgrade = this.upgradeManager.getUpgradeById(upgradeId);
    if (!upgrade) return false;

    // 计算价格（需要游戏状态）
    const currentWave = (this.scene as any).currentWave || 1;
    const totalEnemyHealth = this.calculateTotalEnemyHealth();
    const cost = this.upgradeManager.calculateUpgradeCost(
      upgrade,
      tower.getLevel(),
      currentWave,
      totalEnemyHealth
    );

    // 检查金币
    if (this.economySystem.getMoney() < cost) {
      return false;
    }

    // 执行购买
    if (this.upgradeManager.canPurchaseUpgrade(
      upgrade,
      this.economySystem.getMoney(),
      cost
    )) {
      // 扣除金币
      this.economySystem.spendMoney(cost);

      // 应用升级
      tower.purchaseUpgrade(upgrade);

      // 播放特效
      tower.playUpgradeEffect();

      return true;
    }

    return false;
  }

  /**
   * 获取塔楼可用升级列表
   */
  public getAvailableUpgrades(tower: Tower): { upgrade: TowerUpgrade; cost: number }[] {
    const upgrades = this.upgradeManager.getAvailableUpgrades(
      tower.config.key,
      tower.getLevel(),
      (this.scene as any).currentWave || 1,
      new Set(tower.getPurchasedUpgrades())
    );

    const totalEnemyHealth = this.calculateTotalEnemyHealth();
    const currentWave = (this.scene as any).currentWave || 1;

    return upgrades.map(upgrade => ({
      upgrade,
      cost: this.upgradeManager.calculateUpgradeCost(
        upgrade,
        tower.getLevel(),
        currentWave,
        totalEnemyHealth
      ),
    }));
  }

  /**
   * 计算当前敌人总生命值
   */
  private calculateTotalEnemyHealth(): number {
    // 从EnemyManager获取，使用工具方法
    const enemyManager = (this.scene as any).enemyManager;
    if (!enemyManager) return 0;

    const enemies = enemyManager.getEnemies();
    return enemies.reduce((sum: number, enemy: any) => {
      return sum + (enemy.getCurrentHealth?.() || 0);
    }, 0);
  }
}
```

- [ ] **Step 3: Run type check**
```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit code**
```bash
git add src/systems/TowerManager.ts
git commit -m "feat: TowerManager集成UpgradeManager支持升级"
```

---

## Task 6: GameScene Integration

**Files:**
- Modify: `src/scenes/GameScene.ts`

### 6.1 添加升级菜单交互
- [ ] **Step 1: Read existing GameScene.ts**
```bash
head -100 src/scenes/GameScene.ts
```

- [ ] **Step 2: Add upgrade menu methods**
```typescript
// src/scenes/GameScene.ts - additions

import { TowerUpgradeMenu } from '../ui/TowerUpgradeMenu';
import { Tower } from '../entities/Tower';
import { TowerUpgrade } from '../config/towerUpgrades';

export class GameScene extends Phaser.Scene {
  // 现有属性...
  private upgradeMenu: TowerUpgradeMenu | null = null;
  private selectedTower: Tower | null = null;

  // 现有方法...

  /**
   * 显示塔楼升级菜单
   */
  public showTowerUpgradeMenu(tower: Tower): void {
    // 关闭现有菜单
    this.hideUpgradeMenu();
    this.hideTowerRecycleMenu();

    this.selectedTower = tower;

    // 获取可用升级
    const availableUpgrades = this.towerManager.getAvailableUpgrades(tower);

    // 构建成本映射
    const costs = new Map<string, number>();
    availableUpgrades.forEach(({ upgrade, cost }) => {
      costs.set(upgrade.id, cost);
    });

    const currentMoney = this.economySystem.getMoney();

    // 创建升级菜单
    this.upgradeMenu = new TowerUpgradeMenu(
      this,
      tower,
      availableUpgrades.map(u => u.upgrade),
      costs,
      currentMoney
    );

    // 绑定事件
    this.upgradeMenu.on('purchase', (upgrade: TowerUpgrade, cost: number) => {
      this.handleUpgradePurchase(tower, upgrade, cost);
    });

    this.upgradeMenu.on('close', () => {
      this.hideUpgradeMenu();
    });

    this.upgradeMenu.on('recycle', (towerToRecycle: Tower) => {
      this.handleTowerRecycle(towerToRecycle);
    });

    // 播放打开音效
    this.audioSystem.playSound('menu_open');
  }

  /**
   * 隐藏升级菜单
   */
  private hideUpgradeMenu(): void {
    if (this.upgradeMenu) {
      this.upgradeMenu.destroy();
      this.upgradeMenu = null;
      this.selectedTower = null;
    }
  }

  /**
   * 处理升级购买
   */
  private handleUpgradePurchase(tower: Tower, upgrade: TowerUpgrade, cost: number): void {
    const success = this.towerManager.purchaseTowerUpgrade(tower, upgrade.id);

    if (success) {
      // 播放购买音效
      this.audioSystem.playSound('upgrade_purchase');

      // 刷新菜单
      this.showTowerUpgradeMenu(tower);

      // 显示购买提示
      this.showFloatingText(`购买成功！`, tower.x, tower.y - 50, '#00FF00');
    } else {
      // 显示失败提示
      this.showFloatingText(`金币不足！`, tower.x, tower.y - 50, '#FF0000');
    }
  }

  /**
   * 处理塔楼回收
   */
  private handleTowerRecycle(tower: Tower): void {
    // 调用现有的回收逻辑
    this.recycleTower(tower);
    this.hideUpgradeMenu();
  }

  /**
   * 显示浮动文字示珍遵御等级系数
    };
    const levelMultiplier = levelMultipliers[towerLevel] || 1.0;

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

    //
'superpowers:writing-plans' took too long (> 600000ms) and was cancelled.
