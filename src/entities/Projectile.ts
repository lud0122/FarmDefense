import Phaser from 'phaser';
import { Enemy } from './Enemy';

export class Projectile extends Phaser.GameObjects.Circle {
  private target: Enemy | null;
  private speed: number;
  private damage: number;
  private isActive: boolean = true;
  private trail: Phaser.GameObjects.Graphics[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Enemy,
    speed: number,
    damage: number,
    color: number = 0xFFFF00
  ) {
    super(scene, x, y, 4, color);

    this.target = target;
    this.speed = speed;
    this.damage = damage;
    this.isActive = true;

    scene.add.existing(this);

    // 添加拖尾效果
    this.createTrail();
  }

  private createTrail(): void {
    // 每帧创建一个小圆作为拖尾
  }

  public update(time: number, delta: number): void {
    if (!this.isActive || !this.target) {
      this.destroy();
      return;
    }

    // 检查目标是否还存在
    if (!this.target.active) {
      this.destroy();
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10) {
      // 命中目标
      this.target.takeDamage(this.damage);

      // 击中效果
      this.createHitEffect();

      this.destroy();
    } else {
      // 继续追踪目标
      const moveX = (dx / distance) * this.speed * (delta / 1000);
      const moveY = (dy / distance) * this.speed * (delta / 1000);
      this.x += moveX;
      this.y += moveY;
    }
  }

  private createHitEffect(): void {
    // 创建击中特效
    const hitEffect = this.scene.add.circle(this.x, this.y, 8, 0xffff00);
    hitEffect.setAlpha(0.8);

    this.scene.tweens.add({
      targets: hitEffect,
      scale: 2,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        hitEffect.destroy();
      }
    });
  }

  public destroy(fromScene?: boolean): void {
    this.isActive = false;
    this.target = null;
    super.destroy(fromScene);
  }
}
