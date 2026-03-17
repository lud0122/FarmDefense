import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // 加载必要的资源
    // 暂时使用占位图形，后续替换为真实素材
    this.load.image('ground', 'assets/sprites/ground.png');
    this.load.image('tower-base', 'assets/sprites/tower-base.png');
  }

  create(): void {
    this.scene.start('MenuScene');
  }
}
