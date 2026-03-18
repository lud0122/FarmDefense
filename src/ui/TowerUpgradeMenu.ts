// src/ui/TowerUpgradeMenu.ts
import Phaser from 'phaser';
import { Tower } from '../entities/Tower';
import { TowerUpgrade } from '../config/towerUpgrades';
import { TowerUpgradeOption } from './TowerUpgradeOption';

export class TowerUpgradeMenu extends Phaser.GameObjects.Container {
  private tower: Tower;
  private upgradeOptions: TowerUpgradeOption[] = [];
  private backgroundCircle: Phaser.GameObjects.Graphics | null = null;
  private titleText: Phaser.GameObjects.Text | null = null;
  public closeButton: Phaser.GameObjects.Container | null = null;
  public repairButton: Phaser.GameObjects.Container | null = null;
  public recycleButton: Phaser.GameObjects.Container | null = null;
  public repairCostText: Phaser.GameObjects.Text | null = null;
  public repairButtonBg: Phaser.GameObjects.Rectangle | null = null;

  constructor(
    scene: Phaser.Scene,
    tower: Tower,
    upgrades: TowerUpgrade[],
    costs: Map<string, number>,
    currentMoney: number
  ) {
    super(scene, tower.x, tower.y);

    this.tower = tower;

    this.createBackground();
    this.createTitle();
    this.createHealthInfo();
    this.createUpgradeOptions(upgrades, costs, currentMoney);
    this.createCloseButton();
    this.createRepairButton();
    this.createRecycleButton();

    scene.add.existing(this);
  }

  private createBackground(): void {
    // 半透明背景圆环
    this.backgroundCircle = this.scene.add.graphics();
    this.backgroundCircle.fillStyle(0x000000, 0.7);
    this.backgroundCircle.fillCircle(0, 0, 140);
    this.backgroundCircle.lineStyle(3, 0xFFD700, 0.8);
    this.backgroundCircle.strokeCircle(0, 0, 140);
    this.add(this.backgroundCircle);
  }

  private createTitle(): void {
    const towerName = this.getTowerDisplayName(this.tower.config.key);
    const level = this.tower.getLevel();

    this.titleText = this.scene.add.text(0, -110, `${towerName} Lv.${level}`, {
      fontSize: '14px',
      color: '#FFD700',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add(this.titleText);
  }

  /**
   * 创建血量信息
   */
  private createHealthInfo(): void {
    const currentHealth = this.tower.getCurrentHealth();
    const maxHealth = this.tower.getMaxHealth();

    if (currentHealth >= maxHealth) return; // 满血时不显示

    const healthColor = currentHealth / maxHealth > 0.5 ? '#00FF00' : currentHealth / maxHealth > 0.25 ? '#FFFF00' : '#FF0000';

    const healthText = this.scene.add.text(0, -90, `HP: ${currentHealth}/${maxHealth}`, {
      fontSize: '12px',
      color: healthColor,
    }).setOrigin(0.5);
    this.add(healthText);
  }

  private getTowerDisplayName(key: string): string {
    const names: Record<string, string> = {
      pistol: '手枪塔',
      machinegun: '机枪塔',
      grenade: '炮台',
      ice: '冰霜塔',
      electric: '电塔',
      sentinel: '哨兵塔',
    };
    return names[key] || key;
  }

  private createUpgradeOptions(
    upgrades: TowerUpgrade[],
    costs: Map<string, number>,
    currentMoney: number
  ): void {
    if (upgrades.length === 0) {
      // 没有可用升级
      const noUpgradesText = this.scene.add.text(0, 0, '暂无可用升级', {
        fontSize: '14px',
        color: '#888888',
      }).setOrigin(0.5);
      this.add(noUpgradesText);
      return;
    }

    const radius = 80; // 环形半径
    const angleStep = (2 * Math.PI) / upgrades.length;

    upgrades.forEach((upgrade, index) => {
      const angle = index * angleStep - Math.PI / 2; // 从顶部开始
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const cost = costs.get(upgrade.id) || 0;
      const isPurchased = this.tower.hasUpgrade(upgrade.id);
      const canAfford = currentMoney >= cost && !isPurchased;

      const option = new TowerUpgradeOption(
        this.scene,
        x,
        y,
        upgrade,
        cost,
        isPurchased,
        canAfford
      );

      option.on('select', (upgrade: TowerUpgrade, cost: number) => {
        this.emit('purchase', upgrade, cost);
      });

      this.upgradeOptions.push(option);
      this.add(option);
    });
  }

  private createCloseButton(): void {
    const container = this.scene.add.container(0, -130);

    const bg = this.scene.add.rectangle(0, 0, 30, 24, 0x880000);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);

    const text = this.scene.add.text(0, 0, '✕', {
      fontSize: '14px',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    container.add(text);

    bg.on('pointerdown', () => {
      this.emit('close');
    });

    this.closeButton = container;
    this.add(container);
  }

  private createRepairButton(): void {
    const maxHealth = this.tower.getMaxHealth();
    const currentHealth = this.tower.getCurrentHealth();

    // 满血时不显示修复按钮
    if (currentHealth >= maxHealth) return;

    const repairCost = this.tower.getRepairCost();
    const container = this.scene.add.container(0, 80);

    const bg = this.scene.add.rectangle(0, 0, 100, 28, 0x006400);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);
    this.repairButtonBg = bg;

    const missingHealth = maxHealth - currentHealth;
    const text = this.scene.add.text(0, 0, `修复 +${missingHealth}HP`, {
      fontSize: '12px',
      color: '#00FF00',
    }).setOrigin(0.5);
    container.add(text);

    const costText = this.scene.add.text(0, -22, `💰${repairCost}`, {
      fontSize: '10px',
      color: '#FFD700',
    }).setOrigin(0.5);
    container.add(costText);
    this.repairCostText = costText;

    bg.on('pointerdown', () => {
      this.emit('repair', this.tower, repairCost);
    });

    this.repairButton = container;
    this.add(container);
  }

  private createRecycleButton(): void {
    const container = this.scene.add.container(0, 115);

    const bg = this.scene.add.rectangle(0, 0, 90, 28, 0x8B0000);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);

    const text = this.scene.add.text(0, 0, `回收 💰${this.tower.getRecycleValue()}`, {
      fontSize: '12px',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    container.add(text);

    bg.on('pointerdown', () => {
      this.emit('recycle', this.tower);
    });

    this.recycleButton = container;
    this.add(container);
  }

  public updateCosts(costs: Map<string, number>, currentMoney: number): void {
    this.upgradeOptions.forEach(option => {
      const upgradeId = option.upgrade.id;
      const cost = costs.get(upgradeId) || 0;
      const canAfford = currentMoney >= cost;
      option.updateCost(cost, canAfford);
    });
  }

  public destroy(fromScene?: boolean): void {
    this.upgradeOptions = [];
    super.destroy(fromScene);
  }
}