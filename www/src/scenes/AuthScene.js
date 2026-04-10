import { TutorialScene }      from './TutorialScene.js';
import { NotificationManager } from '../managers/NotificationManager.js';
import { FirebaseManager }     from '../managers/FirebaseManager.js';

const USER_KEY = 'cupbounce_user';

export class AuthScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AuthScene' });
  }

  create() {
    this.firebase = new FirebaseManager();
    this._busy    = false;   // buton kilidi (işlem devam ederken çift tıklamayı engelle)

    const W = this.scale.width;
    const H = this.scale.height;

    // ── Background ────────────────────────────────────────────────────────────
    this.add.rectangle(W / 2, H / 2, W, H, 0x07071a);

    // Animated stars
    for (let i = 0; i < 90; i++) {
      const sx    = Phaser.Math.Between(0, W);
      const sy    = Phaser.Math.Between(0, H);
      const sz    = Phaser.Math.FloatBetween(0.5, 2.0);
      const baseA = Phaser.Math.FloatBetween(0.2, 0.8);
      const star  = this.add.circle(sx, sy, sz, 0xffffff, baseA);
      this.tweens.add({
        targets: star, alpha: baseA * Phaser.Math.FloatBetween(0.1, 0.3),
        duration: Phaser.Math.Between(800, 3000),
        yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
        ease: 'Sine.easeInOut'
      });
    }

    // ── Logo ──────────────────────────────────────────────────────────────────
    const glowR = this.add.rectangle(W / 2, H / 2 - 200, 280, 140, 0x112299, 0.22);
    this.tweens.add({
      targets: glowR, alpha: 0.08,
      duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    this.add.text(W / 2, H / 2 - 245, 'CUP', {
      fontSize: '72px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffffff', stroke: '#1133ee', strokeThickness: 9
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 - 168, 'BOUNCE', {
      fontSize: '48px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#4d8fff', stroke: '#000033', strokeThickness: 6
    }).setOrigin(0.5);

    // Separator line under logo
    const lineGfx = this.add.graphics();
    lineGfx.lineStyle(2, 0x3355ff, 0.6);
    lineGfx.beginPath()
      .moveTo(W / 2 - 90, H / 2 - 128)
      .lineTo(W / 2 + 90, H / 2 - 128)
      .strokePath();

    // ── Card panel ────────────────────────────────────────────────────────────
    const cardY  = H / 2 + 30;
    const cardH  = 280;
    this.add.rectangle(W / 2, cardY, 330, cardH, 0x0d1235, 0.97)
      .setStrokeStyle(2, 0x2244aa);

    this.add.text(W / 2, cardY - cardH / 2 + 32, 'Giriş Yap', {
      fontSize: '22px', fontFamily: 'Arial', fontStyle: 'bold', color: '#dde8ff'
    }).setOrigin(0.5);

    this.add.text(W / 2, cardY - cardH / 2 + 60, 'Devam etmek için bir seçenek belirle', {
      fontSize: '13px', fontFamily: 'Arial', color: '#445577'
    }).setOrigin(0.5);

    // Separator inside card
    const sep = this.add.graphics();
    sep.lineStyle(1, 0x1e2f66, 0.9)
      .beginPath()
      .moveTo(W / 2 - 140, cardY - cardH / 2 + 76)
      .lineTo(W / 2 + 140, cardY - cardH / 2 + 76)
      .strokePath();

    // ── Google button ─────────────────────────────────────────────────────────
    const gBtnY = cardY - 50;
    const gBtn  = this.add.rectangle(W / 2, gBtnY, 280, 52, 0x1a237e)
      .setStrokeStyle(2, 0x5c6bc0)
      .setInteractive({ useHandCursor: true });

    // Google "G" icon
    this.add.circle(W / 2 - 112, gBtnY, 14, 0xffffff, 0.12);
    this.add.text(W / 2 - 112, gBtnY, 'G', {
      fontSize: '18px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ea4335'
    }).setOrigin(0.5);

    const gTxt = this.add.text(W / 2 + 8, gBtnY, 'Google ile Giriş', {
      fontSize: '16px', fontFamily: 'Arial', fontStyle: 'bold', color: '#c5cae9'
    }).setOrigin(0.5);

    this._gBtn = gBtn;
    this._gTxt = gTxt;

    gBtn.on('pointerover',  () => { if (!this._busy) gBtn.setFillStyle(0x283593); });
    gBtn.on('pointerout',   () => { if (!this._busy) gBtn.setFillStyle(0x1a237e); });
    gBtn.on('pointerdown',  () => this._googleLogin());
    gTxt.setInteractive({ useHandCursor: true });
    gTxt.on('pointerdown',  () => this._googleLogin());

    // ── Guest button ──────────────────────────────────────────────────────────
    const guBtnY = cardY + 30;
    const guBtn  = this.add.rectangle(W / 2, guBtnY, 280, 44, 0x0b1020)
      .setStrokeStyle(1, 0x334466)
      .setInteractive({ useHandCursor: true });

    const guTxt = this.add.text(W / 2, guBtnY, 'Misafir olarak devam et', {
      fontSize: '14px', fontFamily: 'Arial', color: '#667799'
    }).setOrigin(0.5);

    this._guBtn = guBtn;
    this._guTxt = guTxt;

    guBtn.on('pointerover',  () => { if (!this._busy) { guBtn.setFillStyle(0x12192e); guTxt.setStyle({ color: '#8899bb' }); } });
    guBtn.on('pointerout',   () => { if (!this._busy) { guBtn.setFillStyle(0x0b1020); guTxt.setStyle({ color: '#667799' }); } });
    guBtn.on('pointerdown',  () => this._guestLogin());
    guTxt.setInteractive({ useHandCursor: true });
    guTxt.on('pointerdown',  () => this._guestLogin());

    // Privacy note
    this.add.text(W / 2, cardY + cardH / 2 - 22, 'Giriş yaparak gizlilik politikasını kabul edersin', {
      fontSize: '10px', fontFamily: 'Arial', color: '#2a3355'
    }).setOrigin(0.5);
  }

  // ── Auth helpers ──────────────────────────────────────────────────────────

  async _googleLogin() {
    if (this._busy) return;

    // Tarayıcıda veya Firebase yapılandırılmamışsa mock'a düş
    if (!this.firebase.isAvailable()) {
      this._mockGoogleLogin();
      return;
    }

    this._setLoading(true, 'Google ile giriş yapılıyor…');
    try {
      const user = await this.firebase.signInWithGoogle();
      this._saveAndProceed(user);
    } catch (e) {
      console.warn('[AuthScene] Google sign-in error:', e);
      const msg = this._friendlyError(e);
      this._setLoading(false);
      this._showError(msg);
    }
  }

  async _guestLogin() {
    if (this._busy) return;

    if (!this.firebase.isAvailable()) {
      this._mockGuestLogin();
      return;
    }

    this._setLoading(true, 'Misafir girişi yapılıyor…');
    try {
      const user = await this.firebase.signInAnonymously();
      this._saveAndProceed(user);
    } catch (e) {
      console.warn('[AuthScene] Anonymous sign-in error:', e);
      // Anonim auth başarısız olursa yerel misafir hesabına düş
      this._setLoading(false);
      this._mockGuestLogin();
    }
  }

  /** Firebase plugin yokken / tarayıcıda Google için yerel mock */
  _mockGoogleLogin() {
    const names = ['Oyuncu', 'CupMaster', 'BounceKing', 'TargetPro', 'AceShooter'];
    const name  = names[Phaser.Math.Between(0, names.length - 1)];
    this._saveAndProceed({
      uid:         'google_' + Math.random().toString(36).slice(2, 9),
      displayName: name,
      email:       name.toLowerCase() + '@gmail.com',
      isGuest:     false,
      loginTime:   Date.now(),
    });
  }

  /** Firebase plugin yokken / hata durumunda yerel misafir hesabı */
  _mockGuestLogin() {
    this._saveAndProceed({
      uid:         'guest_' + Math.random().toString(36).slice(2, 9),
      displayName: 'Misafir',
      email:       null,
      isGuest:     true,
      loginTime:   Date.now(),
    });
  }

  // ── UI yardımcıları ───────────────────────────────────────────────────────

  /** Butonları kilitler / açar, isteğe bağlı yükleme mesajı gösterir. */
  _setLoading(loading, msg = '') {
    this._busy = loading;
    const alpha = loading ? 0.45 : 1;
    if (this._gBtn)  this._gBtn.setAlpha(alpha);
    if (this._gTxt)  this._gTxt.setAlpha(alpha);
    if (this._guBtn) this._guBtn.setAlpha(alpha);
    if (this._guTxt) this._guTxt.setAlpha(alpha);

    if (this._loadingTxt) { this._loadingTxt.destroy(); this._loadingTxt = null; }
    if (loading && msg) {
      const W = this.scale.width;
      const H = this.scale.height;
      this._loadingTxt = this.add.text(W / 2, H / 2 + 155, msg, {
        fontSize: '13px', fontFamily: 'Arial', color: '#6688bb', align: 'center'
      }).setOrigin(0.5).setDepth(10);
    }
  }

  /** Kısa süreli hata mesajı gösterir (2 s sonra solar). */
  _showError(msg) {
    const W = this.scale.width;
    const H = this.scale.height;
    if (this._errTxt) { this._errTxt.destroy(); }
    this._errTxt = this.add.text(W / 2, H / 2 + 155, msg, {
      fontSize: '13px', fontFamily: 'Arial', color: '#ff5566', align: 'center'
    }).setOrigin(0.5).setDepth(10);
    this.tweens.add({
      targets: this._errTxt, alpha: 0, duration: 600, delay: 2000,
      onComplete: () => { if (this._errTxt) { this._errTxt.destroy(); this._errTxt = null; } }
    });
  }

  _friendlyError(e) {
    const msg = (e?.message || '').toLowerCase();
    if (msg.includes('cancelled') || msg.includes('canceled') || msg.includes('12501'))
      return 'Giriş iptal edildi.';
    if (msg.includes('network') || msg.includes('unavailable'))
      return 'Bağlantı hatası. İnternet bağlantını kontrol et.';
    if (msg.includes('no_user') || msg.includes('google') || msg.includes('10:'))
      return 'Google yapılandırması eksik.\nLütfen yöneticiyle iletişime geç.';
    return 'Giriş başarısız. Tekrar dene.';
  }

  _saveAndProceed(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Request notification permission and schedule daily reminder
    const nm = new NotificationManager();
    nm.requestPermission().then(() => nm.scheduleDaily()).catch(() => {});

    // First-time player → tutorial; returning player → game
    const dest = TutorialScene.isDone() ? 'GameScene' : 'TutorialScene';
    this._showSuccess(user.displayName, () => this.scene.start(dest));
  }

  _showSuccess(name, onDone) {
    const W = this.scale.width;
    const H = this.scale.height;

    // Overlay flash
    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0x001133, 0).setDepth(300);
    this.tweens.add({
      targets: flash, alpha: 0.85, duration: 250, ease: 'Power2',
      onComplete: () => {
        this.add.text(W / 2, H / 2, `Hoş geldin,\n${name}!`, {
          fontSize: '28px', fontFamily: 'Arial', fontStyle: 'bold',
          color: '#7eb3ff', stroke: '#000033', strokeThickness: 3,
          align: 'center'
        }).setOrigin(0.5).setDepth(301);

        this.time.delayedCall(900, onDone);
      }
    });
  }

  // ── Static helpers ────────────────────────────────────────────────────────

  static getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch { return null; }
  }

  static clearUser() {
    localStorage.removeItem(USER_KEY);
  }
}
