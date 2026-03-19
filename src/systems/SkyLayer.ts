import Phaser from 'phaser';

export type TimeOfDay = 'day' | 'dusk' | 'night';

interface SkyColors {
  top: number;
  bottom: number;
}

const SKY_COLORS: Record<TimeOfDay, SkyColors> = {
  day: { top: 0x87CEEB, bottom: 0xE0F6FF },
  dusk: { top: 0xFF6B35, bottom: 0xF4A460 },
  night: { top: 0x0B1026, bottom: 0x1a1a2e }
};

interface CloudConfig {
  x: number;
  y: number;
  scale: number;
  speed: number;
  circles: Array<{ dx: number; dy: number; radius: number }>;
}

class Cloud {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private config: CloudConfig;
  private x: number;

  constructor(scene: Phaser.Scene, config: CloudConfig) {
    this.scene = scene;
    this.config = config;
    this.x = config.x;
    this.graphics = scene.add.graphics();
  }

  create(): void {
    this.draw();
  }

  update(delta: number): void {
    this.x += this.config.speed * delta * 0.001;

    // Wrap around
    const screenWidth = this.scene.scale.width;
    if (this.x > screenWidth + 150) {
      this.x = -150;
    }

    this.graphics.clear();
    this.draw();
  }

  private draw(): void {
    this.graphics.fillStyle(0xFFFFFF, 0.7);

    for (const circle of this.config.circles) {
      this.graphics.fillCircle(
        this.x + circle.dx * this.config.scale,
        this.config.y + circle.dy * this.config.scale,
        circle.radius * this.config.scale
      );
    }
  }

  destroy(): void {
    this.graphics.destroy();
  }
}

