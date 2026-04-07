// ─── BoosterManager ───────────────────────────────────────────────────────────
// Tracks active booster charges. Each booster has a remaining-use count stored
// in localStorage so they survive page reloads.
//
// Keys:
//   x2Score    — doubles cup points for the current level (uses = 1 level)
//   aimAssist  — enhanced aim-line, uses = shots remaining
//   slowMotion — slows cup movement for the current level (uses = 1 level)
//   extraLife  — absorbs 1 ball loss (uses = 1)

const KEY = 'cupbounce_boosters';

export class BoosterManager {
  constructor() {
    this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(KEY);
      this._s = raw ? JSON.parse(raw) : this._defaults();
    } catch {
      this._s = this._defaults();
    }
  }

  _defaults() {
    return { x2Score: 0, aimAssist: 0, slowMotion: 0, extraLife: 0 };
  }

  _save() {
    localStorage.setItem(KEY, JSON.stringify(this._s));
  }

  /** Add `amount` charges of a booster (called after purchase). */
  add(key, amount = 1) {
    if (!(key in this._s)) return;
    this._s[key] += amount;
    this._save();
  }

  /** Returns remaining charges for a key. */
  get(key) {
    return this._s[key] ?? 0;
  }

  /** True if the booster has at least 1 charge. */
  isActive(key) {
    return (this._s[key] ?? 0) > 0;
  }

  /** Consume 1 charge. Returns true if it was consumed. */
  consume(key) {
    if (!this.isActive(key)) return false;
    this._s[key]--;
    this._save();
    return true;
  }

  /** Consume ALL charges of a key (e.g. at level end for level-scoped boosters). */
  consumeAll(key) {
    this._s[key] = 0;
    this._save();
  }

  getAll() {
    return { ...this._s };
  }
}
