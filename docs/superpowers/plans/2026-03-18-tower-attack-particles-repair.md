# 塔攻击粒子效果与修复功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为Farm Defender添加塔被动物攻击的粒子效果、自动血条显示和塔修复功能

**Architecture:** 使用ParticleFactory统一创建粒子效果，Tower类负责血条渲染和修复逻辑，GameScene负责菜单交互。粒子效果使用Phaser原生粒子系统，血条使用Graphics对象。

**Tech Stack:** TypeScript, Phaser 3.70, Vite

**设计规格:** 详见 `docs/superpowers/specs/2026-03-18-tower-attack-particles-repair-design.md`

---

## 文件结构

### 新增文件
- `src/utils/ParticleFactory.ts` - 粒子效果工厂类，提供静态方法创建攻击/受伤/修复粒子

### 修改文件
- `src/entities/Tower.ts` - 添加血条渲染、修复方法、受伤粒子触发
- `src/entities/behaviors/TowerBreakerBehavior.ts` - 添加攻击粒子发射
- `src/game/GameScene.ts` - 添加修复菜单选项和修复交互逻辑
- `src/config/constants.ts` - 添加修复相关常量配置

### 测试文件
- `src/test/tower-health-repair.test.ts` - Tower血条和修复功能单元测试

---

## 实现任务

### Task 1: 创建粒子工厂类

**Files:**
- Create: `src/utils/ParticleFactory.ts`
- Test: `src/test/particle-factory.test.ts`

- [ ] **Step 1: 创建 ParticleFactory 类框架**
```typescript
// src/utils/ParticleFactory.ts
export class ParticleFactory {
  /**
   * 创建攻击粒子 - 从敌人飞向塔
   */
  static createAttackParticles(
    scene: Phaser.Scene,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): void {
    // 实现：使用tween动画创建粒子
  }

  /**
   * 创建受伤粒子 - 在目标位置爆发
   */
  static createDamageParticles(
    scene: Phaser.Scene,
    x: number,
    y: number,
    count?: number
  ): void {
    // 实现：创建多个向上飞散的粒子
  }

  /**
   * 创建修复粒子 - 从底部向上飞散
   */
  static createRepairParticles(
    scene: Phaser.Scene,
    x: number,
    y: number
  ): void {
    // 实现：创建绿色/金色向上飞散的粒子
  }

  /**
   * 创建单个粒子对象
   */
  private static createParticle(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: number,
    size: number
  ): Phaser.GameObjects.Graphics {
    // 实现：创建圆形粒子
  }
}
```

- [ ] **Step 2: 实现 createParticle 方法**
```typescript
private static createParticle(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  size: number
): Phaser.GameObjects.Graphics {
  const particle = scene.add.graphics();
  particle.fillStyle(color, 1);
  particle.fillCircle(0, 0, size);
  particle.x = x;
  particle.y = y;
  return particle;
}
```

- [ ] **Step 3: 实现 createAttackParticles 方法**
```typescript
static createAttackParticles(
  scene: Phaser.Scene,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): void {
  const particleCount = 5;
  const duration = 300;

  for (let i = 0; i < particleCount; i++) {
    const particle = this.createParticle(scene, fromX, fromY, 0xFFAA00, 4);

    scene.tweens.add({
      targets: particle,
      x: toX,
      y: toY,
      duration: duration + Math.random() * 100,
      ease: 'Power2',
      onComplete: () => {
        particle.destroy();
      }
    });
  }
}
```

- [ ] **Step 4: 实现 createDamageParticles 方法**
```typescript
static createDamageParticles(
  scene: Phaser.Scene,
  x: number,
  y: number,
  count: number = 8
): void {
  for (let i = 0; i < count; i++) {
    const particle = this.createParticle(scene, x, y, 0x666666, 3);
    const angle = Phaser.Math.DegToRad(240 + Math.random() * 60);
    const speed = 50 + Math.random() * 100;
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;

    scene.tweens.add({
      targets: particle,
      x: particle.x + velocityX,
      y: particle.y + velocityY + 50,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        particle.destroy();
      }
    });
  }
}
```

- [ ] **Step 5: 实现 createRepairParticles 方法**
```typescript
static createRepairParticles(
  scene: Phaser.Scene,
  x: number,
  y: number
): void {
  const particleCount = 12;
  const colors = [0x00FF00, 0xFFD700, 0xADFF2F];

  for (let i = 0; i < particleCount; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const particle = this.createParticle(scene, x, y, color, 4);
    const offsetX = (Math.random() - 0.5) * 30;
    const targetY = y - 60 - Math.random() * 40;

    scene.tweens.add({
      targets: particle,
      x: x + offsetX,
      y: targetY,
      alpha: { from: 1, to: 0 },
      scale: { from: 1, to: 0.5 },
      duration: 800,
      ease: 'Sine.easeOut',
      onComplete: () => {
        particle.destroy();
      }
    });
  }
}
```

