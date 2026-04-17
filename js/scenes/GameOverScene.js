class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  init(data) {
    this.finalScore = data.score || 0;
    this.wave = data.wave || 1;
  }

  create() {
    const { width, height } = this.scale;

    if (this.textures.exists('background')) {
      const bg = this.add.image(width / 2, height / 2, 'background');
      bg.setDisplaySize(width, height);
      bg.setAlpha(0.4);
    }
    this.add.rectangle(0, 0, width, height, 0x0A0A1F, 0.6).setOrigin(0, 0);

    // Title
    this.add.text(width / 2, 80, 'GAME OVER', {
      fontSize: '56px',
      color: '#FF00FF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // High score check
    const isNewHigh = ScoreManager.setHighScore(this.finalScore);
    const hi = ScoreManager.getHighScore();

    if (isNewHigh) {
      const newRec = this.add.text(width / 2, 140, '★ NEW HIGH SCORE! ★', {
        fontSize: '28px',
        color: '#FFFF00',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.tweens.add({
        targets: newRec,
        scale: { from: 1, to: 1.2 },
        duration: 400,
        yoyo: true,
        repeat: -1
      });
    }

    // Score panel
    const panel = this.add.rectangle(width / 2, height / 2, 500, 220, 0x0A0A1F, 0.92);
    panel.setStrokeStyle(3, 0x00FFFF);

    this.add.text(width / 2, height / 2 - 70, 'SCORE', {
      fontSize: '22px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 30, this.finalScore.toLocaleString(), {
      fontSize: '56px',
      color: '#00FFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 30, `WAVE ${this.wave} 到達`, {
      fontSize: '20px',
      color: '#FF00FF'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 60, `HI-SCORE: ${hi.toLocaleString()}`, {
      fontSize: '20px',
      color: '#FFFF00'
    }).setOrigin(0.5);

    // Retry button
    const retryBtn = this.add.text(width / 2 - 120, height - 100, '↻ RETRY', {
      fontSize: '28px',
      color: '#FFFF00',
      fontStyle: 'bold',
      backgroundColor: '#4A00E0',
      padding: { x: 24, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retryBtn.on('pointerdown', () => {
      gameAudio.shoot();
      this.scene.start('GameScene');
    });

    // Share button
    const shareBtn = this.add.text(width / 2 + 120, height - 100, '✨ SHARE', {
      fontSize: '28px',
      color: '#0A0A1F',
      fontStyle: 'bold',
      backgroundColor: '#00FFFF',
      padding: { x: 24, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    shareBtn.on('pointerdown', () => {
      this.share();
    });

    // Menu
    const menuBtn = this.add.text(width / 2, height - 40, '← MENU', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#222244',
      padding: { x: 16, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  share() {
    const text = `ECHO BULLETで${this.finalScore.toLocaleString()}点獲得！WAVE ${this.wave}到達！ #エコーバレット #EchoBullet`;
    const url = location.href;
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(intent, '_blank');
  }
}
