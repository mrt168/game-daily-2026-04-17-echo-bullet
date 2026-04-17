const GAME_CONFIG = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 600,
  backgroundColor: '#0A0A1F',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MenuScene, TutorialScene, GameScene, GameOverScene]
};

const CONSTANTS = {
  BULLET_SPEED: 700,
  MAX_REFLECTIONS: 10,
  BULLET_LIFETIME_MS: 6000,
  WAVE_DURATION_MS: 30000,
  TUTORIAL_KEY: 'echo_bullet_tutorial_done',
  HIGHSCORE_KEY: 'echo_bullet_highscore',
  COLORS: {
    CYAN: 0x00FFFF,
    MAGENTA: 0xFF00FF,
    YELLOW: 0xFFFF00,
    PURPLE: 0x4A00E0,
    DARK: 0x0A0A1F
  }
};

window.addEventListener('load', () => {
  new Phaser.Game(GAME_CONFIG);
});
