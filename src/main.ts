import Phaser from 'phaser';
import { BootScene } from './game/BootScene';
import { GameScene } from './game/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'app',
  backgroundColor: '#87CEEB',
  scene: [BootScene, GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

const game = new Phaser.Game(config);

export default game;
