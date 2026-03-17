import Phaser from 'phaser';
import { Tower } from '../entities/Tower';
import { PistolTower } from '../entities/towers/PistolTower';
import { MachineGunTower } from '../entities/towers/MachineGunTower';
import { GrenadeTower } from '../entities/towers/GrenadeTower';
import { IceTower } from '../entities/towers/IceTower';
import { ElectricTower } from '../entities/towers/ElectricTower';
import { SentinelTower } from '../entities/towers/SentinelTower';
import { TOWERS } from '../config/towers';
import { UpgradeManager } from './UpgradeManager';
import { TowerUpgrade } from '../config/towerUpgrades';

export class TowerManager {
  private towers: Tower[] = [];
  private scene: Phaser.Scene;
  private onTowerRemoved: ((tower: Tower) => void) | null;
  private upgradeManager: UpgradeManager;
  private enemyManager: any = null; // 用于获取敌人信息计算动态价格

  constructor(scene: Phaser.Scene, onTowerRemoved?: (tower: Tower) => void) {
    this.scene = scene;
    this.onTowerRemoved = onTowerRemoved ?? null;
    this.upgradeManager = new UpgradeManager(scene);
  }

  /**
   * 设置敌人管理器(用于动态定价)
   */
  public setEnemyManager(enemyManager: any): void {
    this.enemyManager = enemyManager;
  }

  /**
   * 获取升级管理器
   */
  public getUpgradeManager(): UpgradeManager {
    return this.upgradeManager;
  }

  /**
   * 购买塔楼升级
   */
  public purchaseTowerUpgrade(tower: Tower, upgradeId: string): boolean {
    const upgrade = this.upgradeManager.getUpgradeById(upgradeId);
    if (!upgrade) return false;

    // 计算价格(需要游戏状态)
    const currentWave = this.getCurrentWave();
    const totalEnemyHealth = this.getTotalEnemyHealth();
    const cost = this.upgradeManager.calculateUpgradeCost(
      upgrade,
      tower.getLevel(),
      currentWave,
      totalEnemyHealth
    );

    // 检查金币(从 scene 获取 economySystem)
    const economySystem = (this.scene as any).economySystem;
    if (!economySystem || economySystem.getMoney() < cost) {
      return false;
    }

    // 执行购买
    if (this.upgradeManager.canPurchaseUpgrade(upgrade, economySystem.getMoney(), cost)) {
      // 扣除金币
      economySystem.spendMoney(cost);

      // 应用升级
      tower.purchaseUpgrade(upgrade);

      return true;
    }

    return false;
  }

  /**
   * 获取塔楼可用升级列表
   */
  public getAvailableUpgrades(tower: Tower): { upgrade: TowerUpgrade; cost: number }[] {
    const upgrades = this.upgradeManager.getAvailableUpgrades(
      tower.config.key,
      tower.getLevel(),
      this.getCurrentWave(),
      new Set(tower.getPurchasedUpgrades())
    );

    const totalEnemyHealth = this.getTotalEnemyHealth();
    const currentWave = this.getCurrentWave();

    return upgrades.map(upgrade => ({
      upgrade,
      cost: this.upgradeManager.calculateUpgradeCost(
        upgrade,
        tower.getLevel(),
        currentWave,
        totalEnemyHealth
      ),
    }));
  }

  /**
   * 获取当前波次
   */
  private getCurrentWave(): number {
    return (this.scene as any).currentWave || 1;
  }

  /**
   * 计算当前敌人总生命值
   */
  private getTotalEnemyHealth(): number {
    if (!this.enemyManager) return 1000;

    const enemies = this.enemyManager.getEnemies ? this.enemyManager.getEnemies() : [];
    return enemies.reduce((sum: number, enemy: any) => {
      return sum + (enemy.getCurrentHealth?.() || 0);
    }, 1000);
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
      case 'grenade':
        tower = new GrenadeTower(this.scene, x, y, config);
        break;
      case 'ice':
        tower = new IceTower(this.scene, x, y, config);
        break;
      case 'electric':
        tower = new ElectricTower(this.scene, x, y, config);
        break;
      case 'sentinel':
        tower = new SentinelTower(this.scene, x, y, config);
        break;
      default:
        tower = new PistolTower(this.scene, x, y, config);
    }

    tower.setOnDestroyed((destroyedTower) => {
      this.removeTower(destroyedTower);
    });

    this.towers.push(tower);
    return tower;
  }

  public update(time: number, delta: number, enemies: any[]): any[] {
    const newProjectiles: any[] = [];

    // 更新所有塔楼
    for (const tower of this.towers) {
      if (tower.active && !tower.isDestroyed()) {
        const projectile = tower.update(time, delta, enemies);
        if (projectile) {
          newProjectiles.push(projectile);
        }
      }
    }

    return newProjectiles;
  }

  public getTowers(): Tower[] {
    return this.towers.filter(t => t.active && !t.isDestroyed());
  }

  public removeTower(tower: Tower): void {
    const index = this.towers.indexOf(tower);
    if (index > -1) {
      this.towers.splice(index, 1);
      if (this.onTowerRemoved) {
        this.onTowerRemoved(tower);
      }
      tower.destroy();
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
