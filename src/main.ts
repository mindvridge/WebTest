import Phaser from 'phaser';
import { GAME_CONFIG } from './config/GameConfig';
import { LoginScene } from './scenes/LoginScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.backgroundColor,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [MenuScene, LoginScene, GameScene, UIScene],
  fps: {
    target: GAME_CONFIG.targetFPS,
    forceSetTimeOut: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    min: {
      width: 320,
      height: 180
    },
    max: {
      width: 1920,
      height: 1080
    }
  },
  dom: {
    createContainer: true
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true
  }
};

const game = new Phaser.Game(config);

export default game;
