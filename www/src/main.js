import { BootScene    } from './scenes/BootScene.js';
import { AuthScene    } from './scenes/AuthScene.js';
import { GameScene    } from './scenes/GameScene.js';
import { UIScene      } from './scenes/UIScene.js';
import { ShopScene    } from './scenes/ShopScene.js';
import { MissionScene } from './scenes/MissionScene.js';
import { BuildScene      } from './scenes/BuildScene.js';
import { TutorialScene      } from './scenes/TutorialScene.js';
import { LeaderboardScene    } from './scenes/LeaderboardScene.js';
import { AppLifecycleManager } from './managers/AppLifecycleManager.js';

const config = {
  type: Phaser.AUTO,

  // Canvas size — iPhone 14 Pro viewport
  width:  390,
  height: 844,

  backgroundColor:    '#0a0a1a',
  disableContextMenu: true,

  // Scale to fill any screen while keeping aspect ratio centred
  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width:  390,
    height: 844
  },

  render: {
    powerPreference: 'high-performance',
    antialias:       false,
    roundPixels:     true,
  },

  // forceSetTimeOut: true — uses setTimeout instead of requestAnimationFrame.
  // On many Android WebViews, RAF is throttled or completely frozen when the
  // app returns from background; setTimeout survives this throttling.
  fps: {
    target:          60,
    forceSetTimeOut: true,
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // Per-body gravity is used instead (see Ball.js)
      debug:   false
    }
  },

  // Scene order: BootScene starts first, then GameScene + UIScene run together
  scene: [BootScene, AuthScene, TutorialScene, GameScene, UIScene, ShopScene, MissionScene, BuildScene, LeaderboardScene]
};

const game = new Phaser.Game(config);

// Pause/resume the game loop when the app goes to background and returns.
// Prevents timer drift and AudioContext stalls on foreground return.
// eslint-disable-next-line no-new
new AppLifecycleManager(game);
