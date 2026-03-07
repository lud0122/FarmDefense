import Phaser from 'phaser';
import { Tower } from '../entities/Tower';
import { PistolTower } from '../entities/towers/PistolTower';
import { MachineGunTower } from '../entities/towers/MachineGunTower';
import { TOWERS } from '../config/towers';

export class TowerManager {
  private towers: Tower[] = [];
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public placeTower(x: number, y: number, towerKey: string): Tower | null {
    const config = TOWERS[towerKey];
    if (!config) return null;

    let tower: Tower;

    switch (towerKey) {
      case 'pistol':
        tower = new PistolTower(this.scene, x, y, config);
        break;
      case 'machinegun':
        tower = new MachineGunTower(this.scene, x, y, config);
        break;
      default:
        tower = new PistolTower(this.scene, x, y, config);
    }

    this.towers.push(tower);
    return tower;
  }

  public update(time: number, delta: number, enemies: any[]): any[] {
    const newProjectiles: any[] = [];

    // 更新所有塔楼
    for (const tower of this.towers) {
      if (tower.active) {
        const projectile = tower.update(time, delta, enemies);
        if (projectile) {
          newProjectiles.push(projectile);
        }
      }
    }

    return newProjectiles;
  }

  public getTowers(): Tower[] {
    return this.towers.filter(t => t.active);
  }

  public removeTower(tower: Tower): void {
    const index = this.towers.indexOf(tower);
    if (index > -1) {
      tower.destroy();
      this.towers.splice(index, 1);
    }
  }

  public clear(): void {
    for (const tower of this.towers) {
      if (tower.active) {
        tower.destroy();
      }
    }
    this.towers = [];
  }
}
