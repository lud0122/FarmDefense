import Phaser from 'phaser';
import { EnemyConfig } from '../config/enemies';
import { Pathfinding } from '../utils/Pathfinding';

// Smart enemy emojis (more intelligent variants)
const SMART_ENEMY_EMOJIS: Record<string, string> = {
  smartRabbit: '🐰',
  smartBoar: '🐗',
  smartFox: '🦊',
  smartEagle: '🦅',
  smartBear: '🐻'
};

enum AIState {
  IDLE = 'IDLE',
  SEEKING_CROP = 'SEEKING_CROP',
  MOVING_TO_CROP = 'MOVING_TO_CROP',
  ATTACKING_CROP = 'ATTACKING_CROP'
};

export class SmartEnemy extends Phaser.GameObjects.Container {
  public health: number;
  public maxHealth: number;
  public config: EnemyConfig;
  public reward: number;
  public currentSpeed: number;
  public slowEffects: number = 0;

  private isDead: boolean = false;
  public onDeath: () => void;
  private sprite: Phaser.GameObjects.Text;
  private healthBar: Phaser.GameObjects.Rectangle;
  private healthBarBg: Phaser.GameObjects.Rectangle;

  // AI components
  private aiState: AIState = AIState.IDLE;
  private pathfinding: Pathfinding;
  private currentPath: Array<{ x: number; y: number }> = [];
  private pathIndex: number = 0;
  private targetCrop: Phaser.GameObjects.Container | null = null;
  private getObstacles: () => Array<{ x: number; y: number; radius: number }>;
  private getCrops: () => Phaser.GameObjects.Container[];

  // AI behavior parameters
  private pathfindingCooldown: number = 0;
  private readonly PATHFINDING_INTERVAL: number = 1000; // Recalculate path every 1 second

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: EnemyConfig,
    pathfinding: Pathfinding,
    getObstacles: () => Array<{ x: number; y: number; radius: number }>,
    getCrops: () => Phaser.GameObjects.Container[],
    onDeath: () => void
  ) {
    super(scene, x, y);

    this.config = config;
    this.maxHealth = config.health;
    this.health = config.health;
    this.reward = config.reward;
    this.currentSpeed = config.speed;
    this.pathfinding = pathfinding;
    this.getObstacles = getObstacles;
    this.getCrops = getCrops;
    this.onDeath = onDeath;
    this.isDead = false;

    // Smart enemy visual
    const emoji = SMART_ENEMY_EMOJIS[config.key] || '🤖';
    this.sprite = scene.add.text(0, 0, emoji, {
      fontSize: `${config.size * 1.5}px`,
      color: '#ff9900' // Orange tint for smart enemies
    }).setOrigin(0.5);
    this.add(this.sprite);

    // Health bar background
    this.healthBarBg = scene.add.rectangle(0, -config.size / 2 - 10, config.size, 4, 0x000000);
    this.add(this.healthBarBg);

    // Health bar
    this.healthBar = scene.add.rectangle(0, -config.size / 2 - 10, config.size, 4, 0xff9900);
    this.healthBar.setOrigin(0.5, 0.5);
    this.add(this.healthBar);

    scene.add.existing(this);

    // Spawn animation
    this.sprite.setScale(0);
    scene.tweens.add({
      targets: this.sprite,
      scale: 1,
      duration: 300,
      ease: 'Back.out'
    });

    // Start AI
    this.aiState = AIState.SEEKING_CROP;
  }

  public takeDamage(amount: number): void {
    if (this.isDead) return;

    this.health -= amount;

    // Update health bar
    const healthPercent = Math.max(0, this.health / this.maxHealth);
    const barWidth = this.config.size * healthPercent;
    this.healthBar.setDisplaySize(barWidth, 4);

    // Damage flash
    this.sprite.setAlpha(0.5);
    this.scene.time.delayedCall(100, () => {
      if (this.sprite && !this.isDead) {
        this.sprite.setAlpha(1);
      }
    });

    if (this.health <= 0 && !this.isDead) {
      this.die();
    }
  }

  private die(): void {
    this.isDead = true;

    // Death animation
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
    if (this.isDead) return;

    // Update AI state machine
    this.updateAI(delta);
  }

  private updateAI(delta: number): void {
    switch (this.aiState) {
      case AIState.SEEKING_CROP:
        this.seekCrop();
        break;

      case AIState.MOVING_TO_CROP:
        this.moveToCrop(delta);
        break;

      case AIState.ATTACKING_CROP:
        this.attackCrop();
        break;

      default:
        break;
    }

    // Update pathfinding cooldown
    this.pathfindingCooldown -= delta;
  }

  private seekCrop(): void {
    const crops = this.getCrops();

    if (crops.length === 0) {
      // No crops to attack, wander aimlessly
      return;
    }

    // Find nearest crop
    let nearestCrop: Phaser.GameObjects.Container | null = null;
    let nearestDistance = Infinity;

    for (const crop of crops) {
      const dx = crop.x - this.x;
      const dy = crop.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestCrop = crop;
      }
    }

    if (nearestCrop) {
      this.targetCrop = nearestCrop;
      this.calculatePathToTarget();
      this.aiState = AIState.MOVING_TO_CROP;
    }
  }

  private calculatePathToTarget(): void {
    if (!this.targetCrop) return;

    // Update obstacles
    this.pathfinding.setObstacles(this.getObstacles());

    // Find path to target crop
    const path = this.pathfinding.findPath(
      this.x,
      this.y,
      this.targetCrop.x,
      this.targetCrop.y
    );

    if (path && path.length > 0) {
      this.currentPath = path;
      this.pathIndex = 0;
      this.pathfindingCooldown = this.PATHFINDING_INTERVAL;
    }
  }

  private moveToCrop(delta: number): void {
    // Check if target crop still exists
    if (!this.targetCrop || !this.targetCrop.active) {
      this.targetCrop = null;
      this.aiState = AIState.SEEKING_CROP;
      return;
    }

    // Recalculate path periodically
    if (this.pathfindingCooldown <= 0) {
      this.calculatePathToTarget();
    }

    // Check if reached target
    const dx = this.targetCrop.x - this.x;
    const dy = this.targetCrop.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 30) {
      // Attack range
      this.aiState = AIState.ATTACKING_CROP;
      return;
    }

    // Follow path
    if (this.pathIndex < this.currentPath.length) {
      const target = this.currentPath[this.pathIndex];
      const pathDx = target.x - this.x;
      const pathDy = target.y - this.y;
      const pathDistance = Math.sqrt(pathDx * pathDx + pathDy * pathDy);

      if (pathDistance < 10) {
        this.pathIndex++;
      } else {
        const moveX = (pathDx / pathDistance) * this.currentSpeed * (delta / 1000);
        const moveY = (pathDy / pathDistance) * this.currentSpeed * (delta / 1000);
        this.x += moveX;
        this.y += moveY;
      }
    } else {
      // Path exhausted, recalculate
      this.calculatePathToTarget();
    }
  }

  private attackCrop(): void {
    if (!this.targetCrop || !this.targetCrop.active) {
      this.targetCrop = null;
      this.aiState = AIState.SEEKING_CROP;
      return;
    }

    // Damage crop (handled by CropManager)
    // For now, just move to next crop
    this.targetCrop = null;
    this.aiState = AIState.SEEKING_CROP;
  }

  public reachedEnd(): boolean {
    // Smart enemies don't follow a path, they attack crops
    return false;
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
