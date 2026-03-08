import Phaser from 'phaser';
import { Tower } from '../Tower';
import { Enemy } from '../Enemy';
import { TowerConfig } from '../../config/towers';

export class IceProjectile extends Phaser.GameObjects.Arc {
  private target: Enemy | null;
  private projectileSpeed: number = 350;
  private projectileDamage: number;
  private freezeDuration: number = 2000; // Freeze for 2 seconds
  private projectileActive: boolean = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Enemy,
    damage: number
  ) {
    super(scene, x, y, 5, 0, 360, false, 0x87CEEB);
    this.target = target;
    this.projectileDamage = damage;

    scene.add.existing(this);

    // Add snow trail effect
    this.createTrailEffect(scene);
  }

  private createTrailEffect(scene: Phaser.Scene): void {
    // Simple trail effect
    scene.time.addEvent({
      delay: 50,
      callback: () => {
        if (this.active && this.projectileActive) {
          const trail = scene.add.circle(this.x, this.y, 3, 0x87CEEB, 0.5);
          scene.tweens.add({
            targets: trail,
            alpha: 0,
            scale: 0,
            duration: 300,
            onComplete: () => trail.destroy()
          });
        }
      },
      repeat: 10
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

    if (distance < 10) {
      // Hit - deal damage and apply freeze effect
      this.target.takeDamage(this.projectileDamage);
      this.applyFreezeEffect(this.target);
      this.createHitEffect();
      this.destroy();
    } else {
      this.x += (dx / distance) * this.projectileSpeed * (delta / 1000);
      this.y += (dy / distance) * this.projectileSpeed * (delta / 1000);
    }
  }

  private applyFreezeEffect(enemy: Enemy): void {
    // Apply slow effect
    const originalSpeed = enemy.config.speed;
    enemy.config.speed = originalSpeed * 0.5;

    // Freeze visual feedback
    const frost = this.scene.add.rectangle(
      enemy.x, enemy.y,
      enemy.config.size + 4, enemy.config.size + 4,
      0x87CEEB, 0.6
    );
    frost.setDepth(enemy.depth + 1);

    // Follow enemy movement
    const followEvent = this.scene.time.addEvent({
      delay: 16,
      callback: () => {
        if (enemy.active && frost.active) {
          frost.setPosition(enemy.x, enemy.y);
        } else {
          frost.destroy();
          followEvent.remove();
        }
      },
      loop: true
    });

    // Restore speed after freeze duration
    this.scene.time.delayedCall(this.freezeDuration, () => {
      if (enemy.active) {
        enemy.config.speed = originalSpeed;
      }
      frost.destroy();
      followEvent.remove();
    });
  }

  private createHitEffect(): void {
    // Ice shard explosion effect
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const iceShard = this.scene.add.rectangle(
        this.x + Math.cos(angle) * 10,
        this.y + Math.sin(angle) * 10,
        8, 3, 0x87CEEB
      );
      iceShard.setRotation(angle);

      this.scene.tweens.add({
        targets: iceShard,
        x: this.x + Math.cos(angle) * 30,
        y: this.y + Math.sin(angle) * 30,
        alpha: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => iceShard.destroy()
      });
    }
  }

  destroy(fromScene?: boolean): void {
    this.projectileActive = false;
    this.target = null;
    super.destroy(fromScene);
  }
}

export class IceTower extends Tower {
  constructor(scene: Phaser.Scene, x: number, y: number, config: TowerConfig) {
    super(scene, x, y, config);
  }

  fire(target: Enemy): Phaser.GameObjects.GameObject {
    const projectile = new IceProjectile(
      this.scene,
      this.x,
      this.y - 16,
      target,
      this.config.damage
    );
    return projectile;
  }
}
