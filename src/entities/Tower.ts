import Phaser from 'phaser';
import { TowerConfig } from '../config/towers';
import { Enemy } from './Enemy';

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

  constructor(scene: Phaser.Scene, x: number, y: number, config: TowerConfig) {
    super(scene, x, y);
    this.config = config;
    this.originalCost = config.cost;

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

  private setupInteraction(): void {
    if (!this.base) return;

    // 鼠标悬停效果
    this.base.on('pointerover', () => {
      this.showRange(true);
    });

    this.base.on('pointerout', () => {
      this.showRange(false);
    });

    // 右键点击（回收）
    this.base.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 2) { // 右键
        this.onRightClick();
      }
    });
  }

  private onRightClick(): void {
    // Show selection effect
    this.showSelected(true);

    // Call GameScene's showTowerRecycleMenu method directly
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

  public destroy(fromScene?: boolean): void {
    if (this.rangeCircle) {
      this.rangeCircle.destroy();
    }
    super.destroy(fromScene);
  }
}
