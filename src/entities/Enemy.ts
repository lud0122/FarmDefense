import Phaser from 'phaser';
import { EnemyConfig } from '../config/enemies';

export class Enemy extends Phaser.GameObjects.Container {
  public health: number;
  public maxHealth: number;
  public config: EnemyConfig;
  public reward: number;
  private pathIndex: number = 0;
  private path: Array<{ x: number; y: number }>;
  private isDead: boolean = false;
  public onDeath: () => void;
  private sprite: Phaser.GameObjects.Rectangle;
  private healthBar: Phaser.GameObjects.Rectangle;
  private healthBarBg: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: EnemyConfig,
    path: Array<{ x: number; y: number }>,
    onDeath: () => void
  ) {
    super(scene, x, y);

    this.config = config;
    this.maxHealth = config.health;
    this.health = config.health;
    this.reward = config.reward;
    this.path = path;
    this.onDeath = onDeath;
    this.isDead = false;

    // 敌人主体（使用矩形作为占位）
    this.sprite = scene.add.rectangle(0, 0, config.size, config.size, config.color);
    this.add(this.sprite);

    // 血条背景
    this.healthBarBg = scene.add.rectangle(0, -config.size / 2 - 8, config.size, 4, 0x000000);
    this.add(this.healthBarBg);

    // 血条
    this.healthBar = scene.add.rectangle(0, -config.size / 2 - 8, config.size, 4, 0x00ff00);
    this.healthBar.setOrigin(0.5, 0.5);
    this.add(this.healthBar);

    scene.add.existing(this);
  }

  public takeDamage(amount: number): void {
    if (this.isDead) return;

    this.health -= amount;

    // 更新血条
    const healthPercent = Math.max(0, this.health / this.maxHealth);
    const barWidth = this.config.size * healthPercent;
    this.healthBar.setDisplaySize(barWidth, 4);

    // 受伤闪烁效果
    this.sprite.setFillStyle(0xffffff);
    this.scene.time.delayedCall(100, () => {
      if (this.sprite && !this.isDead) {
        this.sprite.setFillStyle(this.config.color);
      }
    });

    if (this.health <= 0 && !this.isDead) {
      this.die();
    }
  }

  private die(): void {
    this.isDead = true;

    // 死亡动画效果
    this.scene.tweens.add({
      targets: this,
      scale: 0.5,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.onDeath();
        this.destroy();
      }
    });
  }

  public update(_time: number, delta: number): void {
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
    }
  }

  public reachedEnd(): boolean {
    return this.pathIndex >= this.path.length - 1 && !this.isDead;
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