export class SkyLayer {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics | null = null;
  private timeOfDay: TimeOfDay = 'day';
  private clouds: Cloud[] = [];
  private sunMoon: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    this.graphics = this.scene.add.graphics();
    this.drawGradient();
    this.createCelestialBody();
    this.createClouds(8);
  }

  update(_time: number, delta: number): void {
    // Update cloud positions
    for (const cloud of this.clouds) {
      cloud.update(delta);
    }

    // Animate sun/moon position
    this.updateCelestialBody();
  }

  setTimeOfDay(time: TimeOfDay): void {
    if (this.timeOfDay === time) return;

    this.timeOfDay = time;

    // Tween the color transition
    const startColors = this.getCurrentColors();
    const endColors = SKY_COLORS[time];

    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 2000,
      ease: 'Linear',
      onUpdate: (tween) => {
        const progress = tween.getValue() ?? 0;
        const interpolated = this.interpolateColors(startColors, endColors, progress);
        this.drawGradient(interpolated);
      }
    });

    // Update celestial body
    this.updateCelestialBody();
  }

  getTimeOfDay(): TimeOfDay {
    return this.timeOfDay;
  }

  private createClouds(count: number): void {
    const cloudConfigs: CloudConfig[] = [
      // Simple puffy cloud shapes using overlapping circles
      {
        x: 100, y: 80, scale: 1.0, speed: 15,
        circles: [
          { dx: 0, dy: 0, radius: 25 },
          { dx: 20, dy: -5, radius: 20 },
          { dx: -15, dy: 5, radius: 18 },
          { dx: 30, dy: 5, radius: 15 }
        ]
      },
      {
        x: 300, y: 120, scale: 0.8, speed: 12,
        circles: [
          { dx: 0, dy: 0, radius: 22 },
          { dx: 18, dy: -3, radius: 18 },
          { dx: -12, dy: 3, radius: 16 }
        ]
      },
      {
        x: 500, y: 60, scale: 1.2, speed: 18,
        circles: [
          { dx: 0, dy: 0, radius: 28 },
          { dx: 25, dy: -8, radius: 22 },
          { dx: -20, dy: 5, radius: 20 },
          { dx: 35, dy: 3, radius: 18 },
          { dx: -35, dy: -2, radius: 16 }
        ]
      },
      {
        x: 700, y: 100, scale: 0.9, speed: 14,
        circles: [
          { dx: 0, dy: 0, radius: 20 },
          { dx: 15, dy: -4, radius: 16 },
          { dx: -12, dy: 4, radius: 14 }
        ]
      }
    ];

    for (let i = 0; i < count; i++) {
      const config = cloudConfigs[i % cloudConfigs.length];
      // Vary position and add offset
      const cloud = new Cloud(this.scene, {
        ...config,
        x: (config.x + i * 200) % 800,
        y: config.y + Phaser.Math.Between(-20, 20),
        speed: config.speed + Phaser.Math.Between(-5, 5)
      });
      cloud.create();
      this.clouds.push(cloud);
    }
  }

  private createCelestialBody(): void {
    this.sunMoon = this.scene.add.graphics();
    this.updateCelestialBody();
  }

  private updateCelestialBody(): void {
    if (!this.sunMoon) return;

    this.sunMoon.clear();

    const { width, height } = this.scene.scale;

    if (this.timeOfDay === 'day' || this.timeOfDay === 'dusk') {
      // Draw sun
      const sunX = width * 0.8;
      const sunY = height * 0.15;

      // Glow effect
      this.sunMoon.fillStyle(0xFFD700, 0.3);
      this.sunMoon.fillCircle(sunX, sunY, 40);
      this.sunMoon.fillStyle(0xFFD700, 0.5);
      this.sunMoon.fillCircle(sunX, sunY, 30);

      // Core
      this.sunMoon.fillStyle(0xFFD700, 1);
      this.sunMoon.fillCircle(sunX, sunY, 20);

      // Rays
      this.sunMoon.lineStyle(2, 0xFFD700, 0.6);
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        const startR = 35;
        const endR = 45;
        this.sunMoon.lineBetween(
          sunX + Math.cos(angle) * startR,
          sunY + Math.sin(angle) * startR,
          sunX + Math.cos(angle) * endR,
          sunY + Math.sin(angle) * endR
        );
      }
    } else {
      // Draw moon
      const moonX = width * 0.8;
      const moonY = height * 0.15;

      // Glow
      this.sunMoon.fillStyle(0xF0F0F0, 0.2);
      this.sunMoon.fillCircle(moonX, moonY, 25);

      // Core
      this.sunMoon.fillStyle(0xF0F0F0, 1);
      this.sunMoon.fillCircle(moonX, moonY, 15);

      // Craters
      this.sunMoon.fillStyle(0xCCCCCC, 1);
      this.sunMoon.fillCircle(moonX - 4, moonY - 3, 3);
      this.sunMoon.fillCircle(moonX + 5, moonY + 2, 2);
    }
  }

  private drawGradient(colors: SkyColors = SKY_COLORS[this.timeOfDay]): void {
    const graphics = this.graphics;
    if (!graphics) return;

    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    graphics.clear();
    graphics.fillGradientStyle(
      colors.top, colors.top,
      colors.bottom, colors.bottom
    );
    graphics.fillRect(0, 0, width, height);
  }

  private getCurrentColors(): SkyColors {
    return SKY_COLORS[this.timeOfDay];
  }

  private interpolateColors(
    startColors: SkyColors,
    endColors: SkyColors,
    progress: number
  ): SkyColors {
    const interpolateComponent = (s: number, e: number): number => {
      return Math.round(s + (e - s) * progress);
    };

    const startTopR = (startColors.top >> 16) & 0xFF;
    const startTopG = (startColors.top >> 8) & 0xFF;
    const startTopB = startColors.top & 0xFF;
    const endTopR = (endColors.top >> 16) & 0xFF;
    const endTopG = (endColors.top >> 8) & 0xFF;
    const endTopB = endColors.top & 0xFF;

    const startBotR = (startColors.bottom >> 16) & 0xFF;
    const startBotG = (startColors.bottom >> 8) & 0xFF;
    const startBotB = startColors.bottom & 0xFF;
    const endBotR = (endColors.bottom >> 16) & 0xFF;
    const endBotG = (endColors.bottom >> 8) & 0xFF;
    const endBotB = endColors.bottom & 0xFF;

    const topR = interpolateComponent(startTopR, endTopR);
    const topG = interpolateComponent(startTopG, endTopG);
    const topB = interpolateComponent(startTopB, endTopB);

    const botR = interpolateComponent(startBotR, endBotR);
    const botG = interpolateComponent(startBotG, endBotG);
    const botB = interpolateComponent(startBotB, endBotB);

    return {
      top: (topR << 16) | (topG << 8) | topB,
      bottom: (botR << 16) | (botG << 8) | botB
    };
  }

  destroy(): void {
    this.clouds.forEach(c => c.destroy());
    this.graphics?.destroy();
    this.sunMoon?.destroy();
  }
}