- [ ] **Step 6: 运行TypeScript检查**
```bash
npx tsc --noEmit
```
Expected: 无错误

- [ ] **Step 7: 提交**
```bash
git add src/utils/ParticleFactory.ts
git commit -m "feat: 添加 ParticleFactory 类用于创建攻击/受伤/修复粒子效果"
```

---

### Task 2: 为 Tower 类添加血条系统

**Files:**
- Modify: `src/entities/Tower.ts`
- Test: `src/test/tower-health-repair.test.ts`

- [ ] **Step 1: 在 Tower 类添加血条属性**
```typescript
// 在类声明部分添加
private healthBar: Phaser.GameObjects.Rectangle | null = null;
private healthBarBg: Phaser.GameObjects.Rectangle | null = null;
```

- [ ] **Step 2: 在构造函数中初始化血条**
```typescript
// 在 constructor 中 emoji 之后添加
// 血条背景
this.healthBarBg = scene.add.rectangle(0, -25, 40, 6, 0x000000);
this.healthBarBg.setOrigin(0.5);
this.healthBarBg.setVisible(false);
this.add(this.healthBarBg);

// 血条
this.healthBar = scene.add.rectangle(-20, -25, 40, 6, 0x00FF00);
this.healthBar.setOrigin(0, 0.5); // 左对齐以便缩放
this.healthBar.setVisible(false);
this.add(this.healthBar);
```

- [ ] **Step 3: 添加 updateHealthBar 方法**
```typescript
/**
 * 更新血条显示
 */
private updateHealthBar(): void {
  if (!this.healthBar || !this.healthBarBg) return;

  // 如果满血，隐藏血条
  if (this.currentHealth >= this.maxHealth) {
    this.healthBar.setVisible(false);
    this.healthBarBg.setVisible(false);
    return;
  }

  // 显示血条
  this.healthBar.setVisible(true);
  this.healthBarBg.setVisible(true);

  const percentage = this.currentHealth / this.maxHealth;
  const barWidth = 40 * percentage;

  // 更新血条宽度
  this.healthBar.setDisplaySize(barWidth, 6);

  // 根据血量设置颜色
  let color = 0x00FF00; // 绿色 (>50%)
  if (percentage <= 0.25) {
    color = 0xFF0000; // 红色 (<25%)
  } else if (percentage <= 0.5) {
    color = 0xFFFF00; // 黄色 (25%-50%)
  }
  this.healthBar.setFillStyle(color);
}
```

- [ ] **Step 4: 修改 takeDamage 方法触发受伤效果**
```typescript
// 在 takeDamage 方法开始处添加
import { ParticleFactory } from '../utils/ParticleFactory.js';

// 修改 takeDamage
public takeDamage(amount: number): void {
  if (this.destroyed) return;
  this.currentHealth = Math.max(0, this.currentHealth - amount);

  // 触发受伤粒子效果
  ParticleFactory.createDamageParticles(this.scene, this.x, this.y);

  // 更新血条
  this.updateHealthBar();

  if (this.currentHealth <= 0) {
    this.destroyed = true;
    this.showSelected(false);
    if (this.onDestroyed) {
      this.onDestroyed(this);
    }
  }
}
```

- [ ] **Step 5: 运衈TypeScript检查**
```bash
npx tsc --noEmit
```
Expected: 无错误（可能需要修复导入路径）

- [ ] **Step 6: 提交**
```bash
git add src/entities/Tower.ts src/utils/ParticleFactory.ts
git commit -m "feat: 为 Tower 添加血条系统和受伤粒子效果"
```

---

### Task 3: 为 Tower 添加修复功能

**Files:**
- Modify: `src/entities/Tower.ts`
- Test: `src/test/tower-health-repair.test.ts`

- [ ] **Step 1: 添加 repair 方法**
```typescript
/**
 * 修复塔，恢复指定血量
 * @param amount 恢复的血量，默认修复到满血
 */
public repair(amount?: number): void {
  if (this.destroyed) return;

  const maxHeal = this.maxHealth - this.currentHealth;
  const healAmount = amount ?? maxHeal;

  this.currentHealth = Math.min(
    this.maxHealth,
    this.currentHealth + healAmount
  );

  // 更新血条
  this.updateHealthBar();

  // 播放修复特效
  this.playRepairEffect();
}
```

