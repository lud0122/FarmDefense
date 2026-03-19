import Phaser from 'phaser';

export class AmbientEffects {
  private scene: Phaser.Scene;
  private windTween: Phaser.Tweens.Tween | null = null;
  private animatedObjects: Array<{
    object: Phaser.GameObjects.Text;
    baseX: number;
    baseY: number;
    swaySpeed: number;
    swayAmount: number;
    phase: number;
  }> = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    // Initialize ambient effects
  }

  /**
   * Add a plant/flower that will sway in the "wind"
   */
  addSwayingPlant(
    object: Phaser.GameObjects.Text,
    swaySpeed: number = 1,
    swayAmount: number = 3
  ): void {
    this.animatedObjects.push({
      object,
      baseX: object.x,
      baseY: object.y,
      swaySpeed,
      swayAmount,
      phase: Math.random() * Math.PI * 2
    });
  }

  /**
   * Add swaying effect to multiple plants at once
   */
  addSwayingPlants(
    objects: Phaser.GameObjects.Text[],
    swaySpeed: number = 1,
    swayAmount: number = 3
  ): void {
    for (const obj of objects) {
      this.addSwayingPlant(obj, swaySpeed, swayAmount);
    }
  }

  update(time: number, _delta: number): void {
    // Update all swaying plants
    const windTime = time * 0.001;

    for (const plant of this.animatedObjects) {
      // Sine wave motion for wind effect
      const offset = Math.sin(windTime * plant.swaySpeed + plant.phase) * plant.swayAmount;
      plant.object.setPosition(plant.baseX + offset, plant.baseY);

      // Subtle rotation
      const rotation = Math.sin(windTime * plant.swaySpeed * 0.5 + plant.phase) * 0.05;
      plant.object.setRotation(rotation);
    }
  }

  /**
   * Create animated birds flying across the sky
   */
  createFlyingBirds(count: number = 3): void {
    const { width, height } = this.scene.scale;

    for (let i = 0; i < count; i++) {
      const bird = this.scene.add.text(
        -50 - i * 150,
        height * 0.15 + Math.random() * 100,
        '🐦',
        { fontSize: '16px' }
      ).setOrigin(0.5).setDepth(-2);

      // Animate bird flying
      const duration = 8000 + Math.random() * 4000;
      const delay = Math.random() * 3000;

      this.scene.tweens.add({
        targets: bird,
        x: width + 50,
        y: height * 0.15 + Math.random() * 50,
        duration: duration,
        delay: delay,
        ease: 'Linear',
        repeat: -1,
        onRepeat: () => {
          bird.setY(height * 0.15 + Math.random() * 100);
        }
      });

      // Flapping animation
      this.scene.tweens.add({
        targets: bird,
        scaleX: 0.8,
        duration: 200,
        yoyo: true,
        repeat: -1
      });
    }
  }

  /**
   * Create twinkling stars (for night time)
   */
  createStars(): void {
    const { width, height } = this.scene.scale;
    const starCount = 50;

    for (let i = 0; i < starCount; i++) {
      // Create star using small white circle
      const star = this.scene.add.graphics();
      star.fillStyle(0xFFFFFF, 1);

      const x = Math.random() * width;
      const y = Math.random() * height * 0.4; // Only upper portion
      const size = 0.5 + Math.random() * 1.5;

      star.fillCircle(x, y, size);
      star.setDepth(-19);

      // Twinkle animation
      const baseAlpha = 0.5 + Math.random() * 0.5;
      this.scene.tweens.add({
        targets: star,
        alpha: { from: baseAlpha, to: baseAlpha * 0.3 },
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * Create fireflies (for night time)
   */
  createFireflies(count: number = 15): void {
    const { width, height } = this.scene.scale;

    for (let i = 0; i < count; i++) {
      const firefly = this.scene.add.graphics();
      firefly.fillStyle(0xCCFF00, 0.8);

      const startX = Math.random() * width;
      const startY = height * 0.4 + Math.random() * height * 0.4;

      firefly.fillCircle(0, 0, 3);
      firefly.setPosition(startX, startY);
      firefly.setDepth(-2);

      // Random floating movement
      this.scene.tweens.add({
        targets: firefly,
        x: startX + Phaser.Math.Between(-100, 100),
        y: startY + Phaser.Math.Between(-50, 50),
        alpha: { from: 0.8, to: 0.2 },
        duration: 3000 + Math.random() * 4000,
        ease: 'Sine.easeInOut',
        repeat: -1,
        yoyo: true
      });
    }
  }

  destroy(): void {
    // Stop all tweens
    if (this.windTween) {
      this.windTween.stop();
    }
  }
}
