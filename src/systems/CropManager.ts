import Phaser from 'phaser';
import { Crop, CROP_TYPES } from '../entities/Crop';

export class CropManager {
  private scene: Phaser.Scene;
  private crops: Crop[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Place a crop at the specified position
   */
  public placeCrop(x: number, y: number, cropKey: string = 'wheat'): Crop | null {
    const config = CROP_TYPES[cropKey];
    if (!config) {
      console.warn(`Unknown crop type: ${cropKey}`);
      return null;
    }

    const crop = new Crop(
      this.scene,
      x,
      y,
      config,
      () => this.onCropDestroyed(crop)
    );

    this.crops.push(crop);
    return crop;
  }

  /**
   * Place crops in a grid pattern across the farm
   */
  public placeCropGrid(
    startX: number,
    startY: number,
    width: number,
    height: number,
    spacing: number = 80,
    _cropType: string = 'wheat'
  ): void {
    for (let x = startX; x < startX + width; x += spacing) {
      for (let y = startY; y < startY + height; y += spacing) {
        // Random crop variety
        const cropKeys = Object.keys(CROP_TYPES);
        const randomKey = cropKeys[Math.floor(Math.random() * cropKeys.length)];
        this.placeCrop(x, y, randomKey);
      }
    }
  }

  /**
   * Get all active crops
   */
  public getCrops(): Crop[] {
    return this.crops.filter(crop => crop.isAlive());
  }

  /**
   * Get all crop positions (for SmartEnemy targeting)
   */
  public getCropPositions(): Array<{ x: number; y: number }> {
    return this.crops
      .filter(crop => crop.isAlive())
      .map(crop => ({ x: crop.x, y: crop.y }));
  }

  /**
   * Check if any crops are still alive
   */
  public hasCropsRemaining(): boolean {
    return this.crops.some(crop => crop.isAlive());
  }

  /**
   * Get count of remaining crops
   */
  public getRemainingCropCount(): number {
    return this.crops.filter(crop => crop.isAlive()).length;
  }

  /**
   * Get total health of all remaining crops
   */
  public getTotalCropHealth(): number {
    return this.crops
      .filter(crop => crop.isAlive())
      .reduce((total, crop) => total + crop.health, 0);
  }

  /**
   * Handle crop destruction
   */
  private onCropDestroyed(crop: Crop): void {
    const index = this.crops.indexOf(crop);
    if (index !== -1) {
      this.crops.splice(index, 1);
    }
  }

  /**
   * Clear all crops (for scene cleanup)
   */
  public clear(): void {
    for (const crop of this.crops) {
      if (crop.active) {
        crop.destroy();
      }
    }
    this.crops = [];
  }
}
