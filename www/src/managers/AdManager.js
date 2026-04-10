// ─── AdManager ────────────────────────────────────────────────────────────────
// @capacitor-community/admob entegrasyonu.
// Native platformda (Android/iOS) gerçek AdMob reklamları gösterir;
// tarayıcıda mock overlay ile geri düşer.
//
// TODO — Gerçek yayın için doldurulacaklar:
//   1. Aşağıdaki REAL_IDS değerlerini AdMob konsolundan alınan gerçek ID'lerle değiştir.
//   2. AndroidManifest.xml içindeki APPLICATION_ID meta-data değerini gerçek AppID ile değiştir.
//   3. USE_TEST_ADS sabitini false yap.
// ──────────────────────────────────────────────────────────────────────────────

// ── Reklam birimi ID'leri ─────────────────────────────────────────────────────

const USE_TEST_ADS = false;

const TEST_IDS = {
  rewarded:     'ca-app-pub-3940256099942544/5224354917',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
};

const REAL_IDS = {
  rewarded:     'ca-app-pub-8082697775286621/5507593721',
  interstitial: 'ca-app-pub-8082697775286621/6816805969',
};

// ── AdMob event adları (@capacitor-community/admob v4+) ──────────────────────

const EV_REWARDED_CLOSED   = 'onRewardedVideoAdClosed';
const EV_REWARDED_EARNED   = 'onRewarded';
const EV_INTERSTITIAL_CLOSED = 'onInterstitialAdClosed';

// ── LocalStorage anahtarı ────────────────────────────────────────────────────

const AD_WATCH_KEY = 'cupbounce_ad_watches';

// ─────────────────────────────────────────────────────────────────────────────

export class AdManager {
  /**
   * @param {Phaser.Scene} scene  — overlay çizmek için kullanılan sahne
   */
  constructor(scene) {
    this._scene              = scene;
    this._initialized        = false;
    this._interstitialReady  = false;
    this._ids                = USE_TEST_ADS ? TEST_IDS : REAL_IDS;

    this._init();
  }

  // ── Dahili yardımcılar ────────────────────────────────────────────────────

  _sdk() {
    return window.Capacitor?.Plugins?.AdMob ?? null;
  }

  _isNative() {
    return window.Capacitor?.isNativePlatform?.() ?? false;
  }

  // ── Başlatma ──────────────────────────────────────────────────────────────

  async _init() {
    const sdk = this._sdk();
    if (!this._isNative() || !sdk) return;

    try {
      await sdk.initialize({
        requestTrackingAuthorization: false, // iOS ATT — gerek yoksa false
        initializeForTesting: USE_TEST_ADS,
      });
      this._initialized = true;
      console.log('[AdManager] AdMob initialized');
      this._preloadInterstitial();
    } catch (e) {
      console.warn('[AdManager] initialize error:', e);
    }
  }

  // ── Interstitial ön yükleme ────────────────────────────────────────────────