- [ ] **Step 2: 添加 getRepairCost 方法**
```typescript
/**
 * 计算修复到满血所需价格
 * 公式: originalCost × 0.5 × (缺失血量 / 最大血量)
 */
public getRepairCost(): number {
  const missingHealth = this.maxHealth - this.currentHealth;
  const repairRatio = missingHealth / this.maxHealth;
  return Math.floor(this.originalCost * 0.5 * repairRatio);
}
```

- [ ] **Step 3: 添加 getCurrentHealth 方法**
```typescript
/**
 * 获取当前血量
 */
public getCurrentHealth(): number {
  return this.currentHealth;
}
```

- [ ] **Step 4: 添加 getMaxHealth 方法**
```typescript
/**
 * 获取最大血量
 */
public getMaxHealth(): number {
  return this.maxHealth;
}
```

- [ ] **Step 5: 添加 playRepairEffect 方法**
```typescript
/**
 * 播放修复特效
 */
private playRepairEffect(): void {
  // 发光效果
  if (this.base) {
    this.scene.tweens.add({
      targets: this.base,
      fillColor: { from: this.config.color, to: 0x00FF00 },
      duration: 300,
      yoyo: true
    });
  }

  // 粒子效果
  ParticleFactory.createRepairParticles(this.scene, this.x, this.y);
}
```

- [ ] **Step 6: 运衈TypeScript检查**
```bash
npx tsc --noEmit
```
Expected: 无错误

- [ ] **Step 7: 提交**
```bash
git add src/entities/Tower.ts
git commit -m "feat: 为 Tower 添加修复功能和价格计算"
```

---

### Task 4: 在 TowerBreakerBehavior 中添加攻击粒子效果

**Files:**
- Modify: `src/entities/behaviors/TowerBreakerBehavior.ts`

- [ ] **Step 1: 添加 ParticleFactory 导入**
```typescript
import { ParticleFactory } from '../../utils/ParticleFactory.js';
```

- [ ] **Step 2: 修改 update 方法添加攻击粒子**
```typescript
// 在 actual attack code 接近尾部分
if (time - this.lastAttackTime >= this.attackCooldownMs) {
  this.lastAttackTime = time;

  // 发射攻击粒子
  if (this.targetTower) {
    // 使用 enemy 的位置作为攻击起点
    // 由于无法直接访问enemy的x,y，需要通过context或修改接口
    // 暂时使用目标塔位置作为粒子起点（坐标偏移）
    const startX = this.targetTower.x + (Math.random() - 0.5) * 40;
    const startY = this.targetTower.y + 50; // 偰装粒子从下方飞来

    ParticleFactory.createAttackParticles(
      enemy.scene,
      startX,
      startY,
      this.targetTower.x,
      this.targetTower.y
    );
  }

  this.targetTower.takeDamage(this.attackDamage);
}
```

**注意：** 由于 `TowerBreakerBehavior` 无法直接访问 `enemy.x, enemy.y`，需要修改：

- [ ] **Step 3: 修改攻击粒子逻辑**
```typescript
// 在攻击时获取 enemy 的位置
const distance = getDistance(enemy.x, enemy.y, this.targetTower.x, this.targetTower.y);
if (distance > this.attackRangePx) {
  enemy.moveToPoint(this.targetTower.x, this.targetTower.y, delta);
  return;
}

// 在攻击范围内
if (time - this.lastAttackTime < this.attackCooldownMs) {
  return;
}

this.lastAttackTime = time;

// 发射攻击粒子 - 使用 enemy 的位置作为起点
ParticleFactory.createAttackParticles(
  context.scene,
  enemy.x,
  enemy.y,
  this.targetTower.x,
  this.targetTower.y
);

this.targetTower.takeDamage(this.attackDamage);
```

**注意:** 如果 `context` 不包含 `scene`，需要改用其他方式获取 scene。

- [ ] **Step 4: 运衈TypeScript检查**
```bash
npx tsc --noEmit
```
Expected: 无错误（可能需要调整参数传递方式）

- [ ] **Step 5: 提交**
```bash
git add src/entities/behaviors/TowerBreakerBehavior.ts
git commit -m "feat: 在 TowerBreakerBehavior 中添加攻击粒子效果"
```

---

### Task 5: 在 GameScene 中添加修复菜单

**Files:**
- Modify: `src/game/GameScene.ts`

- [ ] **Step 1: 找到 showTowerRecycleMenu 方法**
```bash
grep -n "showTowerRecycleMenu" src/game/GameScene.ts
```

