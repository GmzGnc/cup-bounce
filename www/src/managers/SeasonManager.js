import { SEASONS } from '../data/seasons.js';

const POPUP_KEY = 'cupbounce_season_seen';
const BONUS_KEY = 'cupbounce_season_bonus';

export class SeasonManager {

  // ── Aktif sezonu döndür (yoksa null) ────────────────────────────────────────

  getActiveSeason() {
    const now = new Date();
    const y   = now.getFullYear();
    const m   = now.getMonth() + 1;  // 1-12
    const d   = now.getDate();

    for (const season of SEASONS) {
      if (season.dynamicDates) {
        for (const range of season.dynamicDates) {
          if (range.year === y &&
              this._inRange(m, d, range.startMonth, range.startDay, range.endMonth, range.endDay)) {
            return season;
          }
        }
      } else {
        if (this._inRange(m, d, season.startMonth, season.startDay, season.endMonth, season.endDay)) {
          return season;
        }
      }
    }
    return null;
  }

  /** getActiveSeason() için alias — konsol testinde kullanılabilir. */
  getCurrentSeason() { return this.getActiveSeason(); }

  /** Aktif sezonun tema renklerini döndür (yoksa null). */
  getTheme() {
    const s = this.getActiveSeason();
    return s ? s.theme : null;
  }

  /**
   * Debug: ID'ye göre sezonu zorla aktif et (sadece test için).
   * Örn: window.seasonManager.forceTestSeason('yaz')
   */
  forceTestSeason(id) {
    const s = SEASONS.find(s => s.id === id);
    if (!s) { console.warn('[Season] Bilinmeyen sezon id:', id, '— geçerli idler:', SEASONS.map(s=>s.id)); return null; }
    console.log('[Season] Test sezonu aktif:', s.name, s.icon);
    return s;
  }

  // ── Popup takibi ─────────────────────────────────────────────────────────────

  hasSeenPopup(seasonId) {
    try {
      const map = JSON.parse(localStorage.getItem(POPUP_KEY) || '{}');
      return map[seasonId] === true;
    } catch { return false; }
  }

  markPopupSeen(seasonId) {
    try {
      const map = JSON.parse(localStorage.getItem(POPUP_KEY) || '{}');
      map[seasonId] = true;
      localStorage.setItem(POPUP_KEY, JSON.stringify(map));
    } catch {}
  }

  // ── Bonus talep ──────────────────────────────────────────────────────────────

  /**
   * Sezon bonusunu talep et.
   * @returns {boolean} true = ilk kez talep edildi (ödül verilmeli), false = zaten alındı
   */
  claimBonus(seasonId) {
    const key = `${BONUS_KEY}_${seasonId}`;
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, '1');
    return true;
  }

  // ── Özel yardımcı ────────────────────────────────────────────────────────────

  /**
   * (m,d) tarihinin [sm/sd .. em/ed] aralığında olup olmadığını kontrol eder.
   * Yıl geçişini (Aralık–Ocak) da destekler.
   */
  _inRange(m, d, sm, sd, em, ed) {
    const cur   = m * 100 + d;
    const start = sm * 100 + sd;
    const end   = em * 100 + ed;

    if (start <= end) {
      return cur >= start && cur <= end;
    }
    // Yıl geçişi: örn. Aralık 1 – Ocak 7
    return cur >= start || cur <= end;
  }
}
