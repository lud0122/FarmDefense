# 塔楼升级系统设计规范

**日期**: 2026-03-17
**作者**: Claude Code
**状态**: 待审核

## 1. 概述

为 Farm Defense 游戏设计一个多层级的塔楼升级系统，通过环形菜单交互，使用动态定价机制，为每种塔楼提供独特的升级路线和进化分支。

## 2. 核心目标

- 增加游戏策略深度，让玩家在塔楼发展上有更多选择
- 为每种塔楼设计独特的升级路线，避免同质化
- 使用动态定价系统，让游戏经济系统更加平衡
- 通过环形菜单提供直观的交互体验

## 3. 系统架构

### 3.1 升级类型分类

系统包含三种升级类型：

1. **数值增强升级**
   - 保持现有系统的等级提升（最多3级）
   - 每级提升：伤害+20%、射程+15%、攻速+10%
   - 使用现有的升级机制

2. **特殊能力升级**
   - 每种塔楼2个独特能力
   - 需要额外花费金币购买
   - 解锁新技能或增强效果
   - **互斥规则**：每种特殊能力只能购买一次，且非互斥（可同时拥有多个特殊能力）
   - 例如：手枪塔可同时拥有"快速装填"和"穿透子弹"

3. **分支进化升级**
   - 塔楼达到3级时可选择进化方向
   - 两个分支选项，改变塔楼的攻击模式
   - 进化后塔楼变为新类型
   - **互斥规则**：进化是一次性选择，进化后不可逆

### 3.2 每种塔楼的升级路线

#### 3.2.1 手枪塔 (Pistol Tower)

**特殊能力升级**：
- **快速装填** (L1)
  - 效果：攻速+30%
  - 基础成本：60金币
  - 解锁波次：第3波

- **穿透子弹** (L2)
  - 效果：子弹可穿透1个敌人
  - 基础成本：80金币
  - 解锁波次：第5波

**3级进化分支**：
- **分支A：散弹塔**
  - 一次发射3颗子弹，扇形攻击
  - 伤害-40%，射程-20%
  - 进化成本：150金币

- **分支B：狙击塔**
  - 单体高伤害，远射程
  - 射程+100%，伤害+80%，攻速-50%
  - 进化成本：150金币

#### 3.2.2 机枪塔 (MachineGun Tower)

**特殊能力升级**：
- **铅弹** (L1)
  - 效果：伤害+25%
  - 基础成本：70金币
  - 解锁波次：第4波

- **弹幕压制** (L2)
  - 效果：攻击时5%概率眩晕敌人0.5秒
  - 基础成本：90金币
  - 解锁波次：第6波

**3级进化分支**：
- **分支A：加特林塔**
  - 超高攻速，持续输出
  - 攻速+100%，伤害-30%
  - 进化成本：180金币

- **分支B：精准机枪**
  - 提升射程和命中率
  - 射程+40%，暴击率+15%
  - 进化成本：180金币

#### 3.2.3 冰冻塔 (Ice Tower)

**特殊能力升级**：
- **深度冻结** (L1)
  - 效果：减速效果从30%提升至50%
  - 基础成本：75金币
  - 解锁波次：第4波

- **冰霜光环** (L2)
  - 效果：范围内所有敌人额外减速10%
  - 基础成本：100金币
  - 解锁波次：第7波

**3级进化分支**：
- **分支A：暴风雪塔**
  - 范围攻击，影响所有范围内敌人
  - 伤害-50%，范围+100%
  - 进化成本：160金币

- **分支B：冰晶塔**
  - 单体攻击，有概率完全冻结敌人
  - 20%概率冻结敌人2秒
  - 进化成本：160金币

#### 3.2.4 榴弹塔 (Grenade Tower)

**特殊能力升级**：
- **高爆炸药** (L1)
  - 效果：溅射范围+50%
  - 基础成本：85金币
  - 解锁波次：第5波

- **燃烧弹** (L2)
  - 效果：命中后造成持续伤害3秒（每秒5点伤害）
  - 基础成本：110金币
  - 解锁波次：第8波

**3级进化分支**：
- **分支A：火箭炮塔**
  - 单体超高伤害
  - 射程+60%，伤害+120%
  - 进化成本：200金币

- **分支B：迫击炮塔**
  - 超大范围攻击
  - 范围+150%，攻速-40%
  - 进化成本：200金币

#### 3.2.5 电击塔 (Electric Tower)

**特殊能力升级**：
- **高压电** (L1)
  - 效果：伤害+40%
  - 基础成本：80金币
  - 解锁波次：第5波

- **连锁闪电** (L2)
  - 效果：攻击弹射至最多3个敌人，每次弹射伤害-30%
  - 基础成本：120金币
  - 解锁波次：第8波

