import Phaser from 'phaser';

export interface ToolbarButtonConfig {
  key: string;
  label: string;
  emoji: string;
  color: number;
  onClick: () => void;
}

/**
 * 移动端工具栏组件
 * 提供取消、射程切换、设置等快捷操作按钮
 */
export class MobileToolbar extends Phaser.GameObjects.Container {
  private buttons: Phaser.GameObjects.Container[] = [];
  private buttonMap: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor(scene: Phaser.Scene, x: number, y: number, private configs: ToolbarButtonConfig[]) {
    super(scene, x, y);

    this.createButtons();
  }

  private createButtons(): void {
    const buttonWidth = 70;
    const buttonHeight = 70;
    const spacing = 10;
    const totalWidth = this.configs.length * (buttonWidth + spacing) - spacing;

    this.configs.forEach((config, index) => {
      const btnX = (index * (buttonWidth + spacing)) - totalWidth / 2 + buttonWidth / 2;
      const btnY = 0;

      const button = this.createButton(btnX, btnY, buttonWidth, buttonHeight, config);
      this.add(button);
      this.buttons.push(button);
      this.buttonMap.set(config.key, button);
    });
  }

  private createButton(x: number, y: number, width: number, height: number, config: ToolbarButtonConfig): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // 按钮背景（圆角矩形）
    const bg = this.scene.add.graphics();
    bg.fillStyle(config.color, 0.8);
    bg.lineStyle(2, 0xFFFFFF, 0.5);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    bg.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);

    // 图标
    const icon = this.scene.add.text(0, -10, config.emoji, {
      fontSize: '32px'
    }).setOrigin(0.5);

    // 文字标签
    const label = this.scene.add.text(0, 15, config.label, {
      fontSize: '12px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    container.add([bg, icon, label]);
    container.setDepth(1000);

    // 触摸反馈 - 阻止事件冒泡到游戏场景
    bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      bg.clear();
      bg.fillStyle(0xFFFFFF, 0.3);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
      bg.fillStyle(config.color, 0.8);
      bg.fillRoundedRect(-width / 2 + 3, -height / 2 + 3, width - 6, height - 6, 8);
    });

    bg.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.resetButtonVisual(bg, width, height, config.color);
      config.onClick();
    });

    bg.on('pointerout', () => {
      this.resetButtonVisual(bg, width, height, config.color);
    });

    return container;
  }

  private resetButtonVisual(bg: Phaser.GameObjects.Graphics, width: number, height: number, color: number): void {
    bg.clear();
    bg.fillStyle(color, 0.8);
    bg.lineStyle(2, 0xFFFFFF, 0.5);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
  }

  /**
   * 根据key获取按钮
   */
  public getButton(key: string): Phaser.GameObjects.Container | undefined {
    return this.buttonMap.get(key);
  }

  /**
   * 设置按钮可见性
   */
  public setButtonVisible(key: string, visible: boolean): void {
    const button = this.buttonMap.get(key);
    if (button) {
      button.setVisible(visible);
    }
  }

  /**
   * 设置整个工具栏可见性
   */
  public setToolbarVisible(visible: boolean): void {
    this.setVisible(visible);
  }

  /**
   * 销毁所有组件
   */
  public destroy(fromScene?: boolean): void {
    this.buttons.forEach(btn => btn.destroy(true));
    this.buttons = [];
    this.buttonMap.clear();
    super.destroy(fromScene);
  }
}
