// ─── LeaderboardManager ───────────────────────────────────────────────────────
// Manages local score persistence and provides mock global leaderboard data.

const LOCAL_KEY  = 'cupbounce_scores';   // top-10 local scores
const MAX_LOCAL  = 10;

// ── Mock global players (stand-in until real backend is connected) ────────────
const MOCK_GLOBAL = [
  { name: 'CupMaster',    score: 18640, level: 28, isMe: false },
  { name: 'BounceKral',   score: 16200, level: 24, isMe: false },
  { name: 'AceShooter',   score: 14850, level: 22, isMe: false },
  { name: 'Nişancı47',    score: 13400, level: 20, isMe: false },
  { name: 'TopCi_Pro',    score: 11900, level: 18, isMe: false },
  { name: 'SlingSlayer',  score: 10250, level: 16, isMe: false },
  { name: 'BardakBoss',   score:  8800, level: 14, isMe: false },
  { name: 'QuickShot99',  score:  7350, level: 12, isMe: false },
  { name: 'CasualFan',    score:  5600, level:  9, isMe: false },
  { name: 'NewPlayer01',  score:  3200, level:  5, isMe: false },
];

const MOCK_WEEKLY = [
  { name: 'BounceKral',   score:  6800, level: 24, isMe: false },
  { name: 'Nişancı47',    score:  5950, level: 20, isMe: false },
  { name: 'TopCi_Pro',    score:  4700, level: 18, isMe: false },
  { name: 'AceShooter',   score:  4200, level: 22, isMe: false },
  { name: 'CupMaster',    score:  3900, level: 28, isMe: false },
  { name: 'SlingSlayer',  score:  3300, level: 16, isMe: false },
  { name: 'QuickShot99',  score:  2800, level: 12, isMe: false },
  { name: 'BardakBoss',   score:  2200, level: 14, isMe: false },
  { name: 'CasualFan',    score:  1750, level:  9, isMe: false },
  { name: 'NewPlayer01',  score:   980, level:  5, isMe: false },
];

const MOCK_FRIENDS = [
  { name: 'BounceKral',  score: 16200, level: 24, isMe: false },
  { name: 'Nişancı47',   score: 13400, level: 20, isMe: false },
  { name: 'TopCi_Pro',   score: 11900, level: 18, isMe: false },
  { name: 'CasualFan',   score:  5600, level:  9, isMe: false },
];

export class LeaderboardManager {
  // ── Local persistence ──────────────────────────────────────────────────────

  /** Save a score entry; keeps only top MAX_LOCAL entries. */
  saveScore(score, level) {
    if (!score || score <= 0) return;
    const entries = this.getLocalScores();
    const user    = this._getPlayerName();

    entries.push({ name: user, score, level, ts: Date.now() });
    entries.sort((a, b) => b.score - a.score);

    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries.slice(0, MAX_LOCAL)));
  }

  /** Returns locally stored top-10 score entries (sorted best first). */
  getLocalScores() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    } catch { return []; }
  }

  /** Best (highest) local score, or 0. */
  getBestScore() {
    const entries = this.getLocalScores();
    return entries.length ? entries[0].score : 0;
  }

  // ── Mock global data ───────────────────────────────────────────────────────

  /**
   * Returns a merged, ranked list of mock global players + the current player.
   * @param {'global'|'weekly'|'friends'} mode
   */
  getMockScores(mode = 'global') {
    const player    = this._playerEntry();
    const baseList  = mode === 'weekly'  ? [...MOCK_WEEKLY]
                    : mode === 'friends' ? [...MOCK_FRIENDS]
                    :                      [...MOCK_GLOBAL];

    // Inject current player
    const list = [...baseList, player];
    list.sort((a, b) => b.score - a.score);

    // Assign ranks
    return list.map((entry, i) => ({ ...entry, rank: i + 1 }));
  }

  /** Returns the current player's rank in the given mode list. */
  getCurrentPlayerRank(mode = 'global') {
    const list   = this.getMockScores(mode);
    const mine   = list.find(e => e.isMe);
    return mine ? mine.rank : list.length + 1;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  _getPlayerName() {
    try {
      const u = JSON.parse(localStorage.getItem('cupbounce_user') || 'null');
      return u ? u.displayName : 'Sen';
    } catch { return 'Sen'; }
  }

  _playerEntry() {
    return {
      name:  this._getPlayerName(),
      score: this.getBestScore() || 1200,
      level: parseInt(localStorage.getItem('cupbounce_player_level') || '1', 10),
      isMe:  true,
    };
  }

  /** Persist the highest level reached (called from GameScene). */
  saveLevel(level) {
    const current = parseInt(localStorage.getItem('cupbounce_player_level') || '1', 10);
    if (level > current) {
      localStorage.setItem('cupbounce_player_level', String(level));
    }
  }
}
