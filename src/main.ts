import Phaser from 'phaser';
import { BootScene } from './game/BootScene';
import { MenuScene } from './game/MenuScene';
import { GameScene } from './game/GameScene';
import { GameOverScene } from './game/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'app',
  backgroundColor: '#87CEEB',
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  }
};

const game = new Phaser.Game(config);

export default game;