**3级进化分支**：
- **分支A：雷暴塔**
  - 范围电击，同时伤害所有范围内敌人
  - 伤害-40%，范围+80%
  - 进化成本：170金币

- **分支B：电磁塔**
  - 攻击附带EMP效果，对机械敌人额外效果
  - 机械敌人眩晕2秒，伤害+50%
  - 进化成本：170金币

#### 3.2.6 哨戒塔 (Sentinel Tower)

**特殊能力升级**：
- **强化雷达** (L1)
  - 效果：射程+50%
  - 基础成本：65金币
  - 解锁波次：第4波

- **标记目标** (L2)
  - 效果：被攻击的敌人受到其他塔楼伤害+20%，持续3秒
  - 基础成本：95金币
  - 解锁波次：第7波

**3级进化分支**：
- **分支A：侦察塔**
  - 自动显示隐形敌人，超远射程
  - 射程+80%，可侦测隐形敌人
  - 进化成本：140金币

- **分支B：防空塔**
  - 对空中单位有奇效
  - 对空中敌人伤害+150%
  - 进化成本：140金币

## 4. 环形菜单交互设计

### 4.1 菜单布局

```
        [升级选项1]
             ↑
[升级选项3] ← [塔楼] → [升级选项2]
             ↓
      [进化分支选择]
      (仅3级时显示)
```

### 4.2 交互流程

1. 玩家点击塔楼
2. 显示环形菜单，围绕塔楼展示3-4个可购买升级
3. 可购买的升级显示为高亮状态
4. 已购买的升级显示为灰色（不可重复购买）
5. 塔楼达到3级时，底部显示进化分支选项
6. 点击升级选项，弹出确认对话框（显示价格和效果）
7. 确认购买后，播放升级动画，更新塔楼属性

### 4.3 信息展示

每个升级选项显示：
- 图标（emoji）
- 名称
- 动态价格
- 效果简述（鼠标悬停或长按显示详情）

## 5. 动态定价系统

### 5.1 价格计算公式

```
最终价格 = 基础价格 × 波次系数 × 难度系数 × 塔楼等级系数
```

### 5.2 系数定义

#### 波次系数
```typescript
波次系数 = max(1.0, min(1.0 + (当前波次 - 解锁波次) × 0.05, 1.5))
```

- 边界处理：波次系数最低为1.0（避免提前购买导致成本异常）
- 上限处理：波次系数最高为1.5（避免高波次价格过高）

示例：
- 第5波购买解锁波次为5的升级：系数 = 1.0
- 第10波购买同一升级：系数 = 1.25
- 第20波购买：系数 = 1.5（上限）

#### 难度系数
```typescript
难度系数 = max(0.5, min(1.0 + (敌人总生命值 / max(基准生命值, 1) - 1.0) × 0.5, 2.0))
```

- 边界处理：难度系数最低为0.5，最高为2.0
- 除零保护：`max(基准生命值, 1)` 防止除零

基准生命值：第5波敌人的总生命值

示例：
- 敌人总生命值与基准相同：系数 = 1.0
- 敌人总生命值比基准高50%：系数 = 1.25
- 敌人总生命值比基准低20%：系数 = 0.9

#### 塔楼等级系数
```typescript
塔楼等级系数：
- 1级塔楼：1.0
- 2级塔楼：1.3
- 3级塔楼：1.6
```

### 5.3 定价示例

**场景1**：第5波，塔楼1级，敌人总血量中等
- 穿透子弹（基础80金币）
- 价格 = 80 × 1.0 × 1.0 × 1.0 = **80金币**

**场景2**：第10波，塔楼2级，敌人总血量高（+50%）
- 穿透子弹（基础80金币）
- 价格 = 80 × 1.25 × 1.25 × 1.3 = **162.5金币**（取整163金币）

**场景3**：第15波，塔楼3级，敌人总血量很高（+100%）
- 穿透子弹（基础80金币）
- 价格 = 80 × 1.5 × 1.5 × 1.6 = **288金币**

## 6. 数据结构设计

### 6.1 升级配置文件

新增文件：`src/config/towerUpgrades.ts`

```typescript
export type UpgradeType = 'ability' | 'evolution';

export interface UpgradeEffect {
  damageMultiplier?: number;
  rangeMultiplier?: number;
  fireRateMultiplier?: number;
  specialAbility?: SpecialAbility;
  specialEffect?: string;
}

export interface SpecialAbility {
  type: 'pierce' | 'stun' | 'slow_aura' | 'burn' | 'chain' | 'mark' | 'freeze';
  value?: number;
  duration?: number;
  targets?: number;
}

export interface TowerUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: UpgradeType;
  baseCost: number;
  maxLevel?: number;
  effect: UpgradeEffect;
  requiredTowerLevel?: number;
  unlocksAtWave: number;
  evolutionTarget?: string; // 进化后的塔楼类型
}

export interface TowerUpgradeConfig {
  [towerKey: string]: {
    abilities: TowerUpgrade[];
    evolutions: TowerUpgrade[];
  };
}
```

