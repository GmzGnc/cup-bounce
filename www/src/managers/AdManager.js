// ─── AdManager ────────────────────────────────────────────────────────────────
// Mock ad system — swap _showMock() body for real SDK calls when integrating.
//
// Real AdMob config (fill when integrating @capacitor-community/admob):
//   appId:          'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX'
//   rewardedUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'  (rewarded video)
//   interstitialId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'  (interstitial)

const AD_WATCH_KEY = 'cupbounce_ad_watches'; // shop gem-reward counter

export class AdManager {
  /**
   * @param {Phaser.Scene} scene  — scene used to draw the mock overlay
   */
  constructor(scene) {
    this._scene = scene;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /** Rewarded ad (3 s mock). Calls onReward() after completion. */
  showRewardedAd(onReward) {
    this._showMock({ duration: 3, rewarded: true, onReward });
  }

  /** Interstitial ad (2 s mock). Calls onComplete() after dismissal. */
  showInterstitialAd(onComplete) {
    this._showMock({ duration: 2, rewarded: false, onComplete });
  }

  /**
   * Returns true if an interstitial should be shown.
   * Fires every 5 level-completions (level 5, 10, 15 …).
   */
  canShowInterstitial() {
    const level = this._scene.registry.get('level') ?? 1;
    return level > 0 && level % 5 === 0;
  }

  // ── Ad-watch counter (used by ShopScene for gem milestone) ─────────────────

  /** Total rewarded ads watched since last gem claim. */
  getAdWatches() {
    return parseInt(localStorage.getItem(AD_WATCH_KEY) || '0', 10);
  }

  /** Increment counter and return new total. */
  addAdWatch() {
    const n = this.getAdWatches() + 1;
    localStorage.setItem(AD_WATCH_KEY, String(n));
    return n;
  }

  /** Reset counter (call after gem milestone reward is given). */
  resetAdWatches() {
    localStorage.setItem(AD_WATCH_KEY, '0');
  }

  // ── Mock overlay ─────────────────────────────────────────────────────────────

  _showMock({ duration, rewarded, onReward, onComplete }) {
    const sc  = this._scene;
    const W   = sc.scale.width;
    const H   = sc.scale.height;
    const D   = 500; // above all existing depths
    const obs = [];
    const reg = (o) => { obs.push(o); return o; };
    const cleanup = () => obs.forEach(o => { try { o.destroy(); } catch {} });

    // ── Full-screen black overlay ──────────────────────────────────────────────
    reg(sc.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.97).setDepth(D));

    // ── "REKLAM" badge (top-right) ─────────────────────────────────────────────
    reg(sc.add.rectangle(W - 48, 16, 70, 20, 0x332200).setDepth(D + 1));
    reg(sc.add.text(W - 14, 16, 'REKLAM', {
      fontSize: '10px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffcc00'
    }).setOrigin(1, 0.5).setDepth(D + 2));

    // ── Mock advertiser placeholder ────────────────────────────────────────────
    reg(sc.add.rectangle(W / 2, H / 2 - 70, 310, 170, 0x0d0d20)
      .setDepth(D + 1).setStrokeStyle(1, 0x1e2a55));
    reg(sc.add.text(W / 2, H / 2 - 90, 'REKLAM', {
      fontSize: '32px', fontFamily: 'Arial', fontStyle: 'bold', color: '#1e2a55'
    }).setOrigin(0.5).setDepth(D + 2));
    reg(sc.add.text(W / 2, H / 2 - 48, '\u0130\u00e7eri\u011fi', {
      fontSize: '15px', fontFamily: 'Arial', color: '#1e2a55'
    }).setOrigin(0.5).setDepth(D + 2));

    // ── Status text ────────────────────────────────────────────────────────────
    const statusTxt = reg(sc.add.text(W / 2, H / 2 + 60, 'Reklam y\u00fckleniyor...', {
      fontSize: '16px', fontFamily: 'Arial', color: '#777777'
    }).setOrigin(0.5).setDepth(D + 1));

    // ── Countdown circle ───────────────────────────────────────────────────────
    reg(sc.add.circle(W / 2, H / 2 + 118, 30, 0x0a0a1e)
      .setDepth(D + 1).setStrokeStyle(2, 0x223366));
    const cdTxt = reg(sc.add.text(W / 2, H / 2 + 118, String(duration), {
      fontSize: '28px', fontFamily: 'Arial', fontStyle: 'bold', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(D + 2));

    // ── "Skip" hint for non-rewarded ──────────────────────────────────────────
    if (!rewarded) {
      reg(sc.add.text(W - 16, H - 26, 'Atla \u2192', {
        fontSize: '12px', fontFamily: 'Arial', color: '#333355'
      }).setOrigin(1, 0.5).setDepth(D + 1));
    }

    // ── Countdown timer ────────────────────────────────────────────────────────
    let remaining = duration;
    sc.time.addEvent({
      delay: 1000,
      repeat: duration - 1,
      callback: () => {
        remaining--;
        if (remaining <= 0) {
          // Finished
          cdTxt.setText('\u2714').setStyle({ color: '#44ff88', fontSize: '26px' });
          statusTxt.setText(rewarded ? '\u00d6d\u00fcl kazan\u0131ld\u0131!' : '')
            .setStyle({ color: '#44ff88', fontStyle: 'bold' });
          sc.time.delayedCall(700, () => {
            cleanup();
            if (rewarded && onReward)   onReward();
            if (!rewarded && onComplete) onComplete();
          });
        } else {
          cdTxt.setText(String(remaining));
        }
      }
    });
  }
}
