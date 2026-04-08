// ─── MissionManager ───────────────────────────────────────────────────────────
// Daily missions. State is stored in localStorage keyed by today's date.
// When the date changes, all missions reset automatically.

const KEY = 'cupbounce_missions';

export const MISSIONS = [
  { id: 'login',   label: 'Günlük giriş yap',        icon: '📅', target: 1,    reward: { type: 'balls', amount: 10 } },
  { id: 'shots',   label: '15 atış yap',              icon: '🏹', target: 15,   reward: { type: 'coin',  amount: 80 } },
  { id: 'scores',  label: '5 bardağa gir',            icon: '🎯', target: 5,    reward: { type: 'coin',  amount: 150 } },
  { id: 'levels',  label: '2 level tamamla',          icon: '⭐', target: 2,    reward: { type: 'gem',   amount: 1 } },
  { id: 'points',  label: '500 puan kazan',           icon: '💯', target: 500,  reward: { type: 'coin',  amount: 100 } },
  { id: 'red',     label: 'Kırmızı bardağa 3 gir',   icon: '🔴', target: 3,    reward: { type: 'coin',  amount: 120 } },
  { id: 'gem_cup', label: 'Gem bardağına 1 gir',      icon: '💎', target: 1,    reward: { type: 'gem',   amount: 2 } },
  { id: 'streak',  label: '3 ardışık isabet yap',     icon: '🔥', target: 3,    reward: { type: 'balls', amount: 5 } },
];

export class MissionManager {
  constructor() { this._load(); }

  _today() { return new Date().toISOString().slice(0, 10); }

  _load() {
    try {
      const raw   = localStorage.getItem(KEY);
      const saved = raw ? JSON.parse(raw) : null;
      if (saved && saved.date === this._today()) {
        this._data = saved;
      } else {
        this._reset();
      }
    } catch { this._reset(); }
  }

  _reset() {
    this._data = {
      date:     this._today(),
      missions: MISSIONS.map(m => ({ id: m.id, progress: 0, completed: false, claimed: false })),
      streak:   0   // ardışık isabet sayacı
    };
    const login = this._find('login');
    if (login) { login.progress = 1; login.completed = true; }
    this._save();
  }

  _save() { localStorage.setItem(KEY, JSON.stringify(this._data)); }
  _find(id) { return this._data.missions.find(m => m.id === id); }

  increment(id, amount = 1) {
    const s   = this._find(id);
    const def = MISSIONS.find(m => m.id === id);
    if (!s || !def || s.completed) return;
    s.progress = Math.min(s.progress + amount, def.target);
    if (s.progress >= def.target) s.completed = true;
    this._save();
  }

  /** Top bardağa girdiğinde çağır — streak takibi için */
  onScore(isGemCup = false) {
    this.increment('scores');
    if (isGemCup) this.increment('gem_cup');
    // streak
    this._data.streak = (this._data.streak || 0) + 1;
    if (this._data.streak >= 3) {
      this.increment('streak', 1);
      this._data.streak = 0;
    }
    this._save();
  }

  /** Top kaçtığında streak sıfırla */
  onMiss() {
    this._data.streak = 0;
    this._save();
  }

  claim(id) {
    const s = this._find(id);
    if (!s || !s.completed || s.claimed) return null;
    s.claimed = true;
    this._save();
    return MISSIONS.find(m => m.id === id)?.reward ?? null;
  }

  getAll() {
    return MISSIONS.map(def => {
      const s = this._find(def.id) || { progress: 0, completed: false, claimed: false };
      return { ...def, progress: s.progress, completed: s.completed, claimed: s.claimed };
    });
  }

  hasUnclaimed() {
    return this._data.missions.some(m => m.completed && !m.claimed);
  }

  /** Tamamlanan görev sayısı */
  completedCount() {
    return this._data.missions.filter(m => m.completed).length;
  }
}
