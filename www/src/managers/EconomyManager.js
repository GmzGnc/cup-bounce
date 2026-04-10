const BALLS_KEY      = 'cupbounce_balls';
const COINS_KEY      = 'cupbounce_coins';
const GEMS_KEY       = 'cupbounce_gems';
const BUILD_KEY      = 'cupbounce_build';
const VERSION_KEY    = 'cupbounce_v';
const LAST_REGEN_KEY = 'cupbounce_last_regen';
const DAILY_KEY      = 'cupbounce_daily';
const CURRENT_VER    = 3;

const DEFAULT_BALLS  = 100;
const DEFAULT_COINS  = 0;
const DEFAULT_GEMS   = 0;
const MAX_BALLS      = 100;
const REGEN_MS       = 2 * 60 * 1000;

const LEVEL_GEM_REWARDS = {
  10: 2,  20: 2,  30: 3,  40: 3,  50: 4,
  60: 4,  70: 5,  80: 5,  90: 6,  100: 6,
  110: 7, 120: 7, 130: 8, 140: 8, 150: 9,
  160: 9, 170: 10, 180: 10, 190: 11, 200: 11,
  210: 12, 220: 12, 230: 13, 240: 13, 250: 15
};

const SECTION_BALL_REWARD = 10;

// ── Modül-düzey cloud save kaydı ─────────────────────────────────────────────
// Tek bir CloudSaveManager + uid çifti tüm EconomyManager örnekleri için paylaşılır.
// GameScene.create() içinde EconomyManager.registerCloudSave(...) ile ayarlanır.
let _csm = null;   // CloudSaveManager instance
let _cuid = null;  // Firebase uid

export class EconomyManager {
  constructor() {
    const savedVer = parseInt(localStorage.getItem(VERSION_KEY) || '0', 10);
    if (savedVer < CURRENT_VER) {
      localStorage.setItem(BALLS_KEY, String(DEFAULT_BALLS));
      localStorage.setItem(VERSION_KEY, String(CURRENT_VER));
    }
    this._applyOfflineRegen();
  }

  _applyOfflineRegen() {
    const current = this.getBalls();
    if (current >= MAX_BALLS) {
      localStorage.setItem(LAST_REGEN_KEY, String(Date.now()));
      return;
    }
    const last = parseInt(localStorage.getItem(LAST_REGEN_KEY) || '0', 10);
    if (last === 0) {
      localStorage.setItem(LAST_REGEN_KEY, String(Date.now()));
      return;
    }
    const elapsed = Date.now() - last;
    const toAdd   = Math.floor(elapsed / REGEN_MS);
    if (toAdd > 0) {
      const newBalls  = Math.min(current + toAdd, MAX_BALLS);
      this.setBalls(newBalls);
      const remainder = elapsed % REGEN_MS;
      localStorage.setItem(LAST_REGEN_KEY, String(Date.now() - remainder));
    }
  }

  getSecondsToNextBall() {
    if (this.getBalls() >= MAX_BALLS) return 0;
    const last    = parseInt(localStorage.getItem(LAST_REGEN_KEY) || '0', 10);
    const elapsed = Date.now() - last;
    const remain  = REGEN_MS - (elapsed % REGEN_MS);
    return Math.ceil(remain / 1000);
  }

  getMaxBalls() { return MAX_BALLS; }

  claimDailyLogin() {
    const today = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem(DAILY_KEY);
    if (saved === today) return false;
    localStorage.setItem(DAILY_KEY, today);
    const newBalls = Math.min(this.getBalls() + 10, MAX_BALLS);
    this.setBalls(newBalls);
    return true;
  }

  onLevelComplete(levelId) {
    let gems  = 0;
    let balls = 0;
    if (LEVEL_GEM_REWARDS[levelId] !== undefined) {
      gems = LEVEL_GEM_REWARDS[levelId];
      this.addGems(gems);
    }
    if (levelId % 10 === 0) {
      balls = SECTION_BALL_REWARD;
      const newBalls = Math.min(this.getBalls() + balls, MAX_BALLS);
      this.setBalls(newBalls);
    }
    return { gems, balls };
  }

  getBalls() {
    const val = localStorage.getItem(BALLS_KEY);
    if (val === null) { this.setBalls(DEFAULT_BALLS); return DEFAULT_BALLS; }
    return parseInt(val, 10);
  }

  setBalls(count) {
    localStorage.setItem(BALLS_KEY, String(Math.max(0, Math.min(count, MAX_BALLS))));
    _triggerCloudSave();
  }

  spendBall() {
    const current = this.getBalls();
    if (current > 0) { this.setBalls(current - 1); return true; }
    return false;
  }

  hasBalls() { return this.getBalls() > 0; }
  reset()    { this.setBalls(DEFAULT_BALLS); }

  getCoins() {
    return parseInt(localStorage.getItem(COINS_KEY) || String(DEFAULT_COINS), 10);
  }
  setCoins(n)    { localStorage.setItem(COINS_KEY, String(Math.max(0, n))); _triggerCloudSave(); }
  addCoins(n)    { this.setCoins(this.getCoins() + n); }
  spendCoins(n)  { const c = this.getCoins(); if (c < n) return false; this.setCoins(c - n); return true; }
  hasCoins(n)    { return this.getCoins() >= n; }

  getGems() {
    return parseInt(localStorage.getItem(GEMS_KEY) || String(DEFAULT_GEMS), 10);
  }
  setGems(n)   { localStorage.setItem(GEMS_KEY, String(Math.max(0, n))); _triggerCloudSave(); }
  addGems(n)   { this.setGems(this.getGems() + n); }
  spendGems(n) { const c = this.getGems(); if (c < n) return false; this.setGems(c - n); return true; }
  hasGems(n)   { return this.getGems() >= n; }

  getUnlockedAreas() {
    try { return JSON.parse(localStorage.getItem(BUILD_KEY) || '[]'); }
    catch { return []; }
  }
  isAreaUnlocked(id)  { return this.getUnlockedAreas().includes(id); }
  unlockArea(id) {
    const areas = this.getUnlockedAreas();
    if (!areas.includes(id)) {
      areas.push(id);
      localStorage.setItem(BUILD_KEY, JSON.stringify(areas));
      _triggerCloudSave();
    }
  }
  getUnlockedCount() { return this.getUnlockedAreas().length; }

  // ── Cloud save statik API ──────────────────────────────────────────────────

  /**
   * GameScene.create() içinde çağrılır.
   * Tüm EconomyManager örnekleri bu kaydı paylaşır.
   * @param {CloudSaveManager} mgr
   * @param {string}           uid  Firebase uid
   */
  static registerCloudSave(mgr, uid) {
    _csm  = mgr;
    _cuid = uid;
  }

  /** Sahne kapanırken çağrılır — bekleyen kayıtları temizler. */
  static unregisterCloudSave() {
    if (_csm) _csm.cancelAutosave();
    _csm  = null;
    _cuid = null;
  }
}

// Modül-düzey yardımcı — class scope dışında tanımlanır
// çünkü sınıf metodları tarafından çağrılır (static değil)
function _triggerCloudSave() {
  if (_csm && _cuid) _csm.scheduleAutosave(_cuid);
}