  async _preloadInterstitial() {
    const sdk = this._sdk();
    if (!sdk || !this._initialized || this._interstitialReady) return;

    try {
      await sdk.prepareInterstitial({ adId: this._ids.interstitial });
      this._interstitialReady = true;
      console.log('[AdManager] Interstitial preloaded');
    } catch (e) {
      console.warn('[AdManager] interstitial preload error:', e);
      this._interstitialReady = false;
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Rewarded video. Ödül kazanıldığında onReward() çağrılır. */
  async showRewardedAd(onReward) {
    const sdk = this._sdk();
    if (!this._isNative() || !sdk || !this._initialized) {
      this._showMock({ duration: 3, rewarded: true, onReward });
      return;
    }

    try {
      await sdk.prepareRewardVideoAd({ adId: this._ids.rewarded });

      let earned = false;

      const lReward  = await sdk.addListener(EV_REWARDED_EARNED, () => {
        earned = true;
        this.addAdWatch();
      });
      const lClosed  = await sdk.addListener(EV_REWARDED_CLOSED, () => {
        lReward.remove();
        lClosed.remove();
        if (earned && onReward) onReward();
      });

      await sdk.showRewardVideoAd();
    } catch (e) {
      console.warn('[AdManager] rewarded error — falling back to mock:', e);
      this._showMock({ duration: 3, rewarded: true, onReward });
    }
  }

  /**
   * Interstitial. Kapatıldığında onComplete() çağrılır.
   * Önceden yüklenmediyse o an yükler.
   */
  async showInterstitialAd(onComplete) {
    const sdk = this._sdk();
    if (!this._isNative() || !sdk || !this._initialized) {
      this._showMock({ duration: 2, rewarded: false, onComplete });
      return;
    }

    try {
      if (!this._interstitialReady) {
        await sdk.prepareInterstitial({ adId: this._ids.interstitial });
        this._interstitialReady = true;
      }

      const lClosed = await sdk.addListener(EV_INTERSTITIAL_CLOSED, () => {
        lClosed.remove();
        this._interstitialReady = false;
        this._preloadInterstitial(); // sonraki reklam için hemen yükle
        if (onComplete) onComplete();
      });

      await sdk.showInterstitial();
      this._interstitialReady = false;
    } catch (e) {
      console.warn('[AdManager] interstitial error — falling back to mock:', e);
      this._showMock({ duration: 2, rewarded: false, onComplete });
    }
  }

  /**
   * Her 5 level tamamlandığında interstitial gösterilmeli mi?
   * (5, 10, 15 … levellerinde true döner)
   */
  canShowInterstitial() {
    const level = this._scene.registry.get('level') ?? 1;
    return level > 0 && level % 5 === 0;
  }

  // ── Ad-watch sayacı (ShopScene gem milestone için) ────────────────────────

  getAdWatches() {
    return parseInt(localStorage.getItem(AD_WATCH_KEY) || '0', 10);
  }

  addAdWatch() {
    const n = this.getAdWatches() + 1;
    localStorage.setItem(AD_WATCH_KEY, String(n));
    return n;
  }

  resetAdWatches() {
    localStorage.setItem(AD_WATCH_KEY, '0');
  }

  // ── Mock overlay (tarayıcı / SDK hazır değilken) ─────────────────────────

  _showMock({ duration, rewarded, onReward, onComplete }) {
    const sc  = this._scene;
    const W   = sc.scale.width;
    const H   = sc.scale.height;
    const D   = 500;
    const obs = [];
    const reg = (o) => { obs.push(o); return o; };
    const cleanup = () => obs.forEach(o => { try { o.destroy(); } catch {} });

    reg(sc.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.97).setDepth(D));

    reg(sc.add.rectangle(W - 48, 16, 70, 20, 0x332200).setDepth(D + 1));
    reg(sc.add.text(W - 14, 16, 'REKLAM', {
      fontSize: '10px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffcc00'
    }).setOrigin(1, 0.5).setDepth(D + 2));

    reg(sc.add.rectangle(W / 2, H / 2 - 70, 310, 170, 0x0d0d20)
      .setDepth(D + 1).setStrokeStyle(1, 0x1e2a55));
    reg(sc.add.text(W / 2, H / 2 - 90, 'REKLAM', {
      fontSize: '32px', fontFamily: 'Arial', fontStyle: 'bold', color: '#1e2a55'
    }).setOrigin(0.5).setDepth(D + 2));
    reg(sc.add.text(W / 2, H / 2 - 48, 'İçeriği', {
      fontSize: '15px', fontFamily: 'Arial', color: '#1e2a55'
    }).setOrigin(0.5).setDepth(D + 2));

    const statusTxt = reg(sc.add.text(W / 2, H / 2 + 60, 'Reklam yükleniyor...', {
      fontSize: '16px', fontFamily: 'Arial', color: '#777777'
    }).setOrigin(0.5).setDepth(D + 1));

    reg(sc.add.circle(W / 2, H / 2 + 118, 30, 0x0a0a1e)
      .setDepth(D + 1).setStrokeStyle(2, 0x223366));
    const cdTxt = reg(sc.add.text(W / 2, H / 2 + 118, String(duration), {
      fontSize: '28px', fontFamily: 'Arial', fontStyle: 'bold', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(D + 2));

    if (!rewarded) {
      reg(sc.add.text(W - 16, H - 26, 'Atla →', {
        fontSize: '12px', fontFamily: 'Arial', color: '#333355'
      }).setOrigin(1, 0.5).setDepth(D + 1));
    }

    let remaining = duration;
    sc.time.addEvent({
      delay: 1000,
      repeat: duration - 1,
      callback: () => {
        remaining--;
        if (remaining <= 0) {
          cdTxt.setText('✔').setStyle({ color: '#44ff88', fontSize: '26px' });
          statusTxt.setText(rewarded ? 'Ödül kazanıldı!' : '')
            .setStyle({ color: '#44ff88', fontStyle: 'bold' });
          sc.time.delayedCall(700, () => {
            cleanup();
            if (rewarded) { this.addAdWatch(); if (onReward) onReward(); }
            else          { if (onComplete) onComplete(); }
          });
        } else {
          cdTxt.setText(String(remaining));
        }
      }
    });
  }
}
