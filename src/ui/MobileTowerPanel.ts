import Phaser from 'phaser';
import { TOWERS } from '../config/towers';

export interface TowerPanelButtonConfig {
  key: string;
  name: string;
  cost: number;
  icon: string;
  onClick: () => void;
  isSelected?: boolean;
  canAfford?: boolean;
}

/**
 * 移动端塔楼选择面板
 * 支持水平滚动、按钮放大、触摸选择
 */
export class MobileTowerPanel extends Phaser.GameObjects.Container {
  private container: Phaser.GameObjects.Container;
  private buttons: Phaser.GameObjects.Container[] = [];
  private buttonMap: Map<string, Phaser.GameObjects.Container> = new Map();
  private panelMask: Phaser.Display.Masks.GeometryMask;

  private readonly buttonWidth = 80;
  private readonly buttonHeight = 80;
  private readonly buttonSpacing = 12;
  private readonly panelWidth = 600;
  private readonly panelHeight = 100;

  public selectCallback: ((key: string) => void) | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // 创建裁剪区域
    const maskGraphics = scene.add.graphics();
    maskGraphics.fillRect(x - this.panelWidth / 2, y - this.panelHeight / 2, this.panelWidth, this.panelHeight);
    this.panelMask = new Phaser.Display.Masks.GeometryMask(scene, maskGraphics);

    // 内部容器用于滚动
    this.container = scene.add.container(0, 0);
    this.container.setMask(this.panelMask);

    // 创建按钮
    this.createTowerButtons();

    this.add(this.container);
    this.setDepth(500);
  }

  private createTowerButtons(): void {
    const towerKeys = Object.keys(TOWERS);
    const totalWidth = towerKeys.length * (this.buttonWidth + this.buttonSpacing);
    const startX = -totalWidth / 2 + this.buttonWidth / 2;

    towerKeys.forEach((key, index) => {
      const tower = TOWERS[key];
      const btnX = startX + index * (this.buttonWidth + this.buttonSpacing);
      const btnY = 0;

      const button = this.createTowerButton(btnX, btnY, key, tower);
      this.container.add(button);
      this.buttons.push(button);
      this.buttonMap.set(key, button);
    });
  }

  private createTowerButton(x: number, y: number, key: string, tower: any): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // 按钮背景
    const bg = this.scene.add.graphics();
    container.add(bg);

    // 绘制默认状态
    this.drawButtonState(bg, false, false);

    // 塔楼图标（使用 emoji）
    const emojiMap: { [key: string]: string } = {
      pistol: '🔫',
      machinegun: '🔥',
      electric: '⚡',
      ice: '❄️',
      sentinel: '🏰',
      grenade: '💣'
    };

    const icon = this.scene.add.text(0, -15, emojiMap[key] || '🏠', {
      fontSize: '36px'
    }).setOrigin(0.5);
    container.add(icon);

    // 塔楼名称
    const nameText = this.scene.add.text(0, 10, tower.name, {
      fontSize: '11px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    container.add(nameText);

    // 价格
    const costText = this.scene.add.text(0, 25, `$${tower.cost}`, {
      fontSize: '12px',
      color: '#FFD700'
    }).setOrigin(0.5);
    container.add(costText);

    // 添加交互区域
    const hitArea = new Phaser.Geom.Rectangle(-this.buttonWidth / 2, -this.buttonHeight / 2, this.buttonWidth, this.buttonHeight);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    // 点击事件
    container.on('pointerdown', () => {
      this.onButtonPress(key);
    });

    // 存储引用以便更新状态
    (container as any).bg = bg;
    (container as any).key = key;

    return container;
  }

  private drawButtonState(bg: Phaser.GameObjects.Graphics, isSelected: boolean, canAfford: boolean): void {
    bg.clear();

    if (isSelected) {
      // 选中状态：绿色边框
      bg.fillStyle(0x228822, 0.9);
      bg.lineStyle(3, 0x00FF00, 1);
    } else if (!canAfford) {
      // 买不起状态：灰色
      bg.fillStyle(0x555555, 0.5);
      bg.lineStyle(2, 0x888888, 0.5);
    } else {
      // 默认状态：蓝色边框
      bg.fillStyle(0x222222, 0.8);
      bg.lineStyle(2, 0x666666, 0.8);
    }

    // 绘制圆角按钮
    bg.fillRoundedRect(-this.buttonWidth / 2, -this.buttonHeight / 2, this.buttonWidth, this.buttonHeight, 8);
    bg.strokeRoundedRect(-this.buttonWidth / 2, -this.buttonHeight / 2, this.buttonWidth, this.buttonHeight, 8);
  }

  private onButtonPress(key: string): void {
    // 调用回调
    // GameScene 会设置这个回调
    if ((this as any).buttonClickCallback) {
      (this as any).buttonClickCallback(key);
    }
  }

  /**
   * 设置按钮点击回调
   */
  public setButtonClickCallback(callback: (key: string) => void): void {
    (this as any).buttonClickCallback = callback;
  }

  /**
   * 更新按钮选中状态
   */
  public selectTower(key: string | null): void {
    this.buttons.forEach(btn => {
      const btnKey = (btn as any).key;
      const bg = (btn as any).bg as Phaser.GameObjects.Graphics;
      const isSelected = btnKey === key;
      this.drawButtonState(bg, isSelected, true);
    });
  }

  /**
   * 获取按钮
   */
  public getButton(key: string): Phaser.GameObjects.Container | undefined {
    return this.buttonMap.get(key);
  }

  /**
   * 销毁
   */
  public destroy(fromScene?: boolean): void {
    this.buttons.forEach(btn => btn.destroy(true));
    this.buttons = [];
    this.buttonMap.clear();
    this.panelMask.destroy();
    super.destroy(fromScene);
  }
}
