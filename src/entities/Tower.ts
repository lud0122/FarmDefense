import Phaser from 'phaser';
import { TowerConfig } from '../config/towers';
import { Enemy } from './Enemy';

export class Tower extends Phaser.GameObjects.Container {
  public config: TowerConfig;
  public lastFireTime: number = 0;
  private rangeCircle: Phaser.GameObjects.Graphics | null = null;
  private base: Phaser.GameObjects.Rectangle;
  private barrel: Phaser.GameObjects.Rectangle;
  private level: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, config: TowerConfig) {
    super(scene, x, y);
    this.config = config;

    // 塔楼基座
    this.base = scene.add.rectangle(0, 0, 32, 32, config.color);
    this.add(this.base);

    // 炮管
    this.barrel = scene.add.rectangle(0, -12, 10, 20, 0x000000);
    this.add(this.barrel);

    scene.add.existing(this);
  }

  public update(time: number, delta: number, enemies: Enemy[]): Phaser.GameObjects.GameObject | null {
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

  protected fire(target: Enemy): Phaser.GameObjects.GameObject {
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