### 6.2 塔楼状态扩展

更新 `Tower.ts`：

```typescript
export class Tower {
  private upgrades: Set<string> = new Set(); // 已购买的升级ID
  private evolution: string | null = null; // 进化后的类型

  public hasUpgrade(upgradeId: string): boolean {
    return this.upgrades.has(upgradeId);
  }

  public purchaseUpgrade(upgrade: TowerUpgrade): void {
    this.upgrades.add(upgrade.id);
    this.applyUpgradeEffect(upgrade.effect);
  }

  private applyUpgradeEffect(effect: UpgradeEffect): void {
    // 遵守不可变性原则，创建新的配置对象
    const newConfig: TowerConfig = {
      ...this.config,
      damage: effect.damageMultiplier
        ? Math.floor(this.config.damage * effect.damageMultiplier)
        : this.config.damage,
      range: effect.rangeMultiplier
        ? Math.floor(this.config.range * effect.rangeMultiplier)
        : this.config.range,
      fireRate: effect.fireRateMultiplier
        ? Math.floor(this.config.fireRate * effect.fireRateMultiplier)
        : this.config.fireRate,
    };
    this.config = newConfig;
    // 处理特殊能力...
  }
}
```

## 7. 系统组件设计

### 7.1 UpgradeManager

新增文件：`src/systems/UpgradeManager.ts`

```typescript
export class UpgradeManager {
  private scene: Phaser.Scene;
  private upgradeConfigs: TowerUpgradeConfig;
  private baseDifficultyHealth: number; // 基准敌人总生命值（第5波）

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.upgradeConfigs = TOWER_UPGRADES;
    this.baseDifficultyHealth = 1000; // 根据游戏实际数据设置
  }

  public getAvailableUpgrades(tower: Tower, currentWave: number): TowerUpgrade[] {
    // 返回可购买的升级列表
    // 过滤已购买的升级
    // 过滤未解锁波次的升级
    // 过滤等级不足的升级
  }

  public calculateUpgradeCost(upgrade: TowerUpgrade, tower: Tower, currentWave: number, totalEnemyHealth: number): number {
    // 获取塔楼当前等级
    const towerLevel = tower.getLevel();

    // 计算波次系数
    const waveBonus = Math.max(0, currentWave - upgrade.unlocksAtWave) * 0.05;
    const waveMultiplier = Math.max(1.0, Math.min(1.0 + waveBonus, 1.5));

    // 计算难度系数
    const safeBaseHealth = Math.max(this.baseDifficultyHealth, 1);
    const difficultyBonus = (totalEnemyHealth / safeBaseHealth - 1.0) * 0.5;
    const difficultyMultiplier = Math.max(0.5, Math.min(1.0 + difficultyBonus, 2.0));

    // 获取塔楼等级系数
    const levelMultipliers = { 1: 1.0, 2: 1.3, 3: 1.6 };
    const levelMultiplier = levelMultipliers[towerLevel] || 1.0;

    // 计算最终价格
    const finalCost = Math.floor(upgrade.baseCost * waveMultiplier * difficultyMultiplier * levelMultiplier);

    return finalCost;
  }

  public purchaseUpgrade(tower: Tower, upgradeId: string, currentMoney: number, cost: number): boolean {
    // 检查金币是否足够
    if (currentMoney < cost) return false;

    // 获取升级配置
    const upgrade = this.getUpgradeById(upgradeId);
    if (!upgrade) return false;

    // 应用到塔楼
    tower.purchaseUpgrade(upgrade);

    return true;
  }

  private getUpgradeById(upgradeId: string): TowerUpgrade | null {
    // 从配置中查找升级
    return null;
  }
}
```

### 7.2 TowerManager 集成

更新 `src/systems/TowerManager.ts`：

```typescript
export class TowerManager {
  // 现有属性...
  private upgradeManager: UpgradeManager;

  constructor(scene: Phaser.Scene, onTowerRemoved?: (tower: Tower) => void) {
    // 现有初始化...
    this.upgradeManager = new UpgradeManager(scene);
  }

  public getUpgradeManager(): UpgradeManager {
    return this.upgradeManager;
  }

  // 在升级塔楼时，需要同步更新 TowerManager 中的引用
  public upgradeTower(tower: Tower, upgrade: TowerUpgrade): boolean {
    // 检查金币
    const gameScene = this.scene as any;
    if (gameScene.economySystem.getMoney() < upgrade.baseCost) return false;

    // 执行升级
    const success = this.upgradeManager.purchaseUpgrade(
      tower,
      upgrade.id,
      gameScene.economySystem.getMoney(),
      upgrade.baseCost
    );

    if (success) {
      // 扣除金币
      gameScene.economySystem.spendMoney(upgrade.baseCost);
      // 播放升级动画
      // ...
    }

    return success;
  }
}
```

