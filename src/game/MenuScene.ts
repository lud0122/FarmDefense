import Phaser from 'phaser';
import { LEVELS } from '../config/levels';

export class MenuScene extends Phaser.Scene {
  private levelSelectorContainer!: Phaser.GameObjects.Container;
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // 背景
    this.createBackground();

    // 标题
    this.add.text(400, 80, '农场保卫战', {
      fontSize: '72px',
      color: '#FFD700',
      stroke: '#228B22',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(400, 160, 'Farm Defender', {
      fontSize: '32px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // 创建关卡选择器
    this.createLevelSelector();

    // 开始游戏按钮（从第1关开始）
    const startBtn = this.add.rectangle(400, 480, 200, 50, 0x4CAF50).setInteractive();
    this.add.text(400, 480, '从第1关开始', {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // 按钮交互
    startBtn.on('pointerover', () => {
      startBtn.setFillStyle(0x45a049);
      this.input.setDefaultCursor('pointer');
    });

    startBtn.on('pointerout', () => {
      startBtn.setFillStyle(0x4CAF50);
      this.input.setDefaultCursor('default');
    });

    startBtn.on('pointerdown', () => {
      this.startGame(0);
    });

    // 说明文字
    this.add.text(400, 560, '点击关卡直接跳转 | 🧠 = 智慧敌人模式', {
      fontSize: '16px',
      color: '#CCCCCC'
    }).setOrigin(0.5);
  }

  private createLevelSelector(): void {
    this.levelSelectorContainer = this.add.container(0, 0);

    const startY = 220;
    const buttonWidth = 140;
    const buttonHeight = 50;
    const spacing = 20;
    const cols = 3;

    LEVELS.forEach((level, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = 200 + col * (buttonWidth + spacing);
      const y = startY + row * (buttonHeight + spacing);

      // 按钮背景
      const btn = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x2196F3).setInteractive();
      btn.setStrokeStyle(2, 0xFFFFFF);

      // 关卡编号
      const levelNum = this.add.text(x, y - 10, `第${level.number}关`, {
        fontSize: '20px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 关卡名称
      const levelName = this.add.text(x, y + 12, level.name, {
        fontSize: '14px',
        color: '#FFE082'
      }).setOrigin(0.5);

      // Smart level indicator
      if (level.isSmartLevel) {
        const smartIcon = this.add.text(x + buttonWidth / 2 - 15, y - buttonHeight / 2 + 10, '🧠', {
          fontSize: '16px'
        }).setOrigin(0.5);
        this.levelSelectorContainer.add(smartIcon);
      }

      // 波次数
      const wavesText = this.add.text(x, y + 26, `${level.waves.length}波`, {
        fontSize: '12px',
        color: '#BBDEFB'
      }).setOrigin(0.5);

      // 按钮交互
      btn.on('pointerover', () => {
        btn.setFillStyle(0x1976D2);
        btn.setScale(1.05);
        levelNum.setScale(1.05);
        levelName.setScale(1.05);
        this.input.setDefaultCursor('pointer');
      });

      btn.on('pointerout', () => {
        btn.setFillStyle(0x2196F3);
        btn.setScale(1);
        levelNum.setScale(1);
        levelName.setScale(1);
        this.input.setDefaultCursor('default');
      });

      btn.on('pointerdown', () => {
        this.startGame(index);
      });

      this.levelSelectorContainer.add([btn, levelNum, levelName, wavesText]);
    });
  }

  private startGame(levelIndex: number): void {
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { startingLevel: levelIndex });
    });
  }

  private createBackground(): void {
    // 渐变背景
    const graphics = this.add.graphics();

    // 天空
    graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x228B22, 0x228B22);
    graphics.fillRect(0, 0, 800, 600);

    // 草地装饰
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(350, 600);
      graphics.fillStyle(0x2E8B57, 0.5);
      graphics.fillCircle(x, y, Phaser.Math.Between(5, 15));
    }
  }
}
