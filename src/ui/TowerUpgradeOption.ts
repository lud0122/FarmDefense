// src/ui/TowerUpgradeOption.ts
import Phaser from 'phaser';
import { TowerUpgrade } from '../config/towerUpgrades';

export class TowerUpgradeOption extends Phaser.GameObjects.Container {
  public upgrade: TowerUpgrade;
  private cost: number;
  private isPurchased: boolean;
  private canAfford: boolean;

  // UI elements
  private bg!: Phaser.GameObjects.Arc;
  private iconText!: Phaser.GameObjects.Text;
  private nameText!: Phaser.GameObjects.Text;
  private costText: Phaser.GameObjects.Text | null = null;
  private tooltipContainer: Phaser.GameObjects.Container | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    upgrade: TowerUpgrade,
    cost: number,
    isPurchased: boolean,
    canAfford: boolean
  ) {
    super(scene, x, y);

    this.upgrade = upgrade;
    this.cost = cost;
    this.isPurchased = isPurchased;
    this.canAfford = canAfford;

    this.createUI();
    this.setupInteraction();

    scene.add.existing(this);
  }

  private createUI(): void {
    const radius = 38;
    const color = this.getBackgroundColor();

    // 背景半圆弧
    this.bg = this.scene.add.arc(0, 0, radius, 0, 180, false, color);
    this.bg.setStrokeStyle(3, this.canAfford ? 0xFFD700 : 0x888888);
    this.add(this.bg);

    // 图标 (emoji)
    this.iconText = this.scene.add.text(0, -15, this.upgrade.icon, {
      fontSize: '26px',
      color: this.isPurchased ? '#666666' : '#ffffff',
    }).setOrigin(0.5);
    this.add(this.iconText);

    this.nameText = this.scene.add.text(0, 5, this.upgrade.name, {
      fontSize: '10px',
      color: this.isPurchased ? '#666666' : '#cccccc',
    }).setOrigin(0.5);
    this.add(this.nameText);

    // 价格(如果未购买)
    if (!this.isPurchased) {
      this.costText = this.scene.add.text(0, 18, `${this.cost}`, {
        fontSize: '10px',
        color: this.canAfford ? '#00FF00' : '#FF4444',
      }).setOrigin(0.5);
      this.add(this.costText);
    } else {
      // 已购买标记
      const checkMark = this.scene.add.text(0, 0, '✓', {
        fontSize: '14px',
        color: '#00FF00',
      }).setOrigin(0.5);
      this.add(checkMark);
    }
  }

  private getBackgroundColor(): number {
    if (this.isPurchased) return 0x333333;
    if (!this.canAfford) return 0x552222;
    return 0x1a2530;
  }

  private setupInteraction(): void {
    if (this.isPurchased) return;

    this.setSize(76, 40);
    this.setInteractive();

    // 悬停效果
    this.on('pointerover', () => {
      this.showTooltip();
      this.bg.setScale(1.1);
    });

    this.on('pointerout', () => {
      this.hideTooltip();
      this.bg.setScale(1);
    });

    // 点击事件
    this.on('pointerdown', () => {
      if (this.canAfford) {
        this.emit('select', this.upgrade, this.cost);
      }
    });
  }

  private showTooltip(): void {
    if (this.tooltipContainer) return;

    const tooltipX = this.x > 0 ? -100 : 100;

    this.tooltipContainer = this.scene.add.container(tooltipX, 0);

    const bg = this.scene.add.rectangle(0, 0, 120, 70, 0x000000, 0.95);
    bg.setStrokeStyle(1, 0xFFD700);
    this.tooltipContainer.add(bg);

    const title = this.scene.add.text(0, -22, this.upgrade.name, {
      fontSize: '12px',
      color: '#FFD700',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.tooltipContainer.add(title);

    const desc = this.scene.add.text(0, -5, this.upgrade.description, {
      fontSize: '10px',
      color: '#FFFFFF',
      wordWrap: { width: 110 },
      align: 'center',
    }).setOrigin(0.5);
    this.tooltipContainer.add(desc);

    const price = this.scene.add.text(0, 18, `💰 ${this.cost}`, {
      fontSize: '11px',
      color: this.canAfford ? '#00FF00' : '#FF4444',
    }).setOrigin(0.5);
    this.tooltipContainer.add(price);

    this.add(this.tooltipContainer);
  }

  private hideTooltip(): void {
    if (this.tooltipContainer) {
      this.tooltipContainer.destroy();
      this.tooltipContainer = null;
    }
  }

  public updateCost(newCost: number, newCanAfford: boolean): void {
    this.cost = newCost;
    this.canAfford = newCanAfford;

    if (this.costText) {
      this.costText.setText(`${this.cost}`);
      this.costText.setColor(this.canAfford ? '#00FF00' : '#FF4444');
    }

    this.bg.setStrokeStyle(3, this.canAfford ? 0xFFD700 : 0x888888);
  }
}