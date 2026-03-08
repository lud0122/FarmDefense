import Phaser from 'phaser';
import { Tower } from '../Tower';
import { Enemy } from '../Enemy';
import { TowerConfig } from '../../config/towers';

// Electric chain effect - handles lightning chain logic
export class ElectricChain {
  private scene: Phaser.Scene;
  private startX: number;
  private startY: number;
  private projectileDamage: number;
  private maxChains: number = 3; // Max 3 chain targets
  private chainRange: number = 80; // Chain range
  private chainedEnemies: Set<Enemy> = new Set();

  constructor(
    scene: Phaser.Scene,
    startX: number,
    startY: number,
    firstTarget: Enemy,
    damage: number,
    allEnemies: Enemy[]
  ) {
    this.scene = scene;
    this.startX = startX;
    this.startY = startY;
    this.projectileDamage = damage;

    this.chainLightning(firstTarget, allEnemies, 0);
  }

  private chainLightning(target: Enemy, allEnemies: Enemy[], chainCount: number): void {
    if (chainCount >= this.maxChains || !target.active) return;

    // Record chained enemy
    this.chainedEnemies.add(target);

    const prevX = chainCount === 0 ? this.startX : target.x;
    const prevY = chainCount === 0 ? this.startY : target.y;

    // Deal damage
    target.takeDamage(this.projectileDamage);

    // Create lightning effect
    this.createLightningEffect(prevX, prevY, target.x, target.y, chainCount);

    // Find next chain target
    if (chainCount < this.maxChains - 1) {
      const nextTarget = this.findNextTarget(target, allEnemies);
      if (nextTarget) {
        this.scene.time.delayedCall(100, () => {
          this.chainLightning(nextTarget, allEnemies, chainCount + 1);
        });
      }
    }
  }

  private findNextTarget(current: Enemy, allEnemies: Enemy[]): Enemy | null {
    let closest: Enemy | null = null;
    let closestDist = Infinity;

    for (const enemy of allEnemies) {
      if (!enemy.active || this.chainedEnemies.has(enemy)) continue;

      const dist = Phaser.Math.Distance.Between(current.x, current.y, enemy.x, enemy.y);
      if (dist <= this.chainRange && dist < closestDist) {
        closestDist = dist;
        closest = enemy;
      }
    }

    return closest;
  }

  private createLightningEffect(x1: number, y1: number, x2: number, y2: number, chainCount: number): void {
    const colors = [0xFFD700, 0xFFFF00, 0xFFA500]; // Gold gradient
    const color = colors[Math.min(chainCount, colors.length - 1)];

    // Create main lightning segment
    const segments = 5;
    const points: { x: number; y: number }[] = [];

    points.push({ x: x1, y: y1 });

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 10;
      const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 10;
      points.push({ x, y });
    }

    points.push({ x: x2, y: y2 });

    // Draw zigzag lightning
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(3 - chainCount, color, 1);
    graphics.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }

    graphics.strokePath();

    // Glow effect
    const glow = this.scene.add.graphics();
    glow.lineStyle(6 - chainCount * 2, color, 0.3);
    glow.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      glow.lineTo(points[i].x, points[i].y);
    }
    glow.strokePath();

    // Flash animation
    this.scene.tweens.add({
      targets: [graphics, glow],
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        graphics.destroy();
        glow.destroy();
      }
    });

    // Target point flash
    const flash = this.scene.add.circle(x2, y2, 15 - chainCount * 3, color, 0.6);
    this.scene.tweens.add({
      targets: flash,
      scale: 0,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });
  }
}

export class ElectricTower extends Tower {
  constructor(scene: Phaser.Scene, x: number, y: number, config: TowerConfig) {
    super(scene, x, y, config);
  }

  fire(target: Enemy): Phaser.GameObjects.GameObject {
    // Get all enemies from enemy manager
    const scene = this.scene as any;
    const allEnemies = scene.enemyManager ? scene.enemyManager.getEnemies() : [target];

    // Create electric chain
    new ElectricChain(this.scene, this.x, this.y - 16, target, this.config.damage, allEnemies);

    // Return a marker object
    return this.scene.add.circle(this.x, this.y - 16, 1, 0x000000, 0);
  }
}
