import Phaser from 'phaser';
import { Tower } from '../Tower';
import { Enemy } from '../Enemy';
import { TowerConfig } from '../../config/towers';

export class GrenadeProjectile extends Phaser.GameObjects.Arc {
  private targetX: number;
  private targetY: number;
  private projectileSpeed: number = 300;
  private projectileDamage: number;
  private explosionRadius: number = 60;
  private projectileActive: boolean = true;
  private enemiesInRange: Enemy[];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Enemy,
    damage: number,
    enemiesInRange: Enemy[]
  ) {
    super(scene, x, y, 6, 0, 360, false, 0x556B2F);
    this.projectileDamage = damage;
    this.enemiesInRange = enemiesInRange;

    // Calculate target position (prediction)
    const targetPos = target.getPosition();
    this.targetX = targetPos.x;
    this.targetY = targetPos.y;

    scene.add.existing(this);

    // Launch animation
    scene.tweens.add({
      targets: this,
      scale: 1.5,
      duration: 100,
      yoyo: true
    });
  }

  update(_time: number, delta: number): void {
    if (!this.projectileActive || !this.active) return;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10) {
      this.explode();
    } else {
      this.x += (dx / distance) * this.projectileSpeed * (delta / 1000);
      this.y += (dy / distance) * this.projectileSpeed * (delta / 1000);
    }
  }

  private explode(): void {
    this.projectileActive = false;

    // Create explosion effect
    const explosion = this.scene.add.circle(this.x, this.y, this.explosionRadius, 0xFF6600);
    explosion.setAlpha(0.6);

    // Explosion animation
    this.scene.tweens.add({
      targets: explosion,
      scale: 0,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => explosion.destroy()
    });

    // Damage all enemies in range
    for (const enemy of this.enemiesInRange) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (dist <= this.explosionRadius && enemy.active) {
        const damageMultiplier = 1 - (dist / this.explosionRadius) * 0.5;
        enemy.takeDamage(Math.floor(this.projectileDamage * damageMultiplier));
      }
    }

    this.destroy();
  }

  destroy(fromScene?: boolean): void {
    this.projectileActive = false;
    super.destroy(fromScene);
  }
}

export class GrenadeTower extends Tower {
  constructor(scene: Phaser.Scene, x: number, y: number, config: TowerConfig) {
    super(scene, x, y, config);
  }

  fire(target: Enemy): Phaser.GameObjects.GameObject {
    // Get all enemies for area damage calculation
    const scene = this.scene as any;
    const enemiesInRange = scene.enemyManager ? scene.enemyManager.getEnemies() : [target];

    const projectile = new GrenadeProjectile(
      this.scene,
      this.x,
      this.y - 16,
      target,
      this.config.damage,
      enemiesInRange
    );
    return projectile;
  }
}
