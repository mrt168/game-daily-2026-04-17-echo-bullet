class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    const { width, height } = this.scale;

    // Background
    if (this.textures.exists('background')) {
      const bg = this.add.image(width / 2, height / 2, 'background');
      bg.setDisplaySize(width, height);
    }

    // Logo
    if (this.textures.exists('logo')) {
      const logo = this.add.image(width / 2, height / 2 - 120, 'logo');
      logo.setScale(0.8);
      this.tweens.add({
        targets: logo,
        scale: { from: 0.8, to: 0.9 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      this.add.text(width / 2, height / 2 - 120, 'ECHO BULLET', {
        fontSize: '64px',
        color: '#00FFFF',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    }

    // Subtitle
    this.add.text(width / 2, height / 2 + 10, 'エコーバレット', {
      fontSize: '28px',
      color: '#FF00FF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 50, '跳弾リフレクションシューター', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Play button
    const playBtn = this.add.text(width / 2, height / 2 + 140, '▶ PLAY', {
      fontSize: '48px',
      color: '#FFFF00',
      fontStyle: 'bold',
      backgroundColor: '#4A00E0',
      padding: { x: 40, y: 15 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: playBtn,
      scale: { from: 1, to: 1.08 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    playBtn.on('pointerdown', () => {
      gameAudio.init();
      gameAudio.shoot();
      const done = localStorage.getItem(CONSTANTS.TUTORIAL_KEY);
      if (done === 'true') {
        this.scene.start('GameScene');
      } else {
        this.scene.start('TutorialScene');
      }
    });

    // Tutorial replay button
    const tutBtn = this.add.text(width / 2, height / 2 + 220, '?\u3000チュートリアル', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#222244',
      padding: { x: 14, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    tutBtn.on('pointerdown', () => {
      gameAudio.init();
      this.scene.start('TutorialScene');
    });

    // HighScore display
    const hi = ScoreManager.getHighScore();
    this.add.text(width / 2, height - 30, `HI-SCORE: ${hi.toLocaleString()}`, {
      fontSize: '20px',
      color: '#00FFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }
}
