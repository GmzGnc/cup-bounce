// ─── CloudSaveManager ─────────────────────────────────────────────────────────
// @capacitor-firebase/firestore ile kullanıcı ilerlemesini buluta kaydeder
// ve yükler.
//
// Firestore döküman yolu: saves/{uid}
// Alanlar: level, balls, coins, gems, build, savedAt, v
//
// Yükleme stratejisi: local vs. cloud çakışmasında her alanda maksimumu alır
// (hangi cihazda ne kadar ilerleme varsa korunur).
//
// ── Firestore Güvenlik Kuralları (Firebase Console → Firestore → Rules) ────
//   rules_version = '2';
//   service cloud.firestore {
//     match /databases/{database}/documents {
//       match /saves/{userId} {
//         allow read, write: if request.auth != null
//                            && request.auth.uid == userId;
//       }
//     }
//   }
// ─────────────────────────────────────────────────────────────────────────────

const SAVE_VERSION    = 1;
const AUTOSAVE_DELAY  = 15_000; // ms — debounce süresi

// localStorage key'leri (EconomyManager ve LevelManager ile aynı)
const K_LEVEL = 'cupbounce_level';
const K_BALLS = 'cupbounce_balls';
const K_COINS = 'cupbounce_coins';
const K_GEMS  = 'cupbounce_gems';
const K_BUILD = 'cupbounce_build';

export class CloudSaveManager {
  constructor() {
    this._timer = null;
  }

  // ── Dahili ────────────────────────────────────────────────────────────────

  _db() {
    return window.Capacitor?.Plugins?.FirebaseFirestore ?? null;
  }

  _isNative() {
    return window.Capacitor?.isNativePlatform?.() ?? false;
  }

  _ref(uid) {
    return `saves/${uid}`;
  }

  // ── Public ────────────────────────────────────────────────────────────────

  /** Native platformda Firestore kullanılabilir mi? */
  isAvailable() {
    return this._isNative() && Boolean(this._db());
  }

  // ── Kaydet ────────────────────────────────────────────────────────────────

  /**
   * Anlık localStorage durumunu Firestore'a yazar.
   * @param {string} uid  Firebase kullanıcı UID'si
   * @returns {Promise<boolean>}
   */
  async save(uid) {
    const db = this._db();
    if (!db || !uid) return false;

    const snapshot = this._buildSnapshot();
    try {
      await db.setDocument({
        reference: this._ref(uid),
        data:      snapshot,
        merge:     false,
      });
      console.log('[CloudSave] Kaydedildi:', snapshot);
      return true;
    } catch (e) {
      console.warn('[CloudSave] Kayıt başarısız:', e);
      return false;
    }
  }

  /**
   * Debounced otomatik kayıt — AUTOSAVE_DELAY ms içinde en fazla 1 kez tetiklenir.
   * @param {string} uid
   * @param {number} [delay]
   */
  scheduleAutosave(uid, delay = AUTOSAVE_DELAY) {
    if (!this.isAvailable() || !uid) return;
    if (this._timer) clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this._timer = null;
      this.save(uid).catch(() => {});
    }, delay);
  }

  /** Bekleyen debounced save'i iptal et. */
  cancelAutosave() {
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
  }

  /**
   * Debounced save'i iptal edip hemen Firestore'a yazar.
   * Oyun kapanmadan veya sahne değişmeden önce çağrılmalı.
   * @param {string} uid
   */
  async flush(uid) {
    this.cancelAutosave();
    return this.save(uid);
  }

  // ── Yükle ─────────────────────────────────────────────────────────────────

  /**
   * Firestore'dan kullanıcı verisini okur, localStorage ile birleştirir.
   * Çakışmada her alanda maksimum değer korunur.
   * @param {string} uid
   * @returns {Promise<{level,balls,coins,gems}|null>}  Uygulanan değerler ya da null
   */
  async load(uid) {
    const db = this._db();
    if (!db || !uid) return null;

    try {
      const result = await db.getDocument({ reference: this._ref(uid) });
      const data   = result?.snapshot?.data;
      if (!data) {
        console.log('[CloudSave] Bulutta kayıt yok — yerel veriler korunuyor');
        return null;
      }
      const applied = this._mergeAndApply(data);
      console.log('[CloudSave] Yüklendi ve birleştirildi:', applied);
      return applied;
    } catch (e) {
      console.warn('[CloudSave] Yükleme başarısız:', e);
      return null;
    }
  }

  // ── Özel yardımcılar ──────────────────────────────────────────────────────

  /** Mevcut localStorage durumundan Firestore dökümanı oluşturur. */
  _buildSnapshot() {
    const get = (key, def) => localStorage.getItem(key) ?? def;
    return {
      level:   parseInt(get(K_LEVEL, '1'),   10),
      balls:   parseInt(get(K_BALLS, '100'), 10),
      coins:   parseInt(get(K_COINS, '0'),   10),
      gems:    parseInt(get(K_GEMS,  '0'),   10),
      build:   get(K_BUILD, '[]'),   // JSON string olarak sakla
      savedAt: Date.now(),
      v:       SAVE_VERSION,
    };
  }

  /**
   * Bulut verisini localStorage ile birleştirir; her alanda maksimumu alır.
   * @returns {{level,balls,coins,gems}}
   */
  _mergeAndApply(cloud) {
    const localLevel = parseInt(localStorage.getItem(K_LEVEL) || '1',   10);
    const localBalls = parseInt(localStorage.getItem(K_BALLS) || '100', 10);
    const localCoins = parseInt(localStorage.getItem(K_COINS) || '0',   10);
    const localGems  = parseInt(localStorage.getItem(K_GEMS)  || '0',   10);

    const level = Math.max(localLevel, cloud.level ?? 1);
    const balls = Math.max(localBalls, cloud.balls ?? 0);
    const coins = Math.max(localCoins, cloud.coins ?? 0);
    const gems  = Math.max(localGems,  cloud.gems  ?? 0);

    localStorage.setItem(K_LEVEL, String(level));
    localStorage.setItem(K_BALLS, String(balls));
    localStorage.setItem(K_COINS, String(coins));
    localStorage.setItem(K_GEMS,  String(gems));

    // Build: iki cihazın açtığı alanları birleştir
    try {
      const cloudBuild = typeof cloud.build === 'string'
        ? JSON.parse(cloud.build)
        : (Array.isArray(cloud.build) ? cloud.build : []);
      const localBuild = JSON.parse(localStorage.getItem(K_BUILD) || '[]');
      const merged     = [...new Set([...localBuild, ...cloudBuild])];
      localStorage.setItem(K_BUILD, JSON.stringify(merged));
    } catch {}

    return { level, balls, coins, gems };
  }
}
