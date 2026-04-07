// ─── MissionManager ───────────────────────────────────────────────────────────
// Daily missions. State is stored in localStorage keyed by today's date.
// When the date changes, all missions reset automatically.

const KEY = 'cupbounce_missions';

export const MISSIONS = [
  { id: 'shots',  label: '10 atış yap',      icon: '\uD83C\uDFF9', target: 10,  reward: { type: 'coin',  amount: 50  } },
  { id: 'scores', label: '3 bardağa gir',    icon: '\uD83C\uDFAF', target: 3,   reward: { type: 'coin',  amount: 100 } },
  { id: 'levels', label: '1 level tamamla',  icon: '\u2B50',       target: 1,   reward: { type: 'gem',   amount: 1   } },
  { id: 'points', label: '100 puan kazan',   icon: '\uD83D\uDCAF', target: 100, reward: { type: 'coin',  amount: 50  } },
  { id: 'login',  label: 'Günlük giriş',     icon: '\uD83D\uDCC5', target: 1,   reward: { type: 'balls', amount: 10  } },
];

export class MissionManager {
  constructor() {
    this._load();
  }

  _today() {
    return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  }

  _load() {
    try {
      const raw   = localStorage.getItem(KEY);
      const saved = raw ? JSON.parse(raw) : null;
      if (saved && saved.date === this._today()) {
        this._data = saved;
      } else {
        this._reset();
      }
    } catch {
      this._reset();
    }
  }

  _reset() {
    this._data = {
      date:     this._today(),
      missions: MISSIONS.map(m => ({
        id: m.id, progress: 0, completed: false, claimed: false
      }))
    };
    // Auto-complete the daily-login mission immediately
    const login = this._find('login');
    if (login) { login.progress = 1; login.completed = true; }
    this._save();
  }

  _save() {
    localStorage.setItem(KEY, JSON.stringify(this._data));
  }

  _find(id) {
    return this._data.missions.find(m => m.id === id);
  }

  /** Increment progress for a mission. Ignored if already completed. */
  increment(id, amount = 1) {
    const s   = this._find(id);
    const def = MISSIONS.find(m => m.id === id);
    if (!s || !def || s.completed) return;
    s.progress = Math.min(s.progress + amount, def.target);
    if (s.progress >= def.target) s.completed = true;
    this._save();
  }

  /**
   * Claim the reward for a completed mission.
   * Returns { type, amount } or null if not claimable.
   */
  claim(id) {
    const s = this._find(id);
    if (!s || !s.completed || s.claimed) return null;
    s.claimed = true;
    this._save();
    return MISSIONS.find(m => m.id === id)?.reward ?? null;
  }

  /** Returns merged mission def + state array. */
  getAll() {
    return MISSIONS.map(def => {
      const s = this._find(def.id) || { progress: 0, completed: false, claimed: false };
      return { ...def, progress: s.progress, completed: s.completed, claimed: s.claimed };
    });
  }

  /** True if any mission is completed but not yet claimed. */
  hasUnclaimed() {
    return this._data.missions.some(m => m.completed && !m.claimed);
  }
}