- [ ] **Step 2: 在菜单中添加修复选项**
```typescript
// 在 showTowerRecycleMenu 方法中，在添加选项时检查塔是否需要修复
const maxHealth = tower.getMaxHealth();
const currentHealth = tower.getCurrentHealth();
const needsRepair = currentHealth < maxHealth;

// 如果需要修复，添加修复选项
if (needsRepair) {
  const repairCost = tower.getRepairCost();
  const missingHealth = maxHealth - currentHealth;

  const repairButton = this.add.text(0, -30, `修复 (+${missingHealth}HP)`, {
    fontSize: '18px',
    color: '#00FF00',
    backgroundColor: '#000000',
    padding: { x: 15, y: 8 }
  }).setOrigin(0.5).setInteractive();

  const repairCostText = this.add.text(0, -5, `花费: ${repairCost} 金币`, {
    fontSize: '14px',
    color: '#FFD700'
  }).setOrigin(0.5);

  // 修复按钮点击处理
  repairButton.on('pointerdown', () => {
    const currentMoney = this.economySystem.getMoney();
    if (currentMoney < repairCost) {
      // 显示"金币不足"提示
      this.showRepairErrorMenu(tower, "金币不足！");
      return;
    }

    // 执行修复
    this.economySystem.spendMoney(repairCost);
    tower.repair();

    // 关闭菜单
    this.hideTowerRecycleMenu();

    // 显示修复成功提示
    this.showRepairSuccessMessage();
  });

  repairButtons.push(repairButton, repairCostText);
}
```

- [ ] **Step 3: 添加修复错误提示方法**
```typescript
/**
 * 显示修复错误提示
 */
private showRepairErrorMenu(tower: Tower, message: string): void {
  // 在菜单位置显示错误提示
  const errorText = this.add.text(tower.x, tower.y - 60, message, {
    fontSize: '16px',
    color: '#FF0000',
    backgroundColor: '#000000'
  }).setOrigin(0.5);

  this.tweens.add({
    targets: errorText,
    y: errorText.y - 30,
    alpha: 0,
    duration: 1500,
    onComplete: () => {
      errorText.destroy();
    }
  });
}
```

- [ ] **Step 4: 添加修复成功提示方法**
```typescript
/**
 * 显示修复成功提示
 */
private showRepairSuccessMessage(): void {
  const successText = this.add.text(
    this.cameras.main.centerX,
    this.cameras.main.centerY - 50,
    "塔楼已修复！",
    {
      fontSize: '20px',
      color: '#00FF00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }
  ).setOrigin(0.5);

  this.tweens.add({
    targets: successText,
    y: successText.y - 50,
    alpha: 0,
    duration: 2000,
    onComplete: () => {
      successText.destroy();
    }
  });
}
```

- [ ] **Step 5: 运衈TypeScript检查**
```bash
npx tsc --noEmit
```
Expected: 无错误

- [ ] **Step 6: 提交**
```bash
git add src/game/GameScene.ts
git commit -m "feat: 在塔菜单中添加修复功能"
```

---

### Task 6: 联合测试和验证

**Files:**
- Run all tests
- Manual test in browser

- [ ] **Step 1: 运衈单元测试**
```bash
npm test
```
Expected: 所有测试通过

- [ ] **Step 2: 运衈TypeScript检查**
```bash
npx tsc --noEmit
```
Expected: 无错误

- [ ] **Step 3: 启动开发服务**
```bash
npm run dev
```

- [ ] **Step 4: 手动测试**
打开 http://localhost:5173 进行以下测试：
- [ ] 进入游戏（Level 6+）
- [ ] 确认动物攻击塔时有攻击粒子效果
- [ ] 确认塔受伤时显示血条
- [ ] 确认塔满血时血条隐藏
- [ ] 确认点击塔时显示修复选项（塔有损伤时）
- [ ] 确认修复按钮展示正确的价格
- [ ] 确认点击修复后金币正确扣除
- [ ] 确认修复后塔血量恢复
- [ ] 确认修复时播放修复粒子效果
- [ ] 确认金币不足时显示错误提示

- [ ] **Step 5: 构建生产版本**
```bash
npm run build
```
Expected: 构建成功

- [ ] **Step 6: 最终提交**
```bash
git status
git add -A
git commit -m "feat: 完成塔攻击粒子效果与修复功能"
```

---

## API参考

### ParticleFactory
```typescript
class ParticleFactory {
  static createAttackParticles(scene, fromX, fromY, toX, toY): void
  static createDamageParticles(scene, x, y, count?): void
  static createRepairParticles(scene, x, y): void
}
```

### Tower 新增方法
```typescript
class Tower {
  getCurrentHealth(): number
  getMaxHealth(): number
  getRepairCost(): number  // 计算修复价格
  repair(amount?: number): void  // 修复塔
}
```

---

## 备注

- 所有导入必须使用 `.js` 扩展名
- 修复成本比例设为 0.5（可修改）
- 血条只在不满血时显示
- 粒子效果使用Phasertween实现
