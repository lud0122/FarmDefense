import Phaser from 'phaser';
import { TimeOfDay } from './SkyLayer.js';

export class HorizonLayer {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics | null = null;
  private timeOfDay: TimeOfDay = 'day';
  private decorations: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    this.graphics = this.scene.add.graphics();
    this.drawMountains();
    this.createDecorations();
  }

  setTimeOfDay(time: TimeOfDay): void {
    this.timeOfDay = time;
    // Redraw mountains with adjusted colors
    if (this.graphics) {
      this.graphics.clear();
      this.drawMountains();
    }
  }

  private drawMountains(): void {
    if (!this.graphics) return;

    const { width, height } = this.scene.scale;

    // Get mountain color based on time of day
    const mountainColor = this.getMountainColor();

    // Draw distant mountains as layered shapes
    this.graphics.fillStyle(mountainColor, 0.6);

    // Back layer mountains (smaller, lighter)
    const backLayer = [
      { x: -50, y: height * 0.45 },
      { x: 150, y: height * 0.35 },
      { x: 300, y: height * 0.4 },
      { x: 450, y: height * 0.32 },
      { x: 600, y: height * 0.38 },
      { x: 750, y: height * 0.35 },
      { x: 850, y: height * 0.45 }
    ];
    this.drawMountainLayer(backLayer, 0.4);

    // Front layer mountains (closer, darker)
    this.graphics.fillStyle(mountainColor, 0.8);
    const frontLayer = [
      { x: -30, y: height * 0.5 },
      { x: 100, y: height * 0.4 },
      { x: 250, y: height * 0.45 },
      { x: 400, y: height * 0.38 },
      { x: 550, y: height * 0.42 },
      { x: 700, y: height * 0.4 },
      { x: 830, y: height * 0.5 }
    ];
    this.drawMountainLayer(frontLayer, 0.5);

    // Ground line
    this.graphics.fillStyle(0x2E7D32, 1);
    this.graphics.fillRect(0, height * 0.5, width, height * 0.5);
  }

  private drawMountainLayer(points: Array<{ x: number; y: number }>, _baseY: number): void {
    if (!this.graphics) return;

    const { height } = this.scene.scale;

    this.graphics.beginPath();
    this.graphics.moveTo(points[0].x, height);

    for (const point of points) {
      this.graphics.lineTo(point.x, point.y);
    }

    this.graphics.lineTo(points[points.length - 1].x, height);
    this.graphics.closePath();
    this.graphics.fillPath();
  }

  private getMountainColor(): number {
    switch (this.timeOfDay) {
      case 'day':
        return 0x4A5568; // Blue-gray
      case 'dusk':
        return 0x3D3830; // Warm dark
      case 'night':
        return 0x1A202C; // Dark blue-gray
      default:
        return 0x4A5568;
    }
  }

  private createDecorations(): void {
    const { width, height } = this.scene.scale;

    // Add distant village/house(on the horizon)
    const houseX = width * 0.15;
    const houseY = height * 0.48;

    // Simple house representation
    const house = this.scene.add.text(houseX, houseY, '🏠', {
      fontSize: '24px'
    }).setOrigin(0.5).setDepth(-15).setAlpha(0.8);
    this.decorations.push(house);

    // Windmill on the horizon
    const windmillX = width * 0.85;
    const windmillY = height * 0.47;

    const windmill = this.scene.add.text(windmillX, windmillY, '💨', {
      fontSize: '28px'
    }).setOrigin(0.5).setDepth(-15).setAlpha(0.8);
    this.decorations.push(windmill);

    // Add some distant trees
    const treePositions = [
      { x: width * 0.7, y: height * 0.49 },
      { x: width * 0.72, y: height * 0.49 },
      { x: width * 0.73, y: height * 0.485 }
    ];

    for (const pos of treePositions) {
      const tree = this.scene.add.text(pos.x, pos.y, '🌲', {
        fontSize: '20px'
      }).setOrigin(0.5).setDepth(-15).setAlpha(0.7);
      this.decorations.push(tree);
    }
  }

  destroy(): void {
    this.graphics?.destroy();
    this.decorations.forEach(d => d.destroy());
  }
}
