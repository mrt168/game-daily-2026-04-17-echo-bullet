class TutorialScene extends Phaser.Scene {
  constructor() { super({ key: 'TutorialScene' }); }

  create() {
    const { width, height } = this.scale;

    if (this.textures.exists('background')) {
      const bg = this.add.image(width / 2, height / 2, 'background');
      bg.setDisplaySize(width, height);
      bg.setAlpha(0.5);
    }

    this.add.rectangle(0, 0, width, height, 0x0a0a1f, 0.4).setOrigin(0, 0);

    this.stepIndex = 0;
    this.steps = [
      {
        title: 'STEP 1 — 照準',
        text: 'マウスを動かして狙いを定めよう',
        action: 'move',
        hint: '画面上で動かしてみよう'
      },
      {
        title: 'STEP 2 — ショット',
        text: 'クリック（タップ）で弾を発射！',
        action: 'click',
        hint: '画面をクリック/タップ'
      },
      {
        title: 'STEP 3 — 跳弾と連鎖',
        text: '弾は壁で跳ね返り、敵に連鎖爆発を起こす',
        action: 'observe',
        hint: '反射するほどスコア倍増！'
      },
      {
        title: 'STEP 4 — 目標',
        text: '30秒のタイムアタック！ハイスコアを狙おう',
        action: 'observe',
        hint: '準備はいい？'
      }
    ];

    this.showStep(0);
  }

  showStep(idx) {
    if (this.stepGroup) this.stepGroup.destroy(true);
    this.stepGroup = this.add.group();

    const { width, height } = this.scale;
    const s = this.steps[idx];

    const panel = this.add.rectangle(width / 2, height / 2, 620, 320, 0x0A0A1F, 0.92);
    panel.setStrokeStyle(3, 0x00FFFF);
    this.stepGroup.add(panel);

    const title = this.add.text(width / 2, height / 2 - 120, s.title, {
      fontSize: '28px',
      color: '#FF00FF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.stepGroup.add(title);

    const text = this.add.text(width / 2, height / 2 - 50, s.text, {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 580 }
    }).setOrigin(0.5);
    this.stepGroup.add(text);

    const hint = this.add.text(width / 2, height / 2 + 20, s.hint, {
      fontSize: '18px',
      color: '#FFFF00'
    }).setOrigin(0.5);
    this.stepGroup.add(hint);

    // Progress dots
    for (let i = 0; i < this.steps.length; i++) {
      const dot = this.add.circle(width / 2 - 45 + i * 30, height / 2 + 70, 8,
        i === idx ? 0x00FFFF : 0x666666);
      this.stepGroup.add(dot);
    }

    const btnText = idx === this.steps.length - 1 ? '▶ ゲーム開始' : '次へ →';
    const nextBtn = this.add.text(width / 2, height / 2 + 120, btnText, {
      fontSize: '28px',
      color: '#FFFF00',
      fontStyle: 'bold',
      backgroundColor: '#4A00E0',
      padding: { x: 30, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.stepGroup.add(nextBtn);

    this.tweens.add({
      targets: nextBtn,
      scale: { from: 1, to: 1.08 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    nextBtn.on('pointerdown', () => {
      gameAudio.shoot();
      this.nextStep();
    });
  }

  nextStep() {
    this.stepIndex++;
    if (this.stepIndex >= this.steps.length) {
      localStorage.setItem(CONSTANTS.TUTORIAL_KEY, 'true');
      this.scene.start('GameScene');
    } else {
      this.showStep(this.stepIndex);
    }
  }
}
