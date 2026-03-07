import Phaser from 'phaser';
import { EnemyConfig } from '../config/enemies';

export class Enemy extends Phaser.GameObjects.Rectangle {
  public health: number;
  public maxHealth: number;
  public config: EnemyConfig;
  public reward: number;
  private pathIndex: number = 0;
  private path: Array<{ x: number; y: number }>;
  private isDead: boolean = false;
  public onDeath: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: EnemyConfig,
    path: Array<{ x: number; y: number }>,
    onDeath: () => void
  ) {
    super(scene, x, y, config.size, config.size, config.color);

    this.config = config;
    this.maxHealth = config.health;
    this.health = config.health;
    this.reward = config.reward;
    this.path = path;
    this.onDeath = onDeath;
    this.isDead = false;

    this.setCollideWorldBounds(true);
    scene.add.existing(this);

    // 添加血条背景
    const barBg = scene.add.rectangle(x, y - 15, config.size, 4, 0x000000);
    this.add(barBg);

    // 添加血条
    const bar = scene.add.rectangle(x - config.size / 2 + 2, y - 15, config.size - 4, 2, 0x00ff00);
    this.healthBar = bar;
    this.add(bar);
  }

  private healthBar: Phaser.GameObjects.Rectangle;

  public takeDamage(amount: number): void {
    if (this.isDead) return;

    this.health -= amount;

    // 更新血条
    const healthPercent = Math.max(0, this.health / this.maxHealth);
    this.healthBar.width = (this.config.size - 4) * healthPercent;

    if (this.health <= 0 && !this.isDead) {
      this.die();
    }
  }

  private die(): void {
    this.isDead = true;
    this.onDeath();
    this.destroy();
  }

  public update(time: number, delta: number): void {
    if (this.isDead || this.pathIndex >= this.path.length - 1) return;

    const target = this.path[this.pathIndex + 1];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      this.pathIndex++;
    } else {
      const moveX = (dx / distance) * this.config.speed * (delta / 1000);
      const moveY = (dy / distance) * this.config.speed * (delta / 1000);
      this.x += moveX;
      this.y += moveY;

      // 更新血条位置
      const children = this.list;
      for (const child of children) {
        if (child instanceof Phaser.GameObjects.Rectangle && child !== this.healthBar) {
          // 血条背景跟随
        }
      }
    }
  }

  public reachedEnd(): boolean {
    return this.pathIndex >= this.path.length - 1 && !this.isDead;
  }
}
