import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // 背景
    this.createBackground();

    // 标题
    this.add.text(400, 120, '农场保卫战', {
      fontSize: '72px',
      color: '#FFD700',
      stroke: '#228B22',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(400, 200, 'Farm Defender', {
      fontSize: '32px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // 开始游戏按钮
    const startBtn = this.add.rectangle(400, 320, 200, 60, 0x4CAF50).setInteractive();
    this.add.text(400, 320, '开始游戏', {
      fontSize: '28px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // 说明文字
    this.add.text(400, 450, '点击放置塔楼，保卫农场！', {
      fontSize: '18px',
      color: '#CCCCCC'
    }).setOrigin(0.5);

    this.add.text(400, 480, '防止敌人到达终点', {
      fontSize: '16px',
      color: '#AAAAAA'
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
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
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
