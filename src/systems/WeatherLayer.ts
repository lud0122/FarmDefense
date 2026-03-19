import Phaser from 'phaser';

export type WeatherType = 'clear' | 'rain' | 'snow';

export class WeatherLayer {
  private scene: Phaser.Scene;
  // Emitter and manager for weather particles (using Graphics-based approach)
  private emitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private currentWeather: WeatherType = 'clear';
  private graphics: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    // Initialize but don't start any weather yet
  }

  setWeather(weather: WeatherType): void {
    if (this.currentWeather === weather) return;

    this.clear();
    this.currentWeather = weather;

    switch (weather) {
      case 'rain':
        this.createRain();
        break;
      case 'snow':
        this.createSnow();
        break;
      case 'clear':
        // Nothing to do
        break;
    }
  }

  getWeather(): WeatherType {
    return this.currentWeather;
  }

  clear(): void {
    if (this.emitter) {
      this.emitter.stop();
      this.emitter = null;
    }
    if (this.graphics) {
      this.graphics.destroy();
      this.graphics = null;
    }
  }

  private createRain(): void {
    // Create rain drops using graphics-based particles
    const { width } = this.scene.scale;

    // Create a simple rain texture on the fly using graphics
    this.graphics = this.scene.add.graphics();
    this.graphics.fillStyle(0xADD8E6, 0.6);

    // Create drops using repeated graphics drawing
    const drops: Array<{ x: number; y: number; speed: number; length: number }> = [];
    const dropCount = 200;

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * -600,
        speed: 400 + Math.random() * 200,
        length: 10 + Math.random() * 15
      });
    }

    // Store drops for update loop
    (this as any).rainDrops = drops;
  }

  private createSnow(): void {
    const { width } = this.scene.scale;
    const flakes: Array<{ x: number; y: number; speed: number; size: number }> = [];
    const flakeCount = 150;

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * -600,
        speed: 30 + Math.random() * 50,
        size: 2 + Math.random() * 3
      });
    }

    (this as any).snowFlakes = flakes;
    this.graphics = this.scene.add.graphics();
  }

  update(_time: number, delta: number): void {
    if (this.currentWeather === 'rain') {
      this.updateRain(delta);
    } else if (this.currentWeather === 'snow') {
      this.updateSnow(delta);
    }
  }

  private updateRain(delta: number): void {
    if (!this.graphics) return;

    const drops = (this as any).rainDrops as Array<{ x: number; y: number; speed: number; length: number }>;
    const { width, height } = this.scene.scale;

    this.graphics.clear();
    this.graphics.lineStyle(1, 0xADD8E6, 0.6);

    for (const drop of drops) {
      drop.y += drop.speed * delta * 0.001;

      // Reset if below screen
      if (drop.y > height + 50) {
        drop.y = -50;
        drop.x = Math.random() * width;
      }

      // Draw rain line
      this.graphics.lineBetween(drop.x, drop.y, drop.x - 2, drop.y + drop.length);
    }
  }

  private updateSnow(delta: number): void {
    if (!this.graphics) return;

    const flakes = (this as any).snowFlakes as Array<{ x: number; y: number; speed: number; size: number }>;
    const { width, height } = this.scene.scale;

    this.graphics.clear();
    this.graphics.fillStyle(0xFFFFFF, 0.8);

    for (const flake of flakes) {
      // Gentle falling with horizontal movement
      flake.y += flake.speed * delta * 0.001;
      flake.x += Math.sin(flake.y * 0.01) * 0.5;

      // Reset if below screen
      if (flake.y > height + 10) {
        flake.y = -10;
        flake.x = Math.random() * width;
      }

      if (flake.x > width + 10) flake.x = -10;
      if (flake.x < -10) flake.x = width + 10;

      // Draw snowflake
      this.graphics.fillCircle(flake.x, flake.y, flake.size);
    }
  }

  destroy(): void {
    this.clear();
  }
}
