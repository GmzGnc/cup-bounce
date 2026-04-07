const BALLS_KEY   = 'cupbounce_balls';
const COINS_KEY   = 'cupbounce_coins';
const GEMS_KEY    = 'cupbounce_gems';
const BUILD_KEY   = 'cupbounce_build';    // unlocked area ids (JSON array)
const VERSION_KEY = 'cupbounce_v';
const CURRENT_VER = 2;          // bump to force a reset on next load

const DEFAULT_BALLS = 100;
const DEFAULT_COINS = 0;
const DEFAULT_GEMS  = 0;

export class EconomyManager {
  constructor() {
    // Version check: wipe stale ball count on first load after an update
    const savedVer = parseInt(localStorage.getItem(VERSION_KEY) || '0', 10);
    if (savedVer < CURRENT_VER) {
      localStorage.setItem(BALLS_KEY, String(DEFAULT_BALLS));
      localStorage.setItem(VERSION_KEY, String(CURRENT_VER));
      // Do NOT wipe coins / gems on version bump — only balls
    }
  }

  // ── Balls ──────────────────────────────────────────────────────────────────

  getBalls() {
    const val = localStorage.getItem(BALLS_KEY);
    if (val === null) {
      this.setBalls(DEFAULT_BALLS);
      return DEFAULT_BALLS;
    }
    return parseInt(val, 10);
  }

  setBalls(count) {
    localStorage.setItem(BALLS_KEY, String(Math.max(0, count)));
  }

  spendBall() {
    const current = this.getBalls();
    if (current > 0) { this.setBalls(current - 1); return true; }
    return false;
  }

  hasBalls() { return this.getBalls() > 0; }

  reset() { this.setBalls(DEFAULT_BALLS); }

  // ── Coins ──────────────────────────────────────────────────────────────────

  getCoins() {
    return parseInt(localStorage.getItem(COINS_KEY) || String(DEFAULT_COINS), 10);
  }

  setCoins(n) {
    localStorage.setItem(COINS_KEY, String(Math.max(0, n)));
  }

  addCoins(n) {
    this.setCoins(this.getCoins() + n);
  }

  spendCoins(n) {
    const c = this.getCoins();
    if (c < n) return false;
    this.setCoins(c - n);
    return true;
  }

  hasCoins(n) { return this.getCoins() >= n; }

  // ── Gems ───────────────────────────────────────────────────────────────────
  // Gems are a persistent premium currency — they do NOT reset on Game Over.

  getGems() {
    return parseInt(localStorage.getItem(GEMS_KEY) || String(DEFAULT_GEMS), 10);
  }

  setGems(n) {
    localStorage.setItem(GEMS_KEY, String(Math.max(0, n)));
  }

  addGems(n) {
    this.setGems(this.getGems() + n);
  }

  spendGems(n) {
    const c = this.getGems();
    if (c < n) return false;
    this.setGems(c - n);
    return true;
  }

  hasGems(n) { return this.getGems() >= n; }

  // ── Build areas ────────────────────────────────────────────────────────────
  // Stores an array of unlocked area ids in localStorage.

  getUnlockedAreas() {
    try {
      return JSON.parse(localStorage.getItem(BUILD_KEY) || '[]');
    } catch { return []; }
  }

  isAreaUnlocked(id) {
    return this.getUnlockedAreas().includes(id);
  }

  unlockArea(id) {
    const areas = this.getUnlockedAreas();
    if (!areas.includes(id)) {
      areas.push(id);
      localStorage.setItem(BUILD_KEY, JSON.stringify(areas));
    }
  }

  /** Returns total number of unlocked areas. */
  getUnlockedCount() {
    return this.getUnlockedAreas().length;
  }
}
