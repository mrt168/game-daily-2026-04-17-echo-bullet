// Web Audio API based SE generator
class GameAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
  }

  _beep(freq, duration, type = 'sine', gain = 0.1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.connect(g).connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  shoot() { this._beep(880, 0.08, 'square', 0.08); }
  reflect() { this._beep(1200, 0.05, 'triangle', 0.06); }
  explode() {
    this._beep(180, 0.3, 'sawtooth', 0.12);
    setTimeout(() => this._beep(80, 0.3, 'sine', 0.08), 50);
  }
  perfect() {
    [440, 554, 659, 880].forEach((f, i) => {
      setTimeout(() => this._beep(f, 0.25, 'sine', 0.15), i * 80);
    });
  }
  gameover() {
    [440, 330, 220].forEach((f, i) => {
      setTimeout(() => this._beep(f, 0.4, 'sine', 0.1), i * 200);
    });
  }
}

window.gameAudio = new GameAudio();
