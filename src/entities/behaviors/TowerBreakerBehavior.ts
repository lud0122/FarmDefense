import Phaser from 'phaser';
import { EnemyBehavior, EnemyBehaviorContext, BehaviorControlledEnemy } from './EnemyBehavior';
import { ParticleFactory } from '../../utils/ParticleFactory.js';

const getDistance = (fromX: number, fromY: number, toX: number, toY: number): number => {
  const dx = toX - fromX;
  const dy = toY - fromY;
  return Math.sqrt(dx * dx + dy * dy);
};

export class TowerBreakerBehavior implements EnemyBehavior {
  private targetTower: { x: number; y: number; active: boolean; takeDamage: (amount: number) => void } | null = null;
  private lastTargetSearchTime = 0;
  private readonly targetSearchIntervalMs: number;
  private readonly attackDamage: number;
  private readonly attackCooldownMs: number;
  private readonly attackRangePx: number;
  private lastAttackTime = 0;

  constructor(params: { attackDamage: number; attackCooldownMs: number; attackRangePx: number; targetSearchIntervalMs?: number }) {
    this.attackDamage = params.attackDamage;
    this.attackCooldownMs = params.attackCooldownMs;
    this.attackRangePx = params.attackRangePx;
    this.targetSearchIntervalMs = params.targetSearchIntervalMs ?? 200;
  }

  public getType(): 'towerBreaker' {
    return 'towerBreaker';
  }

  public update(enemy: BehaviorControlledEnemy, context: EnemyBehaviorContext, time: number, delta: number): void {
    if (!this.targetTower || !this.targetTower.active || time - this.lastTargetSearchTime >= this.targetSearchIntervalMs) {
      this.targetTower = this.findNearestTower(enemy, context);
      this.lastTargetSearchTime = time;
    }

    if (!this.targetTower) {
      enemy.moveByBehaviorDefault(delta);
      return;
    }

    const distance = getDistance(enemy.x, enemy.y, this.targetTower.x, this.targetTower.y);
    if (distance > this.attackRangePx) {
      enemy.moveToPoint(this.targetTower.x, this.targetTower.y, delta);
      return;
    }

    if (time - this.lastAttackTime < this.attackCooldownMs) {
      return;
    }

    this.lastAttackTime = time;

    // 发射攻击粒子 - 仅在 scene 存在时
    const enemyWithScene = enemy as unknown as { scene?: Phaser.Scene };
    if (enemyWithScene.scene?.add) {
      ParticleFactory.createAttackParticles(
        enemyWithScene.scene,
        enemy.x,
        enemy.y,
        this.targetTower.x,
        this.targetTower.y
      );
    }

    this.targetTower.takeDamage(this.attackDamage);
  }

  private findNearestTower(enemy: BehaviorControlledEnemy, context: EnemyBehaviorContext) {
    const towers = context.getTowers().filter(t => t.active);
    if (towers.length === 0) return null;

    let nearest = towers[0];
    let nearestDistance = getDistance(enemy.x, enemy.y, nearest.x, nearest.y);

    for (const tower of towers.slice(1)) {
      const distance = getDistance(enemy.x, enemy.y, tower.x, tower.y);
      if (distance < nearestDistance) {
        nearest = tower;
        nearestDistance = distance;
      }
    }

    return nearest;
  }
}
