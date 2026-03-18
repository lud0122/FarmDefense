import Phaser from 'phaser';
import { TowerConfig } from '../config/towers';
import { Enemy } from './Enemy';
import { TowerUpgrade, UpgradeEffect, SpecialAbility } from '../config/towerUpgrades';
import { ParticleFactory } from '../utils/ParticleFactory.js';

// Tower emojis mapping
const TOWER_EMOJIS: Record<string, string> = {
  pistol: '🔫',
  machinegun: '🔫',
  grenade: '💣',
  ice: '❄️',
  electric: '⚡',
  sentinel: '👁️'
};

export class Tower extends Phaser.GameObjects.Container {
  public config: TowerConfig;
  public lastFireTime: number = 0;
  public originalCost: number;
  private rangeCircle: Phaser.GameObjects.Graphics | null = null;
  private base: Phaser.GameObjects.Rectangle;
  private barrel: Phaser.GameObjects.Rectangle;
  private level: number = 1;
  private selectionIndicator: Phaser.GameObjects.Rectangle | null = null;
  private emojiIcon: Phaser.GameObjects.Text | null = null;
  private maxHealth: number;
  private currentHealth: number;
  private destroyed: boolean = false;
  private onDestroyed: ((tower: Tower) => void) | null = null;
  private healthBar: Phaser.GameObjects.Rectangle | null = null;
  private healthBarBg: Phaser.GameObjects.Rectangle | null = null;
  // 升级系统
  private upgrades: Set<string> = new Set(); // 已购买的升级ID
  private evolution: string | null = null; // 进化后的类型
  private specialAbilities: SpecialAbility[] = []; // 已解锁的特殊能力

  constructor(scene: Phaser.Scene, x: number, y: number, config: TowerConfig) {
    super(scene, x, y);
    this.config = config;
    this.originalCost = config.cost;
    this.maxHealth = Math.max(120, config.cost);
    this.currentHealth = this.maxHealth;

    // 塔楼基座
    this.base = scene.add.rectangle(0, 0, 32, 32, config.color);
    this.add(this.base);

    // 炮管
    this.barrel = scene.add.rectangle(0, -12, 10, 20, 0x000000);
    this.add(this.barrel);

    // 使用emoji代替矩形
    const emoji = TOWER_EMOJIS[config.key] || '🔫';
    this.emojiIcon = scene.add.text(0, -5, emoji, {
      fontSize: '24px'
    }).setOrigin(0.5);
    this.add(this.emojiIcon);

  // 血条背景
  this.healthBarBg = scene.add.rectangle(0, -25, 40, 6, 0x000000);
  this.healthBarBg.setOrigin(0.5);
  this.healthBarBg.setVisible(false);
  this.add(this.healthBarBg);

  // 血条
  this.healthBar = scene.add.rectangle(-20, -25, 40, 6, 0x00FF00);
  this.healthBar.setOrigin(0, 0.5);
  this.healthBar.setVisible(false);
  this.add(this.healthBar);

    // 选中高亮效果（默认隐藏）
    this.selectionIndicator = scene.add.rectangle(0, 0, 40, 40, 0xFFFF00, 0.3);
    this.selectionIndicator.setStrokeStyle(2, 0xFFD700);
    this.selectionIndicator.setVisible(false);
    this.add(this.selectionIndicator);

    // 设置交互
    this.base.setInteractive();
    this.setupInteraction();

    scene.add.existing(this);
  }

  private longPressTimer: Phaser.Time.TimerEvent | null = null;
  private isLongPress: boolean = false;
  private readonly LONG_PRESS_DURATION: number = 500; // 长按 500ms