### 7.3 TowerUpgradeMenu

新增文件：`src/ui/TowerUpgradeMenu.ts`

```typescript
export class TowerUpgradeMenu extends Phaser.GameObjects.Container {
  private tower: Tower;
  private upgradeOptions: Phaser.GameObjects.Container[] = [];

  constructor(scene: Phaser.Scene, tower: Tower, upgrades: TowerUpgrade[]) {
    // 创建环形菜单
  }

  private createUpgradeOption(upgrade: TowerUpgrade, index: number, total: number): Phaser.GameObjects.Container {
    // 创建单个升级选项UI
  }

  private positionOptions(): void {
    // 计算环形位置布局
  }

  public destroy(): void {
    // 清理菜单
  }
}
```

### 7.4 GameScene 集成

更新 `GameScene.ts`：

```typescript
export class GameScene extends Phaser.Scene {
  private upgradeManager: UpgradeManager;
  private upgradeMenu: TowerUpgradeMenu | null = null;

  // 显示升级菜单（点击塔楼时调用）
  private showTowerUpgradeMenu(tower: Tower): void {
    // 先隐藏现有的回收菜单
    this.hideTowerRecycleMenu();
    // 创建升级菜单
    const upgrades = this.upgradeManager.getAvailableUpgrades(tower, this.currentWave);
    this.upgradeMenu = new TowerUpgradeMenu(this, tower, upgrades);
  }

  private hideUpgradeMenu(): void {
    if (this.upgradeMenu) {
      this.upgradeMenu.destroy();
      this.upgradeMenu = null;
    }
  }

  // 显示回收菜单（长按塔楼时调用，保持现有逻辑）
  private showTowerRecycleMenu(tower: Tower): void {
    // 如果升级菜单已打开，先隐藏
    this.hideUpgradeMenu();
    // 显示回收菜单（继承现有实现）
    // ...
  }

  private hideTowerRecycleMenu(): void {
    // 继承现有实现
  }
}
```

## 8. 视觉反馈设计

### 8.1 升级动画

购买升级时播放：
1. 塔楼放大缩小动画（scale: 1.2 → 1.0）
2. 发射粒子效果（金色光芒）
3. 升级图标飞入塔楼动画

### 8.2 塔楼标记

已购买升级的塔楼显示：
- 底部光环（渐变色）
- 等级数字显示为金色（原有升级）
- 特殊图标显示已解锁能力

### 8.3 信息面板

鼠标悬停或长按塔楼时显示：
- 塔楼基础属性
- 已购买升级列表（图标+名称）
- 当前攻击力计算结果

## 9. 移动端适配

### 9.1 触摸交互

- 点击塔楼：显示升级菜单
- 点击空白处或返回按钮：关闭菜单
- 最小点击区域：48x48px（符合移动端设计规范）

### 9.2 长按交互

- 复用现有长按逻辑（500ms）
- **交互逻辑**：
  - 点击塔楼：显示升级菜单
  - 长按塔楼（500ms）：显示回收菜单（保持现有逻辑）
  - 升级菜单内置"回收塔楼"选项，玩家也可在升级菜单中选择回收
- **冲突解决**：升级菜单优先于回收菜单，玩家可以在升级菜单中找到回收选项

### 9.3 UI缩放

- 环形菜单半径根据屏幕尺寸调整
- 手机端：半径80px，选项大小48x48px
- 平板/桌面端：半径100px，选项大小64x64px

## 10. 测试策略

### 10.1 单元测试

- 价格计算函数测试（各种场景）
- 升级效果叠加测试
- 进化分支切换测试

### 10.2 集成测试

- 升级购买流程测试
- UI交互测试（点击、悬停）
- 移动端触摸测试

### 10.3 平衡性测试

- 各塔楼升级性价比分析
- 游戏难度曲线验证
- 经济系统压力测试

## 11. 实施计划

详见后续的 `writing-plans` 技能输出。

## 12. 未来扩展

### 12.1 后续版本功能

- 升级成就系统（收集所有升级）
- 升级预览功能（购买前预览效果）
- 升级重置功能（退还部分金币）
- 升级组合效果（同时拥有多个升级时触发特殊效果）

### 12.2 数据分析

- 统计各升级的购买率
- 分析升级对游戏通关率的影响
- 收集玩家反馈，调整升级效果和价格

---

**审核状态**: 待用户审核
**下一步**: 用户审核规范文档，通过后进入 `writing-plans` 阶段
