import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // 当前版本使用代码绘制图形，不依赖外部贴图资源
  }

  create(): void {
    this.scene.start('MenuScene');
  }
}
