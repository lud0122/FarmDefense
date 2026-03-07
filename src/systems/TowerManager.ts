import Phaser from 'phaser';
import { Tower } from '../entities/Tower';
import { PistolTower } from '../entities/towers/PistolTower';
import { MachineGunTower } from '../entities/towers/MachineGunTower';
import { TOWERS, TowerConfig } from '../config/towers';

export class TowerManager {
  private towers: Tower[] = [];
  private scene: Phaser.Scene;
  private projectiles: Phaser.GameObjects.GameObject[] = [];

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

  public update(time: number, delta: number, enemies: any[]): void {
    // 更新所有塔楼
    for (const tower of this.towers) {
      if (tower.active) {
        const projectile = tower.update(time, delta, enemies);
        if (projectile) {
          this.projectiles.push(projectile);
        }
      }
    }

    // 更新所有子弹
    this.updateProjectiles(delta);
  }

  private updateProjectiles(delta: number): void {
    // 这里会在 Projectile 类中实现
    // 暂时不做处理，由各个 Projectile 自己更新
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
