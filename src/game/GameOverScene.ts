import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  private isVictory: boolean = false;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(): void {
    // 毛玻璃背景效果
    const bg = this.add.rectangle(400, 300, 800, 600);
    bg.setFillStyle(0x2E5339, 0.8);
    bg.setStrokeStyle(2, 0x7CB342, 0.5);

    if (this.isVictory) {
      // 胜利画面 - 金色主题
      this.add.text(400, 150, 'VICTORY', {
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '36px',
        color: '#FFD700',
        stroke: '#8B4513',
        strokeThickness: 4,
        shadow: {
          offsetX: 3,
          offsetY: 3,
          color: '#5D4037',
          blur: 6,
          fill: true
        }
      }).setOrigin(0.5);

      this.add.text(400, 220, '你成功保卫了农场！', {
        fontFamily: '"Quicksand", sans-serif',
        fontSize: '22px',
        color: '#E3F2FD'
      }).setOrigin(0.5);
    } else {
      // 失败画面 - 深红色主题
      this.add.text(400, 150, 'GAME OVER', {
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '36px',
        color: '#EF5350',
        stroke: '#5D4037',
        strokeThickness: 4,
        shadow: {
          offsetX: 3,
          offsetY: 3,
          color: '#2E5339',
          blur: 6,
          fill: true
        }
      }).setOrigin(0.5);

      this.add.text(400, 220, '敌人突破了防线...', {
        fontFamily: '"Quicksand", sans-serif',
        fontSize: '22px',
        color: '#BDBDBD'
      }).setOrigin(0.5);
    }

    // 重玩按钮 - 毛玻璃风格
    const replayBtn = this.add.rectangle(400, 330, 200, 55);
    replayBtn.setFillStyle(0xFFFFFF, 0.15);
    replayBtn.setStrokeStyle(2, 0x7CB342, 0.8);
    replayBtn.setInteractive();

    const replayText = this.add.text(400, 330, '再玩一次', {
      fontFamily: '"Quicksand", sans-serif',
      fontSize: '24px',
      fontStyle: '600',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // 菜单按钮 - 毛玻璃风格
    const menuBtn = this.add.rectangle(400, 410, 200, 55);
    menuBtn.setFillStyle(0xFFFFFF, 0.15);
    menuBtn.setStrokeStyle(2, 0x5DADE2, 0.8);
    menuBtn.setInteractive();

    const menuText = this.add.text(400, 410, '返回菜单', {
      fontFamily: '"Quicksand", sans-serif',
      fontSize: '24px',
      fontStyle: '600',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // 按钮交互
    this.setupButton(replayBtn, replayText);
    this.setupButton(menuBtn, menuText);

    replayBtn.on('pointerdown', () => {
      this.scene.restart();
    });

    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  private setupButton(btn: Phaser.GameObjects.Rectangle, text: Phaser.GameObjects.Text): void {
    btn.on('pointerover', () => {
      btn.setAlpha(0.25);
      btn.setStrokeStyle(3, 0xFFD700, 1);
      text.setScale(1.05);
      this.input.setDefaultCursor('pointer');
    });

    btn.on('pointerout', () => {
      btn.setAlpha(0.15);
      btn.setStrokeStyle(2, btn.strokeColor, 0.8);
      text.setScale(1);
      this.input.setDefaultCursor('default');
    });
  }

  public setVictory(victory: boolean): void {
    this.isVictory = victory;
  }
}
