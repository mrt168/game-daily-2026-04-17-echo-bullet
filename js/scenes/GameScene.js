class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  create() {
    const { width, height } = this.scale;

    // Background
    if (this.textures.exists('background')) {
      const bg = this.add.image(width / 2, height / 2, 'background');
      bg.setDisplaySize(width, height);
    }

    this.score = 0;
    this.wave = 0;
    this.chainCount = 0;
    this.bulletsAlive = 0;
    this.hitsThisShot = 0;
    this.enemiesAlive = 0;
    this.gameOverFired = false;

    // Groups
    this.walls = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group();

    // Player turret at bottom center
    if (!this.textures.exists('player')) {
      this.turret = this.add.circle(width / 2, height - 50, 25, CONSTANTS.COLORS.CYAN);
    } else {
      this.turret = this.add.image(width / 2, height - 50, 'player');
      const tScale = Math.min(64 / this.turret.width, 64 / this.turret.height);
      this.turret.setScale(tScale);
    }

    // Aim line
    this.aimGraphics = this.add.graphics();

    // Start first wave
    this.spawnWave();

    // Timer
    this.timeLeft = CONSTANTS.WAVE_DURATION_MS;
    this.gameOverTimer = this.time.addEvent({
      delay: CONSTANTS.WAVE_DURATION_MS,
      callback: () => this.handleGameOver(),
      callbackScope: this
    });

    // UI
    this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
      fontSize: '24px',
      color: '#00FFFF',
      fontStyle: 'bold'
    });

    this.timerText = this.add.text(width - 20, 20, '30.0s', {
      fontSize: '24px',
      color: '#FFFF00',
      fontStyle: 'bold'
    }).setOrigin(1, 0);

    this.waveText = this.add.text(width / 2, 20, 'WAVE 1', {
      fontSize: '20px',
      color: '#FF00FF',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    // Input
    this.input.on('pointermove', (pointer) => {
      this.aimX = pointer.x;
      this.aimY = pointer.y;
    });

    this.input.on('pointerdown', (pointer) => {
      if (this.bulletsAlive > 0) return;
      gameAudio.init();
      this.fireBullet(pointer.x, pointer.y);
    });

    // Physics collisions
    this.physics.add.collider(this.bullets, this.walls, (bullet) => this.onBulletWall(bullet));
    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => this.onBulletEnemy(bullet, enemy));

    // World bounds
    this.physics.world.setBoundsCollision(true, true, true, true);
    this.physics.world.on('worldbounds', (body) => {
      const go = body.gameObject;
      if (go && go.isBullet) {
        go.reflectCount++;
        gameAudio.reflect();
        if (go.reflectCount >= CONSTANTS.MAX_REFLECTIONS) {
          this.destroyBullet(go);
        }
      }
    });
  }

  spawnWave() {
    this.wave++;
    const waveNum = this.wave;
    if (this.waveText) this.waveText.setText('WAVE ' + waveNum);

    const { width, height } = this.scale;

    // Clear existing walls/enemies to reset
    this.walls.clear(true, true);

    // Spawn walls depending on wave
    const patterns = ['horizontal', 'cross', 'diagonal'];
    const pattern = patterns[(waveNum - 1) % patterns.length];
    this.spawnWalls(pattern);

    // Spawn enemies
    const count = Math.min(3 + Math.floor(waveNum / 2), 8);
    for (let i = 0; i < count; i++) {
      this.spawnEnemy(width, height);
    }
    this.enemiesAlive = count;
  }

  spawnWalls(pattern) {
    const { width, height } = this.scale;
    const make = (x, y, w, h) => {
      const rect = this.add.rectangle(x, y, w, h, CONSTANTS.COLORS.PURPLE, 0.8);
      rect.setStrokeStyle(2, 0x9966FF);
      this.physics.add.existing(rect, true);
      this.walls.add(rect);
    };

    if (pattern === 'horizontal') {
      make(width / 2, 220, 300, 16);
    } else if (pattern === 'cross') {
      make(width / 2, 200, 240, 16);
      make(width / 2, 350, 16, 180);
    } else if (pattern === 'diagonal') {
      make(200, 250, 140, 16);
      make(width - 200, 250, 140, 16);
      make(width / 2, 380, 200, 16);
    }
  }

  spawnEnemy(width, height) {
    const margin = 80;
    const x = Phaser.Math.Between(margin, width - margin);
    const y = Phaser.Math.Between(80, height - 200);

    const types = ['enemy1', 'enemy2', 'enemy3'];
    const key = types[Phaser.Math.Between(0, 2)];

    let enemy;
    if (this.textures.exists(key)) {
      enemy = this.physics.add.image(x, y, key);
      const eScale = Math.min(48 / enemy.width, 48 / enemy.height);
      enemy.setScale(eScale);
    } else {
      enemy = this.physics.add.image(x, y, 'bullet');
      enemy.setTintFill(CONSTANTS.COLORS.MAGENTA);
      enemy.setScale(0.5);
    }

    enemy.setImmovable(true);
    const bodyRadius = Math.max(12, enemy.displayWidth / 2.4);
    enemy.body.setCircle(bodyRadius, (enemy.width - bodyRadius * 2) / 2, (enemy.height - bodyRadius * 2) / 2);
    enemy.setData('type', key);
    this.enemies.add(enemy);

    // Pulse tween
    this.tweens.add({
      targets: enemy,
      scale: { from: enemy.scale, to: enemy.scale * 1.1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  fireBullet(tx, ty) {
    gameAudio.shoot();
    this.hitsThisShot = 0;
    this.chainCount = 0;

    let bullet;
    if (this.textures.exists('bullet')) {
      bullet = this.physics.add.image(this.turret.x, this.turret.y - 20, 'bullet');
      const bScale = Math.min(24 / bullet.width, 24 / bullet.height);
      bullet.setScale(bScale);
    } else {
      bullet = this.physics.add.image(this.turret.x, this.turret.y - 20, 'icon');
      bullet.setTintFill(CONSTANTS.COLORS.CYAN);
      bullet.setScale(0.05);
    }

    bullet.reflectCount = 0;
    bullet.isBullet = true;
    const br = 8;
    bullet.body.setCircle(br, (bullet.width - br * 2) / 2, (bullet.height - br * 2) / 2);
    bullet.setCollideWorldBounds(true);
    bullet.body.onWorldBounds = true;
    bullet.setBounce(1, 1);

    const angle = Math.atan2(ty - bullet.y, tx - bullet.x);
    bullet.setVelocity(
      Math.cos(angle) * CONSTANTS.BULLET_SPEED,
      Math.sin(angle) * CONSTANTS.BULLET_SPEED
    );

    this.bullets.add(bullet);
    this.bulletsAlive++;

    // Bullet lifetime
    this.time.delayedCall(CONSTANTS.BULLET_LIFETIME_MS, () => {
      if (bullet && bullet.active) this.destroyBullet(bullet);
    });

    // Turret recoil
    this.tweens.add({
      targets: this.turret,
      scale: { from: (this.turret.scaleX || 0.5) * 1.15, to: this.turret.scaleX || 0.5 },
      duration: 200
    });

    // Screen flash
    this.cameras.main.flash(80, 0, 255, 255);
  }

  onBulletWall(bullet) {
    if (!bullet.active) return;
    bullet.reflectCount++;
    gameAudio.reflect();

    // Reflection flash
    const p = this.add.circle(bullet.x, bullet.y, 10, CONSTANTS.COLORS.CYAN, 0.8);
    this.tweens.add({
      targets: p,
      scale: 3,
      alpha: 0,
      duration: 300,
      onComplete: () => p.destroy()
    });

    this.cameras.main.shake(60, 0.004);

    if (bullet.reflectCount >= CONSTANTS.MAX_REFLECTIONS) {
      this.destroyBullet(bullet);
    }
  }

  onBulletEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;

    this.hitsThisShot++;
    this.chainCount++;

    const gained = ScoreManager.calculateHitScore(bullet.reflectCount, this.chainCount - 1);
    this.score += gained;
    this.scoreText.setText('SCORE: ' + this.score.toLocaleString());

    // Score popup
    const pop = this.add.text(enemy.x, enemy.y, '+' + gained, {
      fontSize: '20px',
      color: '#FFFF00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.tweens.add({
      targets: pop,
      y: pop.y - 60,
      alpha: 0,
      duration: 800,
      onComplete: () => pop.destroy()
    });

    // Explosion
    this.explodeAt(enemy.x, enemy.y);
    gameAudio.explode();

    enemy.destroy();
    this.enemiesAlive--;

    this.cameras.main.shake(100, 0.008);

    if (this.enemiesAlive <= 0) {
      // Perfect check - all killed with single bullet
      const perfect = this.bulletsAlive === 1;
      if (perfect && this.hitsThisShot >= 3) {
        this.score += 5000;
        this.scoreText.setText('SCORE: ' + this.score.toLocaleString());
        this.showPerfect();
        gameAudio.perfect();
      }

      this.time.delayedCall(600, () => {
        if (this.timeLeft > 0) this.spawnWave();
      });
    }
  }

  explodeAt(x, y) {
    for (let i = 0; i < 8; i++) {
      const ang = (Math.PI * 2 * i) / 8;
      const p = this.add.circle(x, y, 6, CONSTANTS.COLORS.MAGENTA, 1);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(ang) * 80,
        y: y + Math.sin(ang) * 80,
        alpha: 0,
        duration: 500,
        onComplete: () => p.destroy()
      });
    }
    const flash = this.add.circle(x, y, 24, CONSTANTS.COLORS.YELLOW, 0.9);
    this.tweens.add({
      targets: flash,
      scale: 3,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });
  }

  showPerfect() {
    const { width, height } = this.scale;
    const t = this.add.text(width / 2, height / 2, 'PERFECT!\n+5000', {
      fontSize: '64px',
      color: '#FFFF00',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    this.tweens.add({
      targets: t,
      scale: { from: 0.5, to: 1.3 },
      alpha: { from: 1, to: 0 },
      duration: 1200,
      onComplete: () => t.destroy()
    });
    this.cameras.main.flash(400, 255, 255, 0);
  }

  destroyBullet(bullet) {
    if (!bullet.active) return;
    bullet.destroy();
    this.bulletsAlive = Math.max(0, this.bulletsAlive - 1);
  }

  update(time, delta) {
    if (this.gameOverFired) return;
    this.timeLeft -= delta;
    if (this.timeLeft < 0) this.timeLeft = 0;
    this.timerText.setText((this.timeLeft / 1000).toFixed(1) + 's');
    if (this.timeLeft <= 0 && !this.gameOverFired) {
      this.handleGameOver();
    }

    // Draw aim line
    this.aimGraphics.clear();
    if (this.bulletsAlive === 0 && this.aimX !== undefined) {
      this.aimGraphics.lineStyle(2, CONSTANTS.COLORS.CYAN, 0.5);
      const x0 = this.turret.x;
      const y0 = this.turret.y - 20;
      const dx = this.aimX - x0;
      const dy = this.aimY - y0;
      const len = Math.hypot(dx, dy) || 1;
      this.aimGraphics.lineBetween(x0, y0, x0 + (dx / len) * 80, y0 + (dy / len) * 80);
    }
  }

  handleGameOver() {
    if (this.gameOverFired) return;
    this.gameOverFired = true;
    gameAudio.gameover();
    this.time.delayedCall(500, () => {
      this.scene.start('GameOverScene', { score: this.score, wave: this.wave });
    });
  }
}
