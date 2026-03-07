import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  private isVictory: boolean = false;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(): void {
    // 半透明背景
    const bg = this.add.rectangle(400, 300, 800, 600, 0x000000);
    bg.setAlpha(0.7);

    if (this.isVictory) {
      // 胜利画面
      this.add.text(400, 150, '🎉 胜利！🎉', {
        fontSize: '64px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);

      this.add.text(400, 240, '你成功保卫了农场！', {
        fontSize: '28px',
        color: '#FFFFFF'
      }).setOrigin(0.5);
    } else {
      // 失败画面
      this.add.text(400, 150, '游戏结束', {
        fontSize: '64px',
        color: '#FF0000',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);

      this.add.text(400, 240, '敌人突破了防线...', {
        fontSize: '28px',
        color: '#CCCCCC'
      }).setOrigin(0.5);
    }

    // 重玩按钮
    const replayBtn = this.add.rectangle(400, 350, 200, 60, 0x4CAF50).setInteractive();
    this.add.text(400, 350, '再玩一次', {
      fontSize: '28px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // 菜单按钮
    const menuBtn = this.add.rectangle(400, 430, 200, 60, 0x2196F3).setInteractive();
    this.add.text(400, 430, '返回菜单', {
      fontSize: '28px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // 按钮交互
    this.setupButton(replayBtn);
    this.setupButton(menuBtn);

    replayBtn.on('pointerdown', () => {
      this.scene.restart();
    });

    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  private setupButton(btn: Phaser.GameObjects.Rectangle): void {
    const originalColor = btn.fillColor;
    btn.on('pointerover', () => {
      const hoverColor = originalColor === 0x4CAF50 ? 0x45a049 : 0x1976D2;
      btn.setFillStyle(hoverColor);
      this.input.setDefaultCursor('pointer');
    });

    btn.on('pointerout', () => {
      btn.setFillStyle(originalColor);
      this.input.setDefaultCursor('default');
    });
  }

  public setVictory(victory: boolean): void {
    this.isVictory = victory;
  }
}
