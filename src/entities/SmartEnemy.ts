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

  // Pathfinding components
  private pathfinding: Pathfinding;
  private currentPath: Array<{ x: number; y: number }> = [];
  private pathIndex: number = 0;
  private getObstacles: () => Array<{ x: number; y: number; radius: number }>;
  private pathEnd: { x: number; y: number };

  // Pathfinding update parameters
  private pathfindingCooldown: number = 0;
  private readonly PATHFINDING_INTERVAL: number = 300; // Recalculate path frequently (0.3s) to respond to new towers

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: EnemyConfig,
    pathfinding: Pathfinding,
    getObstacles: () => Array<{ x: number; y: number; radius: number }>,
    _getCrops: () => Phaser.GameObjects.Container[], // Unused but kept for compatibility
    onDeath: () => void,
    pathEnd: { x: number; y: number }
  ) {
    super(scene, x, y);

    this.config = config;
    this.maxHealth = config.health;
    this.health = config.health;
    this.reward = config.reward;
    this.currentSpeed = config.speed;
    this.pathfinding = pathfinding;
    this.getObstacles = getObstacles;
    this.pathEnd = pathEnd;
    this.onDeath = onDeath;
    this.isDead = false;

    // Smart enemy visual with orange glow
    const emoji = SMART_ENEMY_EMOJIS[config.key] || '🤖';
    this.sprite = scene.add.text(0, 0, emoji, {
      fontSize: `${config.size * 1.5}px`,
      color: '#ff6600' // Orange tint for smart enemies
    }).setOrigin(0.5);
    this.add(this.sprite);

    // Health bar background
    this.healthBarBg = scene.add.rectangle(0, -config.size / 2 - 10, config.size, 4, 0x000000);
    this.add(this.healthBarBg);

    // Health bar (orange for smart enemies)
    this.healthBar = scene.add.rectangle(0, -config.size / 2 - 10, config.size, 4, 0xff6600);
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

    // Initial path calculation
    this.calculatePathToEnd();
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

    // Update pathfinding cooldown and recalculate if needed
    this.pathfindingCooldown -= delta;
    if (this.pathfindingCooldown <= 0) {
      this.calculatePathToEnd();
    }

    // Move along path
    this.moveAlongPath(delta);
  }

  private calculatePathToEnd(): void {
    // Update obstacles (towers)
    this.pathfinding.setObstacles(this.getObstacles());

    // Find path to end point, avoiding towers
    const path = this.pathfinding.findPath(
      this.x,
      this.y,
      this.pathEnd.x,
      this.pathEnd.y
    );

    if (path && path.length > 0) {
      this.currentPath = path;
      this.pathIndex = 0;
      this.pathfindingCooldown = this.PATHFINDING_INTERVAL;
    }
  }

  private moveAlongPath(delta: number): void {
    if (this.pathIndex >= this.currentPath.length) {
      // No path available - try to move directly to end
      this.moveDirectlyToEnd(delta);
      return;
    }

    // Move toward next path node
    const target = this.currentPath[this.pathIndex];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10) {
      // Reached this node, move to next
      this.pathIndex++;
      return;
    }

    if (distance <= 0) return;

    // Move toward target
    const moveX = (dx / distance) * this.currentSpeed * (delta / 1000);
    const moveY = (dy / distance) * this.currentSpeed * (delta / 1000);

    // Check if movement would put us inside a tower
    const nextX = this.x + moveX;
    const nextY = this.y + moveY;

    if (!this.isPositionBlocked(nextX, nextY)) {
      // Normal movement
      this.x = nextX;
      this.y = nextY;
      return;
    }

    // Blocked - try sliding along obstacle instead of stopping
    // Try X-only movement
    if (!this.isPositionBlocked(this.x + moveX, this.y)) {
      this.x += moveX;
      return;
    }

    // Try Y-only movement
    if (!this.isPositionBlocked(this.x, this.y + moveY)) {
      this.y += moveY;
      return;
    }

    // Try perpendicular slide to get around
    const slideX = -moveY;
    const slideY = moveX;
    if (!this.isPositionBlocked(this.x + slideX, this.y + slideY)) {
      this.x += slideX;
      this.y += slideY;
      return;
    }

    if (!this.isPositionBlocked(this.x - slideX, this.y - slideY)) {
      this.x -= slideX;
      this.y -= slideY;
      return;
    }

    // All directions blocked - advance to next path node
    this.pathIndex++;
  }

  private moveDirectlyToEnd(delta: number): void {
    const dx = this.pathEnd.x - this.x;
    const dy = this.pathEnd.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= 5) return;

    const moveX = (dx / distance) * this.currentSpeed * (delta / 1000);
    const moveY = (dy / distance) * this.currentSpeed * (delta / 1000);

    // Try to move in primary direction
    const nextX = this.x + moveX;
    const nextY = this.y + moveY;

    if (!this.isPositionBlocked(nextX, nextY)) {
      this.x = nextX;
      this.y = nextY;
      return;
    }

    // Blocked - try sliding along obstacles
    // Try moving only in X direction
    if (!this.isPositionBlocked(this.x + moveX, this.y)) {
      this.x += moveX;
      return;
    }

    // Try moving only in Y direction
    if (!this.isPositionBlocked(this.x, this.y + moveY)) {
      this.y += moveY;
      return;
    }

    // Try perpendicular directions to get around obstacle
    const perpendicularX = -moveY;
    const perpendicularY = moveX;
    const perpDist = Math.sqrt(perpendicularX * perpendicularX + perpendicularY * perpendicularY) || 1;
    const slideX = (perpendicularX / perpDist) * this.currentSpeed * (delta / 1000);
    const slideY = (perpendicularY / perpDist) * this.currentSpeed * (delta / 1000);

    // Try both perpendicular directions
    if (!this.isPositionBlocked(this.x + slideX, this.y + slideY)) {
      this.x += slideX;
      this.y += slideY;
    } else if (!this.isPositionBlocked(this.x - slideX, this.y - slideY)) {
      this.x -= slideX;
      this.y -= slideY;
    }
    // If all blocked, stay and let pathfinder find new route
  }

  private isPositionBlocked(x: number, y: number): boolean {
    const obstacles = this.getObstacles();
    for (const obs of obstacles) {
      const distance = Math.sqrt((x - obs.x) ** 2 + (y - obs.y) ** 2);
      if (distance < obs.radius + 10) { // 10px buffer
        return true;
      }
    }
    return false;
  }

  public reachedEnd(): boolean {
    // Check if reached the end point
    const dx = this.pathEnd.x - this.x;
    const dy = this.pathEnd.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 20 && !this.isDead;
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
