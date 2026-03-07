import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { EnemyConfig } from '../config/enemies';

interface EnemySpawnEvent {
  enemyKey: string;
  config: EnemyConfig;
  spawnTime: number;
}

export class EnemyManager {
  private enemies: Enemy[] = [];
  private scene: Phaser.Scene;
  private path: Array<{ x: number; y: number }>;
  private spawnQueue: EnemySpawnEvent[] = [];
  private onEnemyDeath: (reward: number) => void;
  private onEnemyReachEnd: () => void;

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

    for (const wave of enemies) {
      for (let i = 0; i < wave.count; i++) {
        this.spawn(wave.config, totalDelay);
        totalDelay += wave.interval;
      }
    }
  }

  public update(time: number, delta: number): void {
    // 处理生成队列
    this.processSpawnQueue(time);

    // 更新所有敌人
    for (const enemy of [...this.enemies]) {
      if (enemy.active) {
        enemy.update(time, delta);

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
      this.createEnemy(event.config);
    }
  }

  private createEnemy(config: EnemyConfig): void {
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

  private removeEnemy(enemy: Enemy): void {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
  }

  public getEnemies(): Enemy[] {
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
  }
}
