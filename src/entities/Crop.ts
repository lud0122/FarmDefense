import Phaser from 'phaser';

// Crop type configuration
export interface CropConfig {
  key: string;
  health: number;
  reward: number;
  emoji: string;
}

// Default crop types
export const CROP_TYPES: Record<string, CropConfig> = {
  wheat: {
    key: 'wheat',
    health: 50,
    reward: 10,
    emoji: '🌾'
  },
  corn: {
    key: 'corn',
    health: 75,
    reward: 15,
    emoji: '🌽'
  },
  carrot: {
    key: 'carrot',
    health: 40,
    reward: 12,
    emoji: '🥕'
  },
  tomato: {
    key: 'tomato',
    health: 60,
    reward: 20,
    emoji: '🍅'
  },
  pumpkin: {
    key: 'pumpkin',
    health: 100,
    reward: 25,
    emoji: '🎃'
  }
};

export class Crop extends Phaser.GameObjects.Container {
  public health: number;
  public maxHealth: number;
  public config: CropConfig;
  public reward: number;

  private isDestroyed: boolean = false;
  public onDestroy: () => void;
  private sprite: Phaser.GameObjects.Text;
  private healthBar: Phaser.GameObjects.Rectangle;
  private healthBarBg: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: CropConfig,
    onDestroy: () => void
  ) {
    super(scene, x, y);

    this.config = config;
    this.maxHealth = config.health;
    this.health = config.health;
    this.reward = config.reward;
    this.onDestroy = onDestroy;
    this.isDestroyed = false;

    // Crop visual (emoji)
    this.sprite = scene.add.text(0, 0, config.emoji, {
      fontSize: '40px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.add(this.sprite);

    // Health bar background
    this.healthBarBg = scene.add.rectangle(0, -30, 40, 4, 0x000000);
    this.add(this.healthBarBg);

    // Health bar
    this.healthBar = scene.add.rectangle(0, -30, 40, 4, 0x00ff00);
    this.healthBar.setOrigin(0.5, 0.5);
    this.add(this.healthBar);

    scene.add.existing(this);

    // Spawn animation
    this.sprite.setScale(0);
    scene.tweens.add({
      targets: this.sprite,
      scale: 1,
      duration: 400,
      ease: 'Back.out'
    });
  }

  public takeDamage(amount: number): void {
    if (this.isDestroyed) return;

    this.health -= amount;

    // Update health bar
    const healthPercent = Math.max(0, this.health / this.maxHealth);
    const barWidth = 40 * healthPercent;
    this.healthBar.setDisplaySize(barWidth, 4);

    // Change health bar color based on health
    if (healthPercent > 0.6) {
      this.healthBar.setFillStyle(0x00ff00); // Green
    } else if (healthPercent > 0.3) {
      this.healthBar.setFillStyle(0xffff00); // Yellow
    } else {
      this.healthBar.setFillStyle(0xff0000); // Red
    }

    // Damage flash
    this.sprite.setAlpha(0.5);
    this.scene.time.delayedCall(100, () => {
      if (this.sprite && !this.isDestroyed) {
        this.sprite.setAlpha(1);
      }
    });

    if (this.health <= 0 && !this.isDestroyed) {
      this.destroy();
    }
  }

  public destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    // Destruction animation
    this.scene.tweens.add({
      targets: this,
      scale: 0.5,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.onDestroy();
        super.destroy();
      }
    });
  }

  public isAlive(): boolean {
    return !this.isDestroyed;
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
