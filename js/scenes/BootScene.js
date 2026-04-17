class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    // Loading text
    const { width, height } = this.scale;
    const loadText = this.add.text(width / 2, height / 2, 'LOADING...', {
      fontSize: '32px',
      color: '#00FFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.load.image('player', 'gfx/player.png');
    this.load.image('enemy1', 'gfx/enemy1.png');
    this.load.image('enemy2', 'gfx/enemy2.png');
    this.load.image('enemy3', 'gfx/enemy3.png');
    this.load.image('background', 'gfx/background.png');
    this.load.image('logo', 'gfx/logo.png');
    this.load.image('wall', 'gfx/wall.png');
    this.load.image('bullet', 'gfx/bullet.png');
    this.load.image('icon', 'gfx/icon.png');

    this.load.on('complete', () => loadText.destroy());
    this.load.on('loaderror', (file) => console.warn('Asset load error:', file.key));
  }

  create() {
    this.scene.start('MenuScene');
  }
}
