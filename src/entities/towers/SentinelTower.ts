import Phaser from 'phaser';
import { Tower } from '../Tower';
import { Enemy } from '../Enemy';
import { TowerConfig } from '../../config/towers';

export class SentinelProjectile extends Phaser.GameObjects.Arc {
  private target: Enemy | null;
  private projectileSpeed: number = 600;
  private projectileDamage: number;
  private projectileActive: boolean = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Enemy,
    damage: number
  ) {
    super(scene, x, y, 4, 0, 360, false, 0x9370DB);
    this.target = target;
    this.projectileDamage = damage;

    scene.add.existing(this);

    // Create lock-on effect
    this.createLockOnEffect(target);
  }

  private createLockOnEffect(target: Enemy): void {
    // Laser lock-on line
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(2, 0x9370DB, 0.5);
    graphics.moveTo(this.x, this.y);
    graphics.lineTo(target.x, target.y);
    graphics.strokePath();

    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 100,
      onComplete: () => graphics.destroy()
    });
  }

  update(_time: number, delta: number): void {
    if (!this.projectileActive || !this.target || !this.target.active) {
      this.destroy();
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Auto-targeting, bullet chases target
    if (distance < 10) {
      this.target.takeDamage(this.projectileDamage);
      this.createHitEffect();
      this.destroy();
    } else {
      this.x += (dx / distance) * this.projectileSpeed * (delta / 1000);
      this.y += (dy / distance) * this.projectileSpeed * (delta / 1000);
    }
  }

  private createHitEffect(): void {
    // Purple hit effect
    const hit = this.scene.add.circle(this.x, this.y, 10, 0x9370DB, 0.6);
    this.scene.tweens.add({
      targets: hit,
      scale: 0,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => hit.destroy()
    });
  }

  destroy(fromScene?: boolean): void {
    this.projectileActive = false;
    this.target = null;
    super.destroy(fromScene);
  }
}

export class SentinelTower extends Tower {
  constructor(scene: Phaser.Scene, x: number, y: number, config: TowerConfig) {
    super(scene, x, y, config);
  }

  findTarget(enemies: Enemy[]): Enemy | null {
    // Sentinel tower prioritizes enemies at maximum range
    let farthest: Enemy | null = null;
    let farthestDistance = 0;

    for (const enemy of enemies) {
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y, enemy.x, enemy.y
      );
      if (distance <= this.config.range && distance > farthestDistance) {
        farthestDistance = distance;
        farthest = enemy;
      }
    }

    return farthest;
  }

  fire(target: Enemy): Phaser.GameObjects.GameObject {
    const projectile = new SentinelProjectile(
      this.scene,
      this.x,
      this.y - 16,
      target,
      this.config.damage
    );
    return projectile;
  }
}
