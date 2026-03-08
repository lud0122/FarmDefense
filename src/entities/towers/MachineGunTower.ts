import Phaser from 'phaser';
import { Tower } from '../Tower';
import { Enemy } from '../Enemy';
import { Projectile } from '../Projectile';
import { TowerConfig } from '../../config/towers';

export class MachineGunTower extends Tower {
  constructor(scene: Phaser.Scene, x: number, y: number, config: TowerConfig) {
    super(scene, x, y, config);
  }

  protected fire(target: Enemy): Phaser.GameObjects.GameObject {
    // Play rapid fire sound
    const gameScene = this.scene as any;
    if (gameScene.audioSystem) {
      gameScene.audioSystem.playShootSound();
    }

    const projectile = new Projectile(
      this.scene,
      this.x,
      this.y - 16,
      target,
      500,
      this.config.damage,
      0xFF0000
    );
    return projectile;
  }
}
