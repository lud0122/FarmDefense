import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.add.text(400, 300, '农场保卫战', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 360, 'Farm Defender', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
}
