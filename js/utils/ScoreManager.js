const ScoreManager = {
  calculateHitScore(reflectCount, chainCount) {
    const base = 100;
    const refMult = 1 + reflectCount * 0.5;
    const chainMult = 1 + chainCount * 0.3;
    return Math.floor(base * refMult * chainMult);
  },

  getHighScore() {
    return parseInt(localStorage.getItem(CONSTANTS.HIGHSCORE_KEY) || '0', 10);
  },

  setHighScore(score) {
    const prev = this.getHighScore();
    if (score > prev) {
      localStorage.setItem(CONSTANTS.HIGHSCORE_KEY, String(score));
      return true;
    }
    return false;
  }
};