  private setupInteraction(): void {
    if (!this.base) return;

    // 鼠标悬停效果（桌面端）
    this.base.on('pointerover', () => {
      this.showRange(true);
    });

    this.base.on('pointerout', () => {
      this.showRange(false);
      // 取消长按
      this.cancelLongPress();
    });

    // 指针按下（支持桌面和移动端）
    this.base.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 2) { // 右键（桌面端）
        this.onRightClick();
      } else if (pointer.button === 0) { // 左键（桌面端）
        this.onLeftClick();
      } else {
        // 移动端 touch，开始计时
        this.startLongPress();
      }
    });

    // 指针抬起（取消长按计时）
    this.base.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      // 如果是拖拽事件，不触发点击
      const pointerDelta = Phaser.Math.Distance.Between(pointer.downX, pointer.downY, pointer.x, pointer.y);
      if (pointerDelta > 5) {
        this.cancelLongPress();
        return;
      }

      // 如果不是长按，且未触发长按，显示选中
      if (!this.isLongPress && this.longPressTimer) {
        this.onLeftClick();
      }

      this.cancelLongPress();
    });

    // 指针离开后取消长按
    this.base.on('pointerupoutside', () => {
      this.cancelLongPress();
    });
  }

  public setOnDestroyed(handler: (tower: Tower) => void): void {
    this.onDestroyed = handler;
  }

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

  public isDestroyed(): boolean {
    return this.destroyed;
  }

  public getCurrentHealth(): number {
    return this.currentHealth;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

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

  /**
   * 计算修复到满血所需价格
   * 公式: originalCost × 0.5 × (缺失血量 / 最大血量)
   */
  public getRepairCost(): number {
    const missingHealth = this.maxHealth - this.currentHealth;
    const repairRatio = missingHealth / this.maxHealth;
    return Math.floor(this.originalCost * 0.5 * repairRatio);
  }

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

  /**
   * 开始长按计时
   */
  private startLongPress(): void {
    this.isLongPress = false;

    // 显示按下视觉反馈
    if (this.base) {
      this.base.setScale(0.95);
    }

    // 启动长按计时器
    this.longPressTimer = this.scene.time.delayedCall(this.LONG_PRESS_DURATION, () => {
      this.isLongPress = true;
      this.onRightClick(); // 触发回收菜单
    });
  }

  /**
   * 取消长按计时
   */
  private cancelLongPress(): void {
    if (this.longPressTimer) {
      this.longPressTimer.remove();
      this.longPressTimer = null;
    }

    // 恢复视觉反馈
    if (this.base) {
      this.base.setScale(1);
    }
  }

  private onRightClick(): void {
    // Show selection effect
    this.showSelected(true);

    // 触觉反馈（如果支持）
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Call GameScene's showTowerRecycleMenu method directly
    const gameScene = this.scene as any;
    if (gameScene.showTowerRecycleMenu) {
      gameScene.showTowerRecycleMenu(this);
    }
  }

  private onLeftClick(): void {
    // 点击已存在的塔楼时，应该选中它并显示回收菜单
    const gameScene = this.scene as any;
    if (gameScene.showTowerRecycleMenu) {
      gameScene.showTowerRecycleMenu(this);
    }
  }

  public showSelected(selected: boolean): void {
    if (this.selectionIndicator) {
      this.selectionIndicator.setVisible(selected);
    }
  }

  public getRecycleValue(): number {
    return Math.floor(this.originalCost * 0.5);
  }

  public update(time: number, _delta: number, enemies: Enemy[]): Phaser.GameObjects.GameObject | null {
    if (this.destroyed) return null;
    if (time < this.lastFireTime + this.config.fireRate) return null;

    const target = this.findTarget(enemies);
    if (target) {
      // 旋转炮管指向目标
      const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
      this.barrel.setRotation(angle - Math.PI / 2);

      this.lastFireTime = time;
      return this.fire(target);
    }

    return null;
  }

  protected findTarget(enemies: Enemy[]): Enemy | null {
    let closest: Enemy | null = null;
    let closestDistance = Infinity;

    for (const enemy of enemies) {
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y, enemy.x, enemy.y
      );
      if (distance <= this.config.range && distance < closestDistance) {
        closestDistance = distance;
        closest = enemy;
      }
    }

    return closest;
  }

  protected fire(_target: Enemy): Phaser.GameObjects.GameObject {
    // 子类实现，基类返回一个临时子弹
    const bullet = this.scene.add.circle(this.x, this.y, 4, 0xFFFF00);
    return bullet;
  }

  public showRange(show: boolean): void {
    if (show) {
      if (!this.rangeCircle) {
        this.rangeCircle = this.scene.add.graphics();
        this.rangeCircle.lineStyle(2, 0x00ff00, 0.5);
        this.rangeCircle.strokeCircle(this.x, this.y, this.config.range);
      } else {
        this.rangeCircle.visible = true;
      }
    } else {
      if (this.rangeCircle) {
        this.rangeCircle.visible = false;
      }
    }
  }

  public upgrade(): void {
    if (this.level >= 3) return;

    this.level++;
    this.config.damage = Math.floor(this.config.damage * 1.2);
    this.config.range = Math.floor(this.config.range * 1.15);
    this.config.fireRate = Math.floor(this.config.fireRate * 0.9);

    // 升级视觉效果
    this.scene.tweens.add({
      targets: this.base,
      scale: 1.2,
      duration: 200,
      yoyo: true
    });
  }

  public getLevel(): number {
    return this.level;
  }

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

    // 如果是进化,记录进化目标
    if (upgrade.type === 'evolution' && upgrade.evolutionTarget) {
      this.evolution = upgrade.evolutionTarget;
    }

    // 播放升级特效
    this.playUpgradeEffect();
  }

  /**
   * 应用升级效果(不可变)
   */
  private applyUpgradeEffect(effect: UpgradeEffect): void {
    // 创建新的配置对象,遵循不可变性原则
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

    // 发光效果
    if (this.base) {
      this.scene.tweens.add({
        targets: this.base,
        fillColor: 0xFFD700,
        duration: 200,
        yoyo: true,
      });
    }
  }

  public destroy(fromScene?: boolean): void {
    this.destroyed = true;
    if (this.rangeCircle) {
      this.rangeCircle.destroy();
    }
    super.destroy(fromScene);
  }
}
