import { EconomyManager } from '../managers/EconomyManager.js';
import { AdManager }      from '../managers/AdManager.js';
import { TutorialScene }  from './TutorialScene.js';
import { SeasonManager }  from '../managers/SeasonManager.js';

const TIMER_DURATION = 10; // must match GameScene
const USER_KEY = 'cupbounce_user';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.economy = new EconomyManager();
    this.ads     = new AdManager(this);

    const W = this.scale.width;   // 390

    // ── Top bar background ────────────────────────────────────────────────────
    this.add.rectangle(W / 2, 55, W, 110, 0x04041a, 1).setDepth(100);
    this.add.rectangle(W / 2, 8,  W, 16,  0x0a0a40, 0.7).setDepth(100);

    // Gradient separator line
    const sepGfx = this.add.graphics().setDepth(101);
    const steps  = 48;
    for (let i = 0; i <= steps; i++) {
      const t  = i / steps;
      const px = Math.round(W * t);
      const a  = t < 0.5 ? t * 2 : (1 - t) * 2;
      sepGfx.fillStyle(0x3366ff, a * 0.85);
      sepGfx.fillRect(px, 109, Math.ceil(W / steps) + 1, 2);
    }

    // ── Score (top-left) ──────────────────────────────────────────────────────
    this.add.text(14, 9, 'SCORE', {
      fontSize: '10px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#4455aa', letterSpacing: 3
    }).setDepth(102);

    this.scoreText = this.add.text(14, 23, '0', {
      fontSize: '30px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000033', strokeThickness: 2
    }).setDepth(102);

    // ── Coin (bottom-left) ────────────────────────────────────────────────────
    // Use a yellow filled circle as coin icon
    this.add.circle(22, 72, 8, 0xffcc00).setDepth(102);
    this.add.circle(22, 72, 5, 0xffaa00).setDepth(103); // inner darker ring
    this.add.text(22, 72, 'C', {
      fontSize: '8px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffff88'
    }).setOrigin(0.5).setDepth(104);

    this.coinText = this.add.text(36, 72, '0', {
      fontSize: '16px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffdd66',
      stroke: '#221100', strokeThickness: 2
    }).setOrigin(0, 0.5).setDepth(102);

    // ── Level badge (centre) ──────────────────────────────────────────────────
    this.levelBadgeGfx = this.add.graphics().setDepth(101);
    this.levelText = this.add.text(W / 2, 55, 'LVL 1', {
      fontSize: '18px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#7eb3ff', stroke: '#000033', strokeThickness: 2
    }).setOrigin(0.5).setDepth(103);
    this._drawLevelBadge();
    this._buildSeasonBadge(W);

    // ── Right: ball count ─────────────────────────────────────────────────────
    this.add.text(W - 82, 9, 'BALLS', {
      fontSize: '10px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#4455aa', letterSpacing: 2
    }).setDepth(102);

    this.ballIcon = this.add.circle(W - 74, 34, 9, 0xffffff).setDepth(102);
    this.add.circle(W - 77, 31, 4, 0xffffff, 0.4).setDepth(103);

    this.ballText = this.add.text(W - 60, 34, '100', {
      fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0, 0.5).setDepth(102);

    // ── Ball regen countdown ──────────────────────────────────────────────────
    this.ballCountdown = this.add.text(W - 44, 51, '', {
      fontSize: '9px', fontFamily: 'Arial', color: '#446688'
    }).setOrigin(0.5, 0.5).setDepth(102).setVisible(false);
    this._startCountdownTimer();

    // ── Right: gem count ──────────────────────────────────────────────────────
    this._buildGemShape(W - 74, 68, 7);
    this.gemText = this.add.text(W - 60, 68, '0', {
      fontSize: '16px', fontFamily: 'Arial', fontStyle: 'bold', color: '#cc88ff'
    }).setOrigin(0, 0.5).setDepth(102);

    // ── Bottom HUD button row — 4 buttons ───────────────────────────────────
    // Layout: [GÖREVLER x=96] [İNŞA x=162] [MAĞAZA x=228] [🏆SKOR x=294]
    // Each 60×20 px with 6 px gap; centred in 390 canvas.
    const BTN_Y = 92;
    const BTN_W = 60;
    const BTN_H = 20;

    const _makeBtn = (x, label, fillIdle, fillHover, borderCol, textCol, onPress) => {
      const bg  = this.add.rectangle(x, BTN_Y, BTN_W, BTN_H, fillIdle)
        .setDepth(102).setStrokeStyle(1, borderCol).setInteractive({ useHandCursor: true });
      const txt = this.add.text(x, BTN_Y, label, {
        fontSize: '9px', fontFamily: 'Arial', fontStyle: 'bold', color: textCol
      }).setOrigin(0.5).setDepth(103).setInteractive({ useHandCursor: true });
      bg .on('pointerover',  () => bg.setFillStyle(fillHover));
      bg .on('pointerout',   () => bg.setFillStyle(fillIdle));
      bg .on('pointerdown',  onPress);
      txt.on('pointerdown',  onPress);
    };

    // GÖREVLER
    _makeBtn(96, 'G\u00d6REVLER', 0x1a0d44, 0x2d1575, 0x5533aa, '#aa88ff', () => {
      this.scene.sleep('GameScene');
      this.scene.launch('MissionScene');
    });

    // İNŞA
    _makeBtn(162, '\uD83C\uDFD7 \u0130n\u015fa', 0x0f2a10, 0x1d4a1e, 0x33aa44, '#66ff88', () => {
      this.scene.start('BuildScene');
    });

    // MAĞAZA
    _makeBtn(228, 'MA\u011eAZA', 0x0d2055, 0x193580, 0x3366cc, '#7aadff', () => {
      this.scene.sleep('GameScene');
      this.scene.launch('ShopScene');
    });

    // 🏆 SKOR
    _makeBtn(294, '\uD83C\uDFC6 SKOR', 0x1a1400, 0x2d2200, 0x886600, '#ffd700', () => {
      this.scene.sleep('GameScene');
      this.scene.launch('LeaderboardScene');
    });

    // ── Quick-ad button: 📺 +3 Top (far right, compact) ──────────────────────
    const adBtnBg = this.add.rectangle(360, BTN_Y, 52, BTN_H, 0x1a1000)
      .setDepth(102).setStrokeStyle(1, 0x886600).setInteractive({ useHandCursor: true });
    const adBtnTxt = this.add.text(360, BTN_Y, '\uD83D\uDCFA+3', {
      fontSize: '9px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ccaa00'
    }).setOrigin(0.5).setDepth(103).setInteractive({ useHandCursor: true });

    const _onAdPress = () => {
      this.ads.showRewardedAd(() => {
        this.economy.setBalls(this.economy.getBalls() + 3);
        this.registry.set('balls', this.economy.getBalls());
      });
    };
    adBtnBg .on('pointerover',  () => adBtnBg.setFillStyle(0x2a1e00));
    adBtnBg .on('pointerout',   () => adBtnBg.setFillStyle(0x1a1000));
    adBtnBg .on('pointerdown',  _onAdPress);
    adBtnTxt.on('pointerdown',  _onAdPress);

    // ── Timer bar ─────────────────────────────────────────────────────────────
    this.timerGfx = this.add.graphics().setDepth(103);
    this.timerLabel = this.add.text(W - 6, 124, '', {
      fontSize: '11px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(1, 0.5).setDepth(104).setVisible(false);

    // ── Username + logout (bottom of top bar, far left) ───────────────────────
    this._buildUserRow();

    // ── Sound toggle (top-right corner of accent bar) ─────────────────────────
    this._buildSoundToggle(W);

    // ── Listeners ─────────────────────────────────────────────────────────────
    this.registry.events.on('changedata', this._onRegistryChange, this);
    this._renderTimer(-1);
    this._refresh();
  }

  // ── Season badge (below level badge, centred) ────────────────────────────────
  _buildSeasonBadge(W) {
    const mgr    = new SeasonManager();
    const season = mgr.getActiveSeason();
    if (!season) return;

    const theme    = season.theme;
    const accentRgba = Phaser.Display.Color.IntegerToColor(theme.accentColor).rgba;
    const badgeX   = W / 2;
    const badgeY   = 82;

    // Tiny pill background
    const bg = this.add.graphics().setDepth(102);
    bg.fillStyle(theme.accentColor, 0.18);
    bg.fillRoundedRect(badgeX - 42, badgeY - 8, 84, 16, 6);
    bg.lineStyle(1, theme.accentColor, 0.55);
    bg.strokeRoundedRect(badgeX - 42, badgeY - 8, 84, 16, 6);

    const lbl = this.add.text(badgeX, badgeY, `${season.icon} ${season.name}`, {
      fontSize: '9px', fontFamily: 'Arial', fontStyle: 'bold',
      color: accentRgba
    }).setOrigin(0.5).setDepth(103).setInteractive({ useHandCursor: true });

    // Tap to re-open season popup
    lbl.on('pointerdown', () => {
      if (!this.scene.isActive('SeasonScene')) {
        this.scene.launch('SeasonScene');
      }
    });
  }

  // ── Level badge ─────────────────────────────────────────────────────────────
  _drawLevelBadge() {
    const g  = this.levelBadgeGfx;
    const cx = this.scale.width / 2;
    g.clear();
    g.fillStyle(0x000000, 0.4);
    g.fillRoundedRect(cx - 47, 37, 96, 40, 10);
    g.fillStyle(0x0d1a50, 0.95);
    g.fillRoundedRect(cx - 48, 35, 96, 40, 10);
    g.lineStyle(2, 0x2255cc, 1);
    g.strokeRoundedRect(cx - 48, 35, 96, 40, 10);
    g.lineStyle(1, 0x5588ff, 0.45);
    g.strokeRoundedRect(cx - 46, 37, 92, 36, 9);
  }

  // ── Gem diamond ──────────────────────────────────────────────────────────────
  _buildGemShape(cx, cy, s) {
    const g = this.add.graphics().setDepth(102);
    g.fillStyle(0xcc44ff, 1);
    g.fillTriangle(cx, cy - s, cx - s, cy, cx + s, cy);
    g.fillStyle(0x8822bb, 1);
    g.fillTriangle(cx - s, cy, cx + s, cy, cx, cy + s);
    g.fillStyle(0xffffff, 0.4);
    g.fillTriangle(cx, cy - s, cx - s * 0.4, cy - s * 0.3, cx, cy);
  }

  // ── Timer (called every frame) ───────────────────────────────────────────────
  update() {
    const t = this.registry.get('timer') ?? -1;
    this._renderTimer(t);
  }

  _renderTimer(t) {
    const g     = this.timerGfx;
    const W     = this.scale.width;
    const BAR_Y = 110;
    const BAR_H = 8;

    g.clear();

    if (t < 0) {
      g.fillStyle(0x060818, 1);
      g.fillRect(0, BAR_Y, W, BAR_H);
      this.timerLabel.setVisible(false);
      return;
    }

    const pct   = Math.max(0, Math.min(1, t / TIMER_DURATION));
    const fillW = Math.round(W * pct);

    g.fillStyle(0x0a0a22, 1);
    g.fillRect(0, BAR_Y, W, BAR_H);

    let r, gr;
    if (pct >= 0.5) { r = Math.round(255 * 2 * (1 - pct)); gr = 255; }
    else            { r = 255; gr = Math.round(255 * 2 * pct); }

    const fillColor = Phaser.Display.Color.GetColor(r, gr, 0);
    g.fillStyle(fillColor, 1);
    g.fillRect(0, BAR_Y, fillW, BAR_H);

    if (fillW > 4) {
      g.fillStyle(0xffffff, 0.65);
      g.fillRect(fillW - 2, BAR_Y, 2, BAR_H);
      g.fillStyle(fillColor, 0.4);
      g.fillRect(fillW - 5, BAR_Y, 3, BAR_H);
    }

    const secs  = Math.ceil(t);
    const isLow = t <= 3;
    this.timerLabel.setVisible(true).setText(secs + 's');
    this.timerLabel.setStyle({ color: isLow ? '#ff4444' : '#aaaaaa' });

    if (isLow && !this._timerPulse) {
      this._timerPulse = true;
      this.tweens.add({ targets: this.timerGfx, alpha: 0.4, duration: 250, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    } else if (!isLow && this._timerPulse) {
      this._timerPulse = false;
      this.tweens.killTweensOf(this.timerGfx);
      this.timerGfx.setAlpha(1);
    }
  }

  // ── Registry ─────────────────────────────────────────────────────────────────
  _onRegistryChange(parent, key) {
    if (key === 'timer') return;
    this._refresh();
  }

  _refresh() {
    const score = this.registry.get('score') ?? 0;
    const balls = this.registry.get('balls') ?? 100;
    const level = this.registry.get('level') ?? 1;
    const gems  = this.registry.get('gems')  ?? 0;
    const coins = this.registry.get('coins') ?? 0;

    if (this.scoreText) this.scoreText.setText(String(score));
    if (this.coinText)  this.coinText.setText(String(coins));

    if (this.levelText) {
      this.levelText.setText(`LVL ${level}`);
      this._drawLevelBadge();
    }

    if (this.gemText) this.gemText.setText(String(gems));

    if (this.ballText) {
      this.ballText.setText(String(balls));
      let col = 0xffffff;
      if (balls <= 10)      col = 0xff4444;
      else if (balls <= 30) col = 0xffaa22;
      this.ballText.setStyle({ color: Phaser.Display.Color.IntegerToColor(col).rgba });
      this.ballIcon.setFillStyle(col);
    }
  }

  // ── Sound toggle ─────────────────────────────────────────────────────────────
  get _sounds() {
    // SoundManager lives on GameScene; access it lazily so UIScene stays decoupled
    const gs = this.scene.get('GameScene');
    return gs ? gs.sounds : null;
  }

  _buildSoundToggle(W) {
    const snd = this._sounds;
    const sfxOn   = snd ? snd.isSFXOn()   : true;
    const musicOn = snd ? snd.isMusicOn() : true;

    // Tutorial replay button (leftmost)
    const tutBtn = this.add.text(W - 56, 8, '\u2753', {
      fontSize: '11px', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(105).setInteractive({ useHandCursor: true })
      .setAlpha(0.5);

    tutBtn.on('pointerover', () => tutBtn.setAlpha(1));
    tutBtn.on('pointerout',  () => tutBtn.setAlpha(0.5));
    tutBtn.on('pointerdown', () => {
      TutorialScene.reset();
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('TutorialScene');
    });

    // SFX button
    this._sfxBtn = this.add.text(W - 36, 8, sfxOn ? '\uD83D\uDD0A' : '\uD83D\uDD07', {
      fontSize: '12px', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(105).setInteractive({ useHandCursor: true });

    // Music button (note symbol)
    this._musBtn = this.add.text(W - 16, 8, musicOn ? '\uD83C\uDFB5' : '\u23F8', {
      fontSize: '12px', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(105).setInteractive({ useHandCursor: true });

    this._sfxBtn.on('pointerdown', () => {
      const s = this._sounds;
      if (!s) return;
      const on = s.toggleSFX();
      this._sfxBtn.setText(on ? '\uD83D\uDD0A' : '\uD83D\uDD07');
    });

    this._musBtn.on('pointerdown', () => {
      const s = this._sounds;
      if (!s) return;
      const on = s.toggleMusic();
      this._musBtn.setText(on ? '\uD83C\uDFB5' : '\u23F8');
    });
  }

  // ── User row ─────────────────────────────────────────────────────────────────
  _buildUserRow() {
    try {
      const userData = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
      if (!userData) return;

      const name    = userData.displayName || 'Oyuncu';
      const isGuest = userData.isGuest;
      // Left of button row (buttons start at x=104-41=63); place user at x=14..~82
      const AV_X = 22;
      const AV_Y = 92;

      const avatarCol = isGuest ? 0x334466 : 0x1a3a8a;
      this.add.circle(AV_X, AV_Y, 8, avatarCol).setDepth(104);
      this.add.text(AV_X, AV_Y, name[0].toUpperCase(), {
        fontSize: '9px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ccd8ff'
      }).setOrigin(0.5).setDepth(105);

      // Name label (truncated to fit left column)
      const label = name.length > 7 ? name.slice(0, 6) + '…' : name;
      this.add.text(AV_X + 12, AV_Y - 4, label, {
        fontSize: '9px', fontFamily: 'Arial', color: isGuest ? '#445566' : '#7788bb'
      }).setOrigin(0, 0).setDepth(104);

      // Logout "×" below name
      const logoutBtn = this.add.text(AV_X + 12, AV_Y + 4, 'Çıkış', {
        fontSize: '8px', fontFamily: 'Arial', color: '#2a3355'
      }).setOrigin(0, 0).setDepth(104).setInteractive({ useHandCursor: true });

      logoutBtn.on('pointerover', () => logoutBtn.setStyle({ color: '#ff5566' }));
      logoutBtn.on('pointerout',  () => logoutBtn.setStyle({ color: '#2a3355' }));
      logoutBtn.on('pointerdown', () => {
        localStorage.removeItem(USER_KEY);
        this.scene.stop('UIScene');
        this.scene.stop('GameScene');
        this.scene.start('AuthScene');
      });
    } catch { /* ignore parse errors */ }
  }

  // ── Ball regen countdown ─────────────────────────────────────────────────────
  _startCountdownTimer() {
    this._updateBallCountdown();
    this._countdownTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: this._updateBallCountdown,
      callbackScope: this
    });
  }

  _updateBallCountdown() {
    if (!this.ballCountdown) return;
    const secs = this.economy.getSecondsToNextBall();
    if (secs <= 0) {
      this.ballCountdown.setVisible(false);
      return;
    }
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    this.ballCountdown.setText(`${m}:${String(s).padStart(2, '0')}`).setVisible(true);
  }

  shutdown() {
    this.registry.events.off('changedata', this._onRegistryChange, this);
    if (this._timerPulse) this.tweens.killTweensOf(this.timerGfx);
    if (this._countdownTimer) this._countdownTimer.remove();
  }
}
