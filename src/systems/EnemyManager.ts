import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { SmartEnemy } from '../entities/SmartEnemy';
import { EnemyConfig } from '../config/enemies';
import { LevelBehaviorMixConfig } from '../config/levels';
import { Pathfinding } from '../utils/Pathfinding';
import { buildFixedBehaviorMix, shuffleBehaviorMix } from '../utils/enemyBehaviorMix';
import { resolveEnemyAttackConfig } from '../utils/enemyAttackConfig';
import { RushBehavior } from '../entities/behaviors/RushBehavior';
import { TowerBreakerBehavior } from '../entities/behaviors/TowerBreakerBehavior';
import { EnemyBehaviorType } from '../entities/behaviors/EnemyBehavior';

interface EnemySpawnEvent {
  enemyKey: string;
  config: EnemyConfig;
  spawnTime: number;
  behaviorType?: EnemyBehaviorType;
}

interface BehaviorTower {
  x: number;
  y: number;
  active: boolean;
  takeDamage: (amount: number) => void;
}

export class EnemyManager {
  private enemies: (Enemy | SmartEnemy)[] = [];
  private scene: Phaser.Scene;
  private path: Array<{ x: number; y: number }>;
  private spawnQueue: EnemySpawnEvent[] = [];
  private onEnemyDeath: (reward: number) => void;
  private onEnemyReachEnd: () => void;

  // Level 5 smart enemy dependencies
  private pathfinding: Pathfinding | null = null;
  private getObstacles: (() => Array<{ x: number; y: number; radius: number }>) | null = null;
  private isSmartLevel: boolean = false;

  // Behavior dependencies
  private getTowers: (() => BehaviorTower[]) | null = null;

  constructor(
    scene: Phaser.Scene,
    path: Array<{ x: number; y: number }>,
    onEnemyDeath: (reward: number) => void,
    onEnemyReachEnd: () => void
  ) {
    this.scene = scene;
    this.path = path;
    this.onEnemyDeath = onEnemyDeath;
    this.onEnemyReachEnd = onEnemyReachEnd;
  }

  /**
   * Enable smart enemy mode for Level 5
   */
  public enableSmartMode(
    pathfinding: Pathfinding,
    getObstacles: () => Array<{ x: number; y: number; radius: number }>
  ): void {
    this.isSmartLevel = true;
    this.pathfinding = pathfinding;
    this.getObstacles = getObstacles;
  }

  public setTowerProvider(getTowers: () => BehaviorTower[]): void {
    this.getTowers = getTowers;
  }

  public spawn(config: EnemyConfig, delay: number = 0, behaviorType?: EnemyBehaviorType): void {
    const spawnEvent: EnemySpawnEvent = {
      enemyKey: config.key,
      config,
      spawnTime: this.scene.time.now + delay,
      behaviorType
    };
    this.spawnQueue.push(spawnEvent);
  }

  public spawnWave(
    enemies: Array<{ config: EnemyConfig; count: number; interval: number }>,
    behaviorMix?: LevelBehaviorMixConfig
  ): void {
    let totalDelay = 0;
    let behaviorBySpawn: EnemyBehaviorType[] = [];
    let behaviorIndex = 0;

    if (behaviorMix) {
      const totalCount = enemies.reduce((sum, wave) => sum + wave.count, 0);
      const fixed = buildFixedBehaviorMix(totalCount, behaviorMix.rushRatio);
      behaviorBySpawn = shuffleBehaviorMix(fixed);
    }

    for (const wave of enemies) {
      const waveStartDelay = totalDelay;

      for (let i = 0; i < wave.count; i++) {
        const behaviorType = behaviorMix ? behaviorBySpawn[behaviorIndex] : undefined;
        this.spawn(wave.config, waveStartDelay + i * wave.interval, behaviorType);
        behaviorIndex += 1;
      }
    }
  }

  public update(time: number, delta: number): void {
    // 处理生成队列
    this.processSpawnQueue(time);

    // 更新所有敌人
    for (const enemy of [...this.enemies]) {
      if (enemy.active) {
        const behaviorContext = this.getTowers ? { getTowers: this.getTowers } : undefined;
        enemy.update(time, delta, behaviorContext);

        // 检查是否到达终点
        if (enemy.reachedEnd()) {
          this.onEnemyReachEnd();
          this.removeEnemy(enemy);
          enemy.destroy();
        }
      }
    }
  }

  private processSpawnQueue(time: number): void {
    const toSpawn: EnemySpawnEvent[] = [];
    const remaining: EnemySpawnEvent[] = [];

    for (const event of this.spawnQueue) {
      if (time >= event.spawnTime) {
        toSpawn.push(event);
      } else {
        remaining.push(event);
      }
    }

    this.spawnQueue = remaining;

    for (const event of toSpawn) {
      this.createEnemy(event.config, event.behaviorType);
    }
  }

  private createEnemy(config: EnemyConfig, behaviorType?: EnemyBehaviorType): void {
    const startPoint = this.path[0];
    const endPoint = this.path[this.path.length - 1];

    let enemy: Enemy | SmartEnemy;

    if (config.isSmart && this.isSmartLevel && this.pathfinding && this.getObstacles) {
      const smartEnemy = new SmartEnemy(
        this.scene,
        startPoint.x,
        startPoint.y,
        config,
        this.pathfinding,
        this.getObstacles,
        () => [],
        () => {
          this.onEnemyDeath(config.reward);
          this.removeEnemy(smartEnemy);
        },
        endPoint
      );
      enemy = smartEnemy;
    } else {
      const regularEnemy = new Enemy(
        this.scene,
        startPoint.x,
        startPoint.y,
        config,
        this.path,
        () => {
          this.onEnemyDeath(config.reward);
          this.removeEnemy(regularEnemy);
        }
      );
      enemy = regularEnemy;
    }

    if (behaviorType === 'towerBreaker' && this.getTowers) {
      const attackConfig = resolveEnemyAttackConfig(config);
      if (!attackConfig.isValidForTowerBreaker) {
        console.warn(
          `[EnemyManager] Invalid tower-breaker attack config for ${config.key}, fallback to rush`,
          attackConfig
        );
        enemy.setBehavior(new RushBehavior());
      } else {
        enemy.setBehavior(
          new TowerBreakerBehavior({
            attackDamage: attackConfig.attackDamage,
            attackCooldownMs: attackConfig.attackCooldown,
            attackRangePx: attackConfig.attackRange
          })
        );
      }
    } else if (behaviorType === 'rush') {
      enemy.setBehavior(new RushBehavior());
    }

    this.enemies.push(enemy);
  }

  private removeEnemy(enemy: Enemy | SmartEnemy): void {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
  }

  public getEnemies(): (Enemy | SmartEnemy)[] {
    return this.enemies.filter(e => e.active);
  }

  public getEnemyCount(): number {
    return this.enemies.filter(e => e.active).length;
  }

  public clear(): void {
    for (const enemy of this.enemies) {
      if (enemy.active) {
        enemy.destroy();
      }
    }
    this.enemies = [];
    this.spawnQueue = [];
    this.pathfinding = null;
    this.getObstacles = null;
    this.getTowers = null;
    this.isSmartLevel = false;
  }
}
