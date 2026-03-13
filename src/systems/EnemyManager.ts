import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { SmartEnemy } from '../entities/SmartEnemy';
import { EnemyConfig } from '../config/enemies';
import { Pathfinding } from '../utils/Pathfinding';

interface EnemySpawnEvent {
  enemyKey: string;
  config: EnemyConfig;
  spawnTime: number;
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

  public spawn(config: EnemyConfig, delay: number = 0): void {
    const spawnEvent: EnemySpawnEvent = {
      enemyKey: config.key,
      config,
      spawnTime: this.scene.time.now + delay
    };
    this.spawnQueue.push(spawnEvent);
  }

  public spawnWave(enemies: Array<{ config: EnemyConfig; count: number; interval: number }>): void {
    let totalDelay = 0;
    let maxDelay = 0;

    for (const wave of enemies) {
      // 为每个敌人类型独立计算延迟，支持同时生成
      const waveStartDelay = totalDelay;
      let waveEndDelay = waveStartDelay;

      for (let i = 0; i < wave.count; i++) {
        this.spawn(wave.config, waveStartDelay + i * wave.interval);
        waveEndDelay = waveStartDelay + i * wave.interval;
      }

      maxDelay = Math.max(maxDelay, waveEndDelay);
    }
  }

  public update(time: number, delta: number): void {
    // 处理生成队列
    this.processSpawnQueue(time);

    // 更新所有敌人
    for (const enemy of [...this.enemies]) {
      if (enemy.active) {
        enemy.update(time, delta);

        // 检查是否到达终点（只有常规敌人才检查）
        if ('reachedEnd' in enemy && enemy.reachedEnd()) {
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
      this.createEnemy(event.config);
    }
  }

  private createEnemy(config: EnemyConfig): void {
    // Smart enemy mode - spawn SmartEnemy that finds path to end
    if (config.isSmart && this.isSmartLevel && this.pathfinding && this.getObstacles) {
      const startPoint = this.path[0];
      const endPoint = this.path[this.path.length - 1];
      const smartEnemy = new SmartEnemy(
        this.scene,
        startPoint.x,
        startPoint.y,
        config,
        this.pathfinding,
        this.getObstacles,
        () => [], // Empty crops function (not used)
        () => {
          this.onEnemyDeath(config.reward);
          this.removeEnemy(smartEnemy);
        },
        endPoint
      );
      this.enemies.push(smartEnemy);
    } else {
      // Regular enemy mode
      const startPoint = this.path[0];
      const enemy = new Enemy(
        this.scene,
        startPoint.x,
        startPoint.y,
        config,
        this.path,
        () => {
          this.onEnemyDeath(config.reward);
          this.removeEnemy(enemy);
        }
      );
      this.enemies.push(enemy);
    }
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
    this.isSmartLevel = false;
  }
}
