import Phaser from 'phaser';
import { LEVELS } from '../config/levels';

export class MenuScene extends Phaser.Scene {
  private levelSelectorContainer!: Phaser.GameObjects.Container;
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // 启动农场背景场景作为底层
    this.scene.launch('FarmBackgroundScene');
    this.scene.sendToBack('FarmBackgroundScene');

    // 主标题 - 像素风 + 金色光晕
    this.add.text(400, 80, '农场保卫战', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '48px',
      color: '#FFD700',
      stroke: '#4A7C59',
      strokeThickness: 4,
      shadow: {
        offsetX: 4,
        offsetY: 4,
        color: '#2E5339',
        blur: 8,
        fill: true
      }
    }).setOrigin(0.5);

    // 副标题 - 科技感字体
    this.add.text(400, 150, 'FARM DEFENDER', {
      fontFamily: '"Orbitron", monospace',
      fontSize: '28px',
      fontStyle: '700',
      color: '#E3F2FD',
      letterSpacing: 8
    }).setOrigin(0.5);

    // 装饰线
    const lineLeft = this.add.graphics();
    lineLeft.lineStyle(2, 0xFFD700, 0.6);
    lineLeft.lineBetween(150, 155, 350, 155);

    const lineRight = this.add.graphics();
    lineRight.lineStyle(2, 0xFFD700, 0.6);
    lineRight.lineBetween(450, 155, 650, 155);

    // 创建关卡选择器
    this.createLevelSelector();

    // 开始游戏按钮（从第1关开始）- 毛玻璃风格
    const startBtnBg = this.add.rectangle(400, 470, 220, 60, 0xFFFFFF);
    startBtnBg.setAlpha(0.15);
    startBtnBg.setStrokeStyle(2, 0x7CB342, 0.8);
    startBtnBg.setInteractive();

    const startBtnText = this.add.text(400, 470, '开始游戏', {
      fontFamily: '"Quicksand", sans-serif',
      fontSize: '24px',
      fontStyle: '700',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // 按钮交互 - 毛玻璃效果
    startBtnBg.on('pointerover', () => {
      startBtnBg.setAlpha(0.25);
      startBtnBg.setStrokeStyle(3, 0xFFD700, 1);
      startBtnText.setScale(1.05);
      this.input.setDefaultCursor('pointer');
    });

    startBtnBg.on('pointerout', () => {
      startBtnBg.setAlpha(0.15);
      startBtnBg.setStrokeStyle(2, 0x7CB342, 0.8);
      startBtnText.setScale(1);
      this.input.setDefaultCursor('default');
    });

    startBtnBg.on('pointerdown', () => {
      this.startGame(0);
    });

    // 说明文字背景 - 避免与农场重叠
    const hintBg = this.add.rectangle(400, 575, 460, 35, 0x1A1A2E);
    hintBg.setAlpha(0.85);
    
    // 说明文字
    this.add.text(400, 575, '🧠 = 智慧敌人模式  |  🎯 策略塔防', {
      fontFamily: '"Quicksand", sans-serif',
      fontSize: '14px',
      color: '#BDBDBD'
    }).setOrigin(0.5);
  }

  private createLevelSelector(): void {
    // 区块标题 - 像素风格
    this.add.text(400, 180, '选择关卡', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    this.levelSelectorContainer = this.add.container(0, 0);

    const startY = 210;
    const buttonWidth = 140;
    const buttonHeight = 50;
    const spacing = 20;
    const cols = 3;

    LEVELS.forEach((level, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = 200 + col * (buttonWidth + spacing);
      const y = startY + row * (buttonHeight + spacing);

      // 按钮背景 - 毛玻璃风格
      const btn = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0xFFFFFF);
      btn.setAlpha(0.12);
      btn.setInteractive();
      btn.setStrokeStyle(1, 0x7CB342, 0.5);

      // 关卡编号 - 使用现代字体
      const levelNum = this.add.text(x, y - 10, `${level.number}`, {
        fontFamily: '"Orbitron", monospace',
        fontSize: '22px',
        color: '#7CB342',
        fontStyle: '700'
      }).setOrigin(0.5);

      // 关卡名称
      const levelName = this.add.text(x, y + 12, level.name, {
        fontFamily: '"Quicksand", sans-serif',
        fontSize: '12px',
        fontStyle: '500',
        color: '#E3F2FD'
      }).setOrigin(0.5);

      // Smart level indicator
      if (level.isSmartLevel) {
        const smartIcon = this.add.text(x + buttonWidth / 2 - 15, y - buttonHeight / 2 + 10, '🧠', {
          fontSize: '16px'
        }).setOrigin(0.5);
        this.levelSelectorContainer.add(smartIcon);
      }

      // 波次数 - 小字
      const wavesText = this.add.text(x, y + 26, `${level.waves.length}波`, {
        fontFamily: '"Quicksand", sans-serif',
        fontSize: '10px',
        color: '#FFD700'
      }).setOrigin(0.5);

      // 按钮交互 - 毛玻璃风格
      btn.on('pointerover', () => {
        btn.setAlpha(0.25);
        btn.setStrokeStyle(2, 0xFFD700, 1);
        btn.setScale(1.05);
        levelNum.setScale(1.05);
        levelName.setScale(1.05);
        levelNum.setColor('#FFD700');
        this.input.setDefaultCursor('pointer');
      });

      btn.on('pointerout', () => {
        btn.setAlpha(0.12);
        btn.setStrokeStyle(1, 0x7CB342, 0.5);
        btn.setScale(1);
        levelNum.setScale(1);
        levelName.setScale(1);
        levelNum.setColor('#7CB342');
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
      this.scene.stop('FarmBackgroundScene');
      this.scene.start('GameScene', { startingLevel: levelIndex });
    });
  }
}
