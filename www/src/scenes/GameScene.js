import { Bow }             from '../objects/Bow.js';
import { Ball }            from '../objects/Ball.js';
import { Cup }             from '../objects/Cup.js';
import { EconomyManager }  from '../managers/EconomyManager.js';
import { LevelManager }    from '../managers/LevelManager.js';
import { BoosterManager }  from '../managers/BoosterManager.js';
import { MissionManager }  from '../managers/MissionManager.js';
import { AdManager }           from '../managers/AdManager.js';
import { SoundManager }        from '../managers/SoundManager.js';
import { LeaderboardManager }  from '../managers/LeaderboardManager.js';
import { NotificationManager } from '../managers/NotificationManager.js';
import { CloudSaveManager }    from '../managers/CloudSaveManager.js';
import { SeasonManager }       from '../managers/SeasonManager.js';

// ─── Game states ──────────────────────────────────────────────────────────────
const STATE = {
  IDLE:       'idle',
  FLYING:     'flying',
  SCORING:    'scoring',
  RESETTING:  'resetting',
  TRANSITION: 'transition',
  OVER:       'over'
};

// ─── Constants ────────────────────────────────────────────────────────────────
const TIMER_DURATION = 10; // seconds — countdown while player aims

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  // ─────────────────────────────────────────────────────────────────────────
  create() {
    const W = this.scale.width;    // 390
    const H = this.scale.height;   // 844

    this.economy  = new EconomyManager();
    this.seasons  = new SeasonManager();
    window.seasonManager = this.seasons; // konsol erişimi: window.seasonManager.getCurrentSeason()
    this.levelMgr = new LevelManager();
    this.boosters = new BoosterManager();
    this.missions = new MissionManager();
    this.ads      = new AdManager(this);
    this.sounds   = new SoundManager(this);
    this.lboard   = new LeaderboardManager();
    this.notifs   = new NotificationManager();
    this.notifs.cancelInactivity();

    // ── Cloud save ────────────────────────────────────────────────────────────
    this.cloud = new CloudSaveManager();
    this._cloudUid = (() => {
      try { return JSON.parse(localStorage.getItem('cupbounce_user') || 'null')?.uid ?? null; }
      catch { return null; }
    })();
    // Global ref — EconomyManager._loadFromCloudIfNeeded() ve BuildScene erişimi için
    window.cloudSaveManager = this.cloud;

    if (this.cloud.isAvailable() && this._cloudUid) {
      EconomyManager.registerCloudSave(this.cloud, this._cloudUid);
      // Buluttan yükle → registry'yi güncelle (async; hafif gecikme kabul edilebilir)
      this.cloud.load(this._cloudUid).then(data => {
        if (data) this._syncRegistry();
      }).catch(() => {});
    }

    // Yeni port / boş localStorage → Firestore'dan otomatik yükle (fire-and-forget)
    this.economy._loadFromCloudIfNeeded();

    // ── Session score (resets on game over; gems/coins persist via EconomyManager) ──
    this.score = 0;

    // ── Per-level tracking (reset in _loadLevel) ─────────────────────────────
    this.levelScore        = 0;
    this.levelGems         = 0;
    this.levelBallsLost    = 0;
    this.levelBonuses      = [];
    this.pendingMultiplier = 1.0;

    this.cups  = [];
    this.state = STATE.IDLE;

    // ── Aim timer ────────────────────────────────────────────────────────────
    this.timerStart  = null;
    this.timerActive = false;

    // ── Portrait layout ──────────────────────────────────────────────────────
    this.bowX     = Math.round(W / 2);
    this.bowY     = Math.round(H - 114);
    this.ballRestY = this.bowY - 28;

    // ── Physics world ────────────────────────────────────────────────────────
    this.physics.world.setBounds(0, 110, W, H + 200);
    this.physics.world.setBoundsCollision(true, true, true, false);

    // ── Background ──────────────────────────────────────────────────────────
    this._buildBackground(W, H);

    // ── Bow & ball ───────────────────────────────────────────────────────────
    this.bow  = new Bow(this,  this.bowX, this.bowY);
    this.ball = new Ball(this, this.bowX, this.ballRestY);

    // ── Booster status label (above bow zone) ────────────────────────────────
    this.boosterLabel = this.add.text(W / 2, 658, '', {
      fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#44ffcc', stroke: '#000000', strokeThickness: 2,
      align: 'center'
    }).setOrigin(0.5).setDepth(18);

    // ── Level ────────────────────────────────────────────────────────────────
    this._loadLevel();

    // ── Speed timer ring ─────────────────────────────────────────────────────
    this._initSpeedTimer();

    // ── Double ball mode ──────────────────────────────────────────────────────
    this._createDoubleBallUI();
    this._initDoubleBallMode();

    // ── Events ──────────────────────────────────────────────────────────────
    this.events.on('bow-drag-start', this._onBowDragStart, this);
    this.events.on('bow-release',    this._onBowRelease,   this);

    // ── UI scene ─────────────────────────────────────────────────────────────
    this.scene.launch('UIScene');

    this.registry.set('timer', -1);
    this._syncRegistry();
    this._checkDailyLogin();
    this._checkSeasonPopup();
  }

  // ─────────────────────────────────────────────────────────────────────────
  update() {
    // Animate moving cups (slow-motion booster halves movement speed)
    if (this.state !== STATE.TRANSITION && this.state !== STATE.OVER) {
      const ts = this.boosters.isActive('slowMotion') ? 0.4 : 1.0;
      this.cups.forEach(cup => cup.update(this.time.now, ts));
    }

    // ── Timer countdown (runs while player is aiming) ────────────────────────
    if (this.timerActive) {
      const elapsed   = (this.time.now - this.timerStart) / 1000;
      const remaining = Math.max(0, TIMER_DURATION - elapsed);
      this.registry.set('timer', remaining);
    }

    if (this.state !== STATE.FLYING) return;

    // ── Ball trail ───────────────────────────────────────────────────────────
    this.ball.update();

    // ── Extra ball (double mode) collision & bounds ───────────────────────────
    if (this.extraBall) {
      for (const cup of this.cups) {
        if (!cup.scored && cup.checkBallEntry(this.extraBall)) {
          cup.scoreEffect();
          const pts = Math.round(cup.points * this.pendingMultiplier);
          this.score      += pts;
          this.levelScore += pts;
          this.missions.increment('scores');
          this.missions.increment('points', pts);
          this._syncRegistry();
          this.cameras.main.flash(80, 255, 140, 0, true);
          this._destroyExtraBall();
          break;
        }
      }
      if (this.extraBall && this.extraBall.getY() > this.bowY + 70) {
        this._destroyExtraBall();
      }
    }

    // ── Cup collision ────────────────────────────────────────────────────────
    for (const cup of this.cups) {
      if (!cup.scored && cup.checkBallEntry(this.ball)) {
        this._onBallScored(cup);
        return;
      }
    }

    // ── Ball out of bounds: fell back below the bow ──────────────────────────
    // Ball.isOutOfBounds(maxY) returns true when sprite.y > maxY + 60
    if (this.ball.isOutOfBounds(this.bowY + 10)) {
      this._onBallLost();
    }
  }

  // ─── Daily login popup ───────────────────────────────────────────────────

  _checkDailyLogin() {
    const claimed = this.economy.claimDailyLogin();
    if (!claimed) return;
    this.registry.set('balls', this.economy.getBalls());
    // Small delay so the scene finishes rendering before the popup appears
    this.time.delayedCall(400, this._showDailyLoginPopup, [], this);
  }

  _showDailyLoginPopup() {
    const W  = this.scale.width;
    const H  = this.scale.height;
    const CY = Math.round(H * 0.46);
    const D  = 50;

    const popupObjs = [];   // everything to destroy on close
    const cardObjs  = [];   // subset that gets the scale-in/-out tween

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      overlay.setVisible(false);
      this.tweens.add({
        targets:  cardObjs,
        scaleX:   0.3,
        scaleY:   0.3,
        alpha:    0,
        duration: 180,
        ease:     'Back.easeIn',
        onComplete: () => popupObjs.forEach(o => { try { o.destroy(); } catch {} })
      });
    };

    // ── Dark overlay (blocks touch to game underneath) ──────────────────────
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55)
      .setDepth(D).setInteractive();
    popupObjs.push(overlay);

    const reg = o => { popupObjs.push(o); cardObjs.push(o); return o; };

    // ── Card ────────────────────────────────────────────────────────────────
    reg(this.add.rectangle(W / 2, CY, 272, 192, 0x0a1535)
      .setDepth(D + 1).setStrokeStyle(2, 0x2255cc));
    reg(this.add.rectangle(W / 2, CY - 96, 272, 3, 0x44aaff)
      .setDepth(D + 2).setAlpha(0.7));

    // ── Title ───────────────────────────────────────────────────────────────
    reg(this.add.text(W / 2, CY - 62, '🎉 Günlük Giriş Ödülü!', {
      fontSize: '16px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffffff', stroke: '#000033', strokeThickness: 2
    }).setOrigin(0.5).setDepth(D + 2));

    // ── Reward text ─────────────────────────────────────────────────────────
    reg(this.add.text(W / 2, CY - 18, '+10 Top Kazandın!', {
      fontSize: '23px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#44ff88', stroke: '#003311', strokeThickness: 2
    }).setOrigin(0.5).setDepth(D + 2));

    // ── "Harika!" button ────────────────────────────────────────────────────
    const btnBg = reg(this.add.rectangle(W / 2, CY + 54, 124, 36, 0x0f5520)
      .setDepth(D + 2).setStrokeStyle(2, 0x33cc66).setInteractive({ useHandCursor: true }));
    const btnTxt = reg(this.add.text(W / 2, CY + 54, 'Harika!', {
      fontSize: '15px', fontFamily: 'Arial', fontStyle: 'bold', color: '#66ffaa'
    }).setOrigin(0.5).setDepth(D + 3).setInteractive({ useHandCursor: true }));

    btnBg.on('pointerover',  () => btnBg.setFillStyle(0x187733));
    btnBg.on('pointerout',   () => btnBg.setFillStyle(0x0f5520));
    btnBg.on('pointerdown',  close);
    btnTxt.on('pointerdown', close);

    // ── Scale-in animation ───────────────────────────────────────────────────
    cardObjs.forEach(o => { o.setScale(0.5); o.setAlpha(0); });
    this.tweens.add({
      targets:  cardObjs,
      scaleX:   1,
      scaleY:   1,
      alpha:    1,
      duration: 320,
      ease:     'Back.easeOut'
    });

    // ── Auto-close after 3 s ─────────────────────────────────────────────────
    this.time.delayedCall(3000, close);
  }

  // ─── Season popup ────────────────────────────────────────────────────────

  _checkSeasonPopup() {
    const season = this.seasons.getActiveSeason();
    if (!season) {
      console.log('[Season] Aktif sezon yok (Nisan arası dönemi). Yaz: 1 Haz - 31 Ağu');
      return;
    }
    const mgr = this.seasons;
    if (mgr.hasSeenPopup(season.id)) {
      console.log('[Season] Popup zaten gösterildi:', season.name);
      return;
    }
    console.log('[Season] Sezon aktif, popup gösteriliyor:', season.name, season.icon);
    this.time.delayedCall(800, () => {
      if (this.scene.isActive('SeasonScene')) return;
      this.scene.launch('SeasonScene');
    });
  }

  // ─── Background ──────────────────────────────────────────────────────────

  _buildBackground(W, H) {
    const theme     = this.seasons.getTheme();
    const bgColor   = theme ? theme.bg         : 0x0a0a1a;
    const starColor = theme ? theme.starColor  : 0xffffff;
    const gridColor = theme ? theme.gridColor  : 0x0e0e38;

    // Solid dark base
    this.add.rectangle(W / 2, H / 2, W, H, bgColor).setDepth(0);

    // Very subtle vignette corners — dark corners make the play area pop
    const vig = this.add.graphics().setDepth(1);
    vig.fillStyle(0x000000, 0.35);
    vig.fillRect(0, 0, 60, H);
    vig.fillRect(W - 60, 0, 60, H);

    // ── Animated twinkling stars ─────────────────────────────────────────────
    for (let i = 0; i < 80; i++) {
      const sx    = Phaser.Math.Between(5, W - 5);
      const sy    = Phaser.Math.Between(125, H - 170);
      const r     = Phaser.Math.FloatBetween(0.6, 2.0);
      const baseA = Phaser.Math.FloatBetween(0.25, 0.85);
      const star  = this.add.circle(sx, sy, r, starColor, baseA).setDepth(1);

      this.tweens.add({
        targets:  star,
        alpha:    baseA * Phaser.Math.FloatBetween(0.1, 0.35),
        duration: Phaser.Math.Between(800, 2800),
        yoyo:     true,
        repeat:   -1,
        delay:    Phaser.Math.Between(0, 2500),
        ease:     'Sine.easeInOut'
      });
    }

    // Subtle horizontal grid lines in play zone
    const grid = this.add.graphics().setDepth(1);
    grid.lineStyle(1, gridColor, 1);
    for (let y = 160; y <= H - 170; y += 90) {
      grid.beginPath();
      grid.moveTo(10, y);
      grid.lineTo(W - 10, y);
      grid.strokePath();
    }

    // ── Bow zone separator ───────────────────────────────────────────────────
    const groundY = H - 164; // ≈ 680

    // Dark tint in bow zone
    const bowZone = this.add.graphics().setDepth(2);
    bowZone.fillStyle(0x030310, 0.65);
    bowZone.fillRect(0, groundY, W, H - groundY);

    // Glowing separator line — multi-layer for visible glow
    bowZone.lineStyle(4, 0x1a2d7a, 0.5);
    bowZone.beginPath();
    bowZone.moveTo(0, groundY);
    bowZone.lineTo(W, groundY);
    bowZone.strokePath();

    bowZone.lineStyle(2, 0x2244cc, 0.85);
    bowZone.beginPath();
    bowZone.moveTo(0, groundY);
    bowZone.lineTo(W, groundY);
    bowZone.strokePath();

    bowZone.lineStyle(1, 0x5588ff, 0.4);
    bowZone.beginPath();
    bowZone.moveTo(0, groundY + 2);
    bowZone.lineTo(W, groundY + 2);
    bowZone.strokePath();
  }

  // ─── Level management ─────────────────────────────────────────────────────

  _loadLevel() {
    this.cups.forEach(c => c.destroy());
    this.cups = [];

    this._destroyExtraBall();

    // Clean up old wall-gap objects
    if (this._wallGapObjs) {
      this._wallGapObjs.forEach(o => o.destroy());
    }
    this._wallGapObjs = [];

    // Reset per-level stats
    this.levelScore        = 0;
    this.levelGems         = 0;
    this.levelBallsLost    = 0;
    this.levelBonuses      = [];
    this.pendingMultiplier = 1.0;

    const data = this.levelMgr.getCurrentLevelData();

    const seasonTheme = this.seasons.getTheme();
    const seasonCups  = seasonTheme ? seasonTheme.cupColors : null;

    data.cups.forEach((cd, i) => {
      // Gem cups keep their original appearance; normal cups use seasonal palette if active
      const color = (!cd.isGem && seasonCups)
        ? seasonCups[i % seasonCups.length]
        : cd.color;
      this.cups.push(new Cup(this, cd.x, cd.y, color, cd.points, {
        isGem:  cd.isGem  ?? false,
        small:  cd.small  ?? false,
        move:   cd.move   ?? null
      }));
    });

    if (data.wallGaps) {
      this._createWallsWithGaps(data);
    }

    if (this.levelLabel) this.levelLabel.destroy();
    this.levelLabel = this.add.text(this.scale.width / 2, 128,
      `— LEVEL ${data.id} —`, {
        fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold',
        color: '#334488', letterSpacing: 3
      }).setOrigin(0.5).setDepth(20);

    this._syncRegistry();
  }

  // ─── Bow event handlers ───────────────────────────────────────────────────

  // Fires when the player starts actually dragging (not just tapping)
  _onBowDragStart() {
    if (this.state !== STATE.IDLE || this.timerActive) return;
    this.timerStart  = this.time.now;
    this.timerActive = true;
    // First interaction — kick off background music (satisfies autoplay policy)
    this.sounds.startIfEnabled();
  }

  // Fires when the player releases the string
  _onBowRelease({ vx, vy }) {
    if (this.state !== STATE.IDLE) return;

    if (!this.economy.hasBalls()) {
      this._showGameOver();
      return;
    }

    // ── Timer stops on release; multiplier based on aim time ─────────────────
    const elapsed = this.timerActive
      ? (this.time.now - this.timerStart) / 1000
      : TIMER_DURATION;

    this.timerActive = false;
    this.registry.set('timer', -1);

    this.pendingMultiplier = elapsed <= 2 ? 2.0
                           : elapsed <= 4 ? 1.5
                           :                1.0;

    // ── Aim-assist booster: consume 1 charge per shot ─────────────────────────
    if (this.boosters.isActive('aimAssist')) {
      this.boosters.consume('aimAssist');
    }

    // ── Mission: count shots ───────────────────────────────────────────────────
    this.missions.increment('shots');

    this.sounds.playShoot();
    this.state = STATE.FLYING;
    this.bow.setEnabled(false);
    this.ball.launch(vx, vy);
    this._startSpeedTimer();
    this._handleDoubleBallShot(vx, vy);
  }

  // ─── Ball-scored handler ──────────────────────────────────────────────────

  _onBallScored(cup) {
    this.state = STATE.SCORING;

    // Speed multiplier + optional x2Score booster
    const multiplier       = this.pendingMultiplier;
    this.pendingMultiplier = 1.0;
    const boosterMult      = this.boosters.isActive('x2Score') ? 2.0 : 1.0;
    const baseEarned       = Math.round(cup.points * multiplier * boosterMult);
    const earned           = this._applySpeedBonus(baseEarned);
    this.levelBonuses.push(multiplier);

    // ── Speed-bonus badge ─────────────────────────────────────────────────────
    if (multiplier > 1) {
      const isDouble = multiplier === 2;
      // \uD83D\uDD25 = 🔥   \u26A1 = ⚡
      const label = isDouble
        ? '\u00D72 \uD83D\uDD25 BONUS!'
        : '\u00D71.5 \u26A1';
      const badge = this.add.text(cup.x, cup.y - 80, label, {
        fontSize:        '34px',
        fontFamily:      '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",Arial',
        fontStyle:       'bold',
        color:           isDouble ? '#ff4400' : '#ffdd00',
        stroke:          '#000000',
        strokeThickness: 7
      }).setOrigin(0.5).setDepth(35).setScale(0.35);

      this.tweens.add({
        targets: badge, scaleX: 1, scaleY: 1,
        duration: 200, ease: 'Back.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: badge,
            y: badge.y - 100, alpha: 0,
            duration: 1200, delay: 400, ease: 'Power2.easeIn',
            onComplete: () => badge.destroy()
          });
        }
      });
    }

    // ── Gem check ─────────────────────────────────────────────────────────────
    if (cup.isGem) {
      this.economy.addGems(1);
      this.levelGems++;
      this.sounds.playGem();
    } else {
      this.sounds.playHit();
    }

    // ── Coin reward (+10 per cup, +extra for booster) ─────────────────────────
    const coinReward = boosterMult > 1 ? 20 : 10;
    this.economy.addCoins(coinReward);

    // ── Mission tracking ──────────────────────────────────────────────────────
    this.missions.increment('scores');
    this.missions.increment('points', earned);

    cup.scoreEffect();
    this.score      += earned;
    this.levelScore += earned;
    this._syncRegistry();

    this.cameras.main.flash(120, 0, 80, 255, true);

    const allDone = this.cups.every(c => c.scored);
    if (allDone) {
      this.time.delayedCall(700, () => this._showLevelTransition());
    } else {
      this.time.delayedCall(650, () => this._resetBall());
    }
  }

  // ─── Ball-lost handler ────────────────────────────────────────────────────

  _onBallLost() {
    this._stopSpeedTimer();
    this._destroyExtraBall();

    // ── Extra-life booster absorbs one ball loss ──────────────────────────────
    if (this.boosters.isActive('extraLife')) {
      this.boosters.consume('extraLife');
      this._updateBoosterUI();
      this._showBoosterToast('Ekstra Can kullanıldı!', '#44ff88');
      this.time.delayedCall(350, () => this._resetBall());
      return;
    }

    this.sounds.playMiss();
    this.state             = STATE.RESETTING;
    this.timerActive       = false;
    this.pendingMultiplier = 1.0;
    this.registry.set('timer', -1);
    this.levelBallsLost++;

    this.economy.spendBall();
    this._syncRegistry();
    this.cameras.main.shake(180, 0.006);

    if (!this.economy.hasBalls()) {
      this.time.delayedCall(900, () => this._showGameOver());
    } else {
      this.time.delayedCall(520, () => this._resetBall());
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  _resetBall() {
    this.ball.reset(this.bowX, this.ballRestY);
    this.bow.reset();
    this.bow.setEnabled(true);
    this.bow.setAimAssist(this.boosters.isActive('aimAssist'));
    this.timerActive       = false;
    this.pendingMultiplier = 1.0;
    this.registry.set('timer', -1);
    this.state = STATE.IDLE;
    this._updateBoosterUI();
  }

  _syncRegistry() {
    this.registry.set('score', this.score);
    this.registry.set('balls', this.economy.getBalls());
    this.registry.set('level', this.levelMgr.getLevel());
    this.registry.set('gems',  this.economy.getGems());
    this.registry.set('coins', this.economy.getCoins());
  }

  // ── Booster UI label ────────────────────────────────────────────────────────

  _updateBoosterUI() {
    const parts = [];
    const aa = this.boosters.get('aimAssist');
    const sm = this.boosters.isActive('slowMotion');
    const x2 = this.boosters.isActive('x2Score');
    const el = this.boosters.isActive('extraLife');

    if (aa > 0) parts.push(`Ni\u015fangah: ${aa} at\u0131\u015f`);
    if (sm)     parts.push('Yava\u015f Hareket aktif');
    if (x2)     parts.push('\u00D72 Skor aktif');
    if (el)     parts.push('Ekstra Can haz\u0131r');

    this.boosterLabel.setText(parts.join('  |  '));
  }

  // ── In-game booster toast ─────────────────────────────────────────────────

  _showBoosterToast(msg, color = '#44ffcc') {
    const t = this.add.text(this.scale.width / 2, 630, msg, {
      fontSize: '18px', fontFamily: 'Arial', fontStyle: 'bold',
      color, stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(30);

    this.tweens.add({
      targets: t, y: 580, alpha: 0,
      duration: 1200, ease: 'Power2.easeIn',
      onComplete: () => t.destroy()
    });
  }

  // ─── Slogan ───────────────────────────────────────────────────────────────

  _getSlogan() {
    const avg  = this.levelBonuses.length
      ? this.levelBonuses.reduce((a, b) => a + b, 0) / this.levelBonuses.length
      : 1;
    const lost = this.levelBallsLost;

    if (avg >= 1.9 && lost === 0) return 'Efsanesin! \uD83D\uDC51';  // 👑
    if (avg >= 1.5 && lost <= 1)  return 'M\u00FCkemmel! \uD83D\uDD25'; // 🔥
    if (lost <= 3)                 return 'Harika! \u2B50';           // ⭐
    return 'Neredeyse! \uD83D\uDCAA';                                 // 💪
  }

  // ─── Level-transition screen ───────────────────────────────────────────────

  _showLevelTransition() {
    this.state = STATE.TRANSITION;
    this.bow.setEnabled(false);
    this.sounds.playLevelUp();

    // ── Save score & level to leaderboard ─────────────────────────────────────
    this.lboard.saveScore(this.score, this.levelMgr.getLevel());
    this.lboard.saveLevel(this.levelMgr.getLevel());

    // ── Mission: level completed ───────────────────────────────────────────────
    this.missions.increment('levels');

    // ── Coin bonus for completing level ───────────────────────────────────────
    this.economy.addCoins(50);

    // ── Gem + ball rewards (every 10 levels) ──────────────────────────────────
    const sectionReward = this.economy.onLevelComplete(this.levelMgr.getLevel());
    if (sectionReward.gems  > 0) this.levelGems = (this.levelGems || 0) + sectionReward.gems;
    if (sectionReward.balls > 0) this.registry.set('balls', this.economy.getBalls());
    this.registry.set('gems', this.economy.getGems());

    // ── Level-scoped boosters expire at level end ─────────────────────────────
    this.boosters.consumeAll('x2Score');
    this.boosters.consumeAll('slowMotion');

    const W      = this.scale.width;
    const H      = this.scale.height;
    const cx     = W / 2;
    const slogan = this._getSlogan();
    const coins  = Math.floor(this.levelScore / 10);
    const lvlId  = this.levelMgr.getLevel();

    // Dim overlay
    const overlay = this.add.rectangle(cx, H / 2, W, H, 0x000000, 0.55).setDepth(60);

    // Panel slides up from below screen
    const container = this.add.container(cx, H + 260).setDepth(61);

    const bg = this.add.rectangle(0, 0, 345, 460, 0x060618, 0.97)
      .setStrokeStyle(2, 0x3355ff);
    container.add(bg);

    const title = this.add.text(0, -190, `LEVEL ${lvlId} TAMAM!`, {
      fontSize: '24px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffff44', stroke: '#000033', strokeThickness: 5
    }).setOrigin(0.5);
    container.add(title);

    const sloganTxt = this.add.text(0, -140, slogan, {
      fontSize: '34px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);
    container.add(sloganTxt);
    this.tweens.add({
      targets: sloganTxt, scaleX: 1.08, scaleY: 1.08,
      duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // Dividers
    const d1 = this.add.graphics();
    d1.lineStyle(1, 0x2244aa, 0.7)
      .beginPath().moveTo(-140, -88).lineTo(140, -88).strokePath();
    container.add(d1);

    // Stat rows
    const rowStyle = { fontSize: '18px', fontFamily: 'Arial', color: '#99aabb' };
    const valStyle = { fontSize: '26px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffff88' };

    container.add(this.add.text(-140, -58, '\uD83C\uDFC6 Puan', rowStyle).setOrigin(0, 0.5));
    const scoreValTxt = this.add.text(140, -58, '+0', valStyle).setOrigin(1, 0.5);
    container.add(scoreValTxt);

    container.add(this.add.text(-140, -8, '\u25C6 Gem', {
      ...rowStyle, color: '#cc88ff', fontFamily: 'Arial'
    }).setOrigin(0, 0.5));
    const gemValTxt = this.add.text(140, -8, '+0', {
      ...valStyle, color: this.levelGems > 0 ? '#ee88ff' : '#556677'
    }).setOrigin(1, 0.5);
    container.add(gemValTxt);

    container.add(this.add.text(-140, 42, '\u25CF Coin', {
      ...rowStyle, color: '#ffcc44', fontFamily: 'Arial'
    }).setOrigin(0, 0.5));
    const coinValTxt = this.add.text(140, 42, '+0', { ...valStyle, color: '#ffcc44' })
      .setOrigin(1, 0.5);
    container.add(coinValTxt);

    const d2 = this.add.graphics();
    d2.lineStyle(1, 0x2244aa, 0.7)
      .beginPath().moveTo(-140, 88).lineTo(140, 88).strokePath();
    container.add(d2);

    // Continue button
    const btn = this.add.text(0, 140, '[ Devam Et \u2192 ]', {
      fontSize: '22px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#44ff88', stroke: '#001100', strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    container.add(btn);

    btn.on('pointerover', () => btn.setStyle({ color: '#88ffaa' }));
    btn.on('pointerout',  () => btn.setStyle({ color: '#44ff88' }));
    btn.on('pointerdown', () => {
      this.tweens.killTweensOf(sloganTxt);
      const showAd = this.ads.canShowInterstitial();
      overlay.destroy();
      container.destroy(true);

      const proceed = () => {
        this.levelMgr.advanceLevel();
        this._resetBall();
        this._loadLevel();
      };

      if (showAd) {
        this.ads.showInterstitialAd(proceed);
      } else {
        proceed();
      }
    });

    // Slide panel up
    this.tweens.add({
      targets: container, y: H / 2,
      duration: 420, ease: 'Back.easeOut'
    });

    // Confetti burst
    this._spawnConfetti(W, H);

    // Counting animations
    const c1 = { v: 0 };
    this.tweens.add({ targets: c1, v: this.levelScore, duration: 700, delay: 500,
      ease: 'Power2.easeOut', onUpdate: () => scoreValTxt.setText(`+${Math.floor(c1.v)}`) });

    const c2 = { v: 0 };
    this.tweens.add({ targets: c2, v: this.levelGems, duration: 400, delay: 700,
      ease: 'Power2', onUpdate: () => gemValTxt.setText(`+${Math.floor(c2.v)}`) });

    const c3 = { v: 0 };
    this.tweens.add({ targets: c3, v: coins, duration: 600, delay: 650,
      ease: 'Power2', onUpdate: () => coinValTxt.setText(`+${Math.floor(c3.v)}`) });
  }

  // ─── Highscore helpers ────────────────────────────────────────────────────

  _getHighScore() {
    return parseInt(localStorage.getItem('cupbounce_hs') || '0', 10);
  }

  _saveHighScore(score) {
    if (score > this._getHighScore()) {
      localStorage.setItem('cupbounce_hs', String(score));
    }
  }

  // ─── Confetti ─────────────────────────────────────────────────────────────

  _spawnConfetti(W, H) {
    const colors = [0xff1744, 0x00e676, 0xffd700, 0x2979ff, 0xcc44ff, 0xff6d00, 0x00bcd4];
    for (let i = 0; i < 45; i++) {
      const col  = colors[Phaser.Math.Between(0, colors.length - 1)];
      const cx   = Phaser.Math.Between(30, W - 30);
      const sz   = Phaser.Math.Between(6, 13);
      const tall = Phaser.Math.Between(0, 1);  // 0=square, 1=rectangle
      const p    = this.add.rectangle(cx, -20, sz, tall ? sz * 1.8 : sz, col).setDepth(75);

      this.tweens.add({
        targets:  p,
        y:        H + 30,
        x:        cx + Phaser.Math.Between(-80, 80),
        angle:    Phaser.Math.Between(-270, 270),
        duration: Phaser.Math.Between(1200, 2800),
        delay:    Phaser.Math.Between(0, 700),
        ease:     'Linear',
        onComplete: () => p.destroy()
      });
    }
  }

  // ─── Game-over overlay ────────────────────────────────────────────────────

  _showGameOver() {
    this.state = STATE.OVER;
    this.bow.setEnabled(false);
    this._saveHighScore(this.score);
    // Player ran out of balls → schedule a "refill ready" notification in 4 h
    this.notifs.scheduleBallRefill();

    const W  = this.scale.width;
    const H  = this.scale.height;
    const cx = W / 2;
    const cy = H / 2;
    const hs = this._getHighScore();

    // Dim overlay
    const overlay = this.add.rectangle(cx, cy, W, H, 0x000000, 0.55).setDepth(48);

    // Panel (taller to fit ad button)
    const panel = this.add.rectangle(cx, cy, 330, 400, 0x0d0010, 0.96)
      .setDepth(50).setStrokeStyle(2, 0xff2233);
    // Inner glow border
    const panelGlow = this.add.rectangle(cx, cy, 325, 395, 0x000000, 0)
      .setDepth(50).setStrokeStyle(1, 0xff4455, 0.4);

    const goObjs = [overlay, panel, panelGlow];
    const add    = (obj) => { goObjs.push(obj); return obj; };

    add(this.add.text(cx, cy - 120, 'GAME OVER', {
      fontSize: '42px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ff3333', stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5).setDepth(51));

    // Divider
    const d1 = this.add.graphics().setDepth(51);
    d1.lineStyle(1, 0x661111, 0.8)
      .beginPath().moveTo(cx - 130, cy - 82).lineTo(cx + 130, cy - 82).strokePath();
    goObjs.push(d1);

    add(this.add.text(cx, cy - 60, 'TOPLAM SKOR', {
      fontSize: '13px', fontFamily: 'Arial', color: '#556677', letterSpacing: 2
    }).setOrigin(0.5).setDepth(51));

    const scoreTxt = add(this.add.text(cx, cy - 28, '0', {
      fontSize: '50px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000033', strokeThickness: 3
    }).setOrigin(0.5).setDepth(51));

    // Count up score
    const c = { v: 0 };
    this.tweens.add({ targets: c, v: this.score, duration: 900, ease: 'Power2.easeOut',
      onUpdate: () => scoreTxt.setText(String(Math.floor(c.v))) });

    // Gems
    add(this.add.text(cx, cy + 38, `\u25C6  ${this.economy.getGems()} gem`, {
      fontSize: '20px', fontFamily: 'Arial', color: '#cc88ff'
    }).setOrigin(0.5).setDepth(51));

    // Highscore row
    const isNewHS = this.score > 0 && this.score >= hs;
    const hsLabel = isNewHS ? '\uD83C\uDFC6 EN Y\u00DCKSEK SKOR!' : `En Y\u00FCksek: ${hs}`;
    const hsColor = isNewHS ? '#ffd700' : '#445566';
    add(this.add.text(cx, cy + 72, hsLabel, {
      fontSize: isNewHS ? '18px' : '14px', fontFamily: 'Arial',
      fontStyle: isNewHS ? 'bold' : 'normal', color: hsColor
    }).setOrigin(0.5).setDepth(51));

    // Divider
    const d2 = this.add.graphics().setDepth(51);
    d2.lineStyle(1, 0x661111, 0.5)
      .beginPath().moveTo(cx - 130, cy + 94).lineTo(cx + 130, cy + 94).strokePath();
    goObjs.push(d2);

    // ── Rewarded-ad button — watch ad for +3 balls ────────────────────────────
    const adBg = add(this.add.rectangle(cx, cy + 108, 270, 42, 0x1a1100, 1)
      .setDepth(51).setStrokeStyle(1, 0x886600).setInteractive({ useHandCursor: true }));
    const adBtn = add(this.add.text(cx, cy + 108, '\uD83D\uDCFA  Reklam izle  \u2192  +3 Top', {
      fontSize: '15px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ccaa00',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(52).setInteractive({ useHandCursor: true }));

    const onAdWatch = () => {
      this.ads.showRewardedAd(() => {
        this.economy.setBalls(this.economy.getBalls() + 3);
        this._syncRegistry();
        goObjs.forEach(o => { try { o.destroy(); } catch {} });
        this.state = STATE.IDLE;
        this._resetBall();
      });
    };
    adBg .on('pointerover',  () => adBg.setFillStyle(0x2a1e00));
    adBg .on('pointerout',   () => adBg.setFillStyle(0x1a1100));
    adBg .on('pointerdown',  onAdWatch);
    adBtn.on('pointerdown',  onAdWatch);

    // ── Retry button — large and touch-friendly ───────────────────────────────
    const btnBg = add(this.add.rectangle(cx, cy + 162, 250, 48, 0x003311, 1)
      .setDepth(51).setStrokeStyle(2, 0x44ff88).setInteractive({ useHandCursor: true }));
    const btn = add(this.add.text(cx, cy + 162, 'TEKRAR OYNA', {
      fontSize: '22px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#44ff88', stroke: '#001100', strokeThickness: 2
    }).setOrigin(0.5).setDepth(52).setInteractive({ useHandCursor: true }));

    const onOver = () => { btnBg.setFillStyle(0x005522); btn.setStyle({ color: '#88ffbb' }); };
    const onOut  = () => { btnBg.setFillStyle(0x003311); btn.setStyle({ color: '#44ff88' }); };
    const onDown = () => {
      goObjs.forEach(o => o.destroy());
      // Player is back — cancel the "refill ready" notification
      this.notifs.cancelInactivity();
      this.notifs._cancel([2]).catch(() => {});
      this.economy.reset(); // resets balls to 100, gems and coins persist
      this.levelMgr.reset();
      this.score = 0;
      this._resetBall();
      this._loadLevel();
    };

    btnBg.on('pointerover', onOver).on('pointerout', onOut).on('pointerdown', onDown);
    btn  .on('pointerover', onOver).on('pointerout', onOut).on('pointerdown', onDown);

    // Slide panel in
    panel   .setY(H + 200);
    panelGlow.setY(H + 200);
    scoreTxt.setY(cy - 28 + H + 200 - cy); // won't work directly — use container approach

    // Simple alpha fade-in instead
    [panel, panelGlow].forEach(o => {
      o.setY(cy);
      o.setAlpha(0);
      this.tweens.add({ targets: o, alpha: 1, duration: 300, ease: 'Power2' });
    });
    goObjs.filter(o => o !== overlay && o !== panel && o !== panelGlow).forEach(o => {
      if (!o || !o.setAlpha) return;
      o.setAlpha(0);
      this.tweens.add({ targets: o, alpha: 1, duration: 400, delay: 150, ease: 'Power2' });
    });
  }

  // ─── Scene lifecycle ──────────────────────────────────────────────────────────

  /**
   * Called by Phaser when game.pause() fires (app goes to background).
   * Phaser stops the RAF loop, so time.now freezes — the aim-timer stops
   * naturally. We additionally suspend the AudioContext to release CPU.
   */
  pause() {
    try {
      if (this.sounds && this.sounds._ctx) {
        this.sounds._ctx.suspend().catch(() => {});
      }
    } catch {}
  }

  /**
   * Called by Phaser when game.resume() fires (app returns to foreground).
   * Because time.now picks up where it left off (Phaser's loop.wake()
   * resets lastTime), the aim-timer is already correct — no correction needed.
   * We just unlock the AudioContext and refresh the HUD.
   */
  resume() {
    // Unlock AudioContext (Android suspends it on background)
    if (this.sounds) this.sounds.startIfEnabled();

    // Refresh the HUD (ball count, gems, etc.)
    this._syncRegistry();
  }

  // ─── Double Ball Mode ─────────────────────────────────────────────────────

  _createDoubleBallUI() {
    const W = this.scale.width;
    this.doubleBadge = this.add.text(W - 12, 180, '⚾×2', {
      fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffffff', backgroundColor: '#ff6f00',
      padding: { x: 6, y: 3 },
    }).setOrigin(1, 0).setDepth(10).setVisible(false);
  }

  _initDoubleBallMode() {
    this.doubleBallActive = false;
    this.doubleBallQuota  = 0;
    this.extraBall        = null;
    this._checkDoubleBallMode();
  }

  _checkDoubleBallMode() {
    const active = localStorage.getItem('cupbounce_double_ball_active') === 'true';
    const quota  = parseInt(localStorage.getItem('cupbounce_double_ball_quota') || '0', 10);
    this.doubleBallActive = active && quota > 0;
    this.doubleBallQuota  = quota;

    if (this.doubleBadge) {
      this.doubleBadge.setVisible(this.doubleBallActive);
      if (this.doubleBallActive) {
        this.doubleBadge.setText(`⚾×2 (${quota})`);
      }
    }
  }

  _handleDoubleBallShot(vx, vy) {
    if (!this.doubleBallActive || this.doubleBallQuota <= 0) return;

    this._launchExtraBall(vx, vy);

    this.doubleBallQuota--;
    localStorage.setItem('cupbounce_double_ball_quota', String(this.doubleBallQuota));

    if (this.doubleBallQuota <= 0) {
      localStorage.removeItem('cupbounce_double_ball_active');
      localStorage.setItem('cupbounce_double_ball_quota', '0');
      this.doubleBallActive = false;
      if (this.doubleBadge) this.doubleBadge.setVisible(false);
      this._showBoosterToast('Çift top hakkı bitti!', '#ff9900');
    } else {
      if (this.doubleBadge) this.doubleBadge.setText(`⚾×2 (${this.doubleBallQuota})`);
    }
  }

  _launchExtraBall(vx, vy) {
    this._destroyExtraBall();

    // Side offset so balls don't perfectly overlap
    const dx     = vx >= 0 ? -18 : 18;
    const sprite = this.add.circle(this.bowX + dx, this.ballRestY, 12, 0xff9900, 0.9)
      .setDepth(10);

    this.physics.add.existing(sprite);
    const body = sprite.body;
    body.setCircle(12, 0, 0);
    body.setCollideWorldBounds(true);
    body.setBounce(0.55, 0.55);
    body.setMaxVelocity(1500, 2000);
    body.setAllowGravity(true);
    body.setGravityY(620); // matches Ball.js
    // Slight divergence so it follows a different arc
    body.setVelocity(vx * 0.93 + dx * 0.6, vy * 0.96);

    this.extraBall = {
      sprite,
      getX:         () => sprite.x,
      getY:         () => sprite.y,
      getVelocityY: () => body.velocity.y,
      destroy:      () => { try { sprite.destroy(); } catch {} },
    };
  }

  _destroyExtraBall() {
    if (this.extraBall) {
      this.extraBall.destroy();
      this.extraBall = null;
    }
  }

  // ─── Speed Timer ─────────────────────────────────────────────────────────

  _initSpeedTimer() {
    const W = this.scale.width;
    const x = W - 48;
    const y = 140;
    const R = 20;

    this._speedTimerGfx = this.add.graphics().setDepth(25);
    this._speedTimerTxt = this.add.text(x, y, '', {
      fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(26);

    this._speedTimerX   = x;
    this._speedTimerY   = y;
    this._speedTimerR   = R;
    this._speedTimerRunning = false;
    this._speedTimerStart   = 0;
    this._speedTimerEvent   = null;

    this._speedTimerGfx.setVisible(false);
    this._speedTimerTxt.setVisible(false);
  }

  _startSpeedTimer() {
    const level = parseInt(localStorage.getItem('cupbounce_level') || '1', 10);
    if (level < 30) return;

    this._speedTimerRunning = true;
    this._speedTimerStart   = this.time.now;

    this._speedTimerGfx.setVisible(true);
    this._speedTimerTxt.setVisible(true);

    if (this._speedTimerEvent) this._speedTimerEvent.remove();
    this._speedTimerEvent = this.time.addEvent({
      delay: 100, loop: true, callback: this._tickSpeedTimer, callbackScope: this,
    });
  }

  _tickSpeedTimer() {
    if (!this._speedTimerRunning) return;

    const elapsed = (this.time.now - this._speedTimerStart) / 1000;
    const pct     = Math.max(0, 1 - elapsed / 10);

    const color = pct > 0.5 ? 0x00ee44
                : pct > 0.25 ? 0xff9900
                :              0xff2222;

    const g = this._speedTimerGfx;
    const x = this._speedTimerX;
    const y = this._speedTimerY;
    const R = this._speedTimerR;

    g.clear();
    // Track
    g.lineStyle(4, 0x222244, 0.7);
    g.beginPath();
    g.arc(x, y, R, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(270), false);
    g.strokePath();
    // Fill
    if (pct > 0) {
      g.lineStyle(4, color, 1);
      g.beginPath();
      g.arc(x, y, R, Phaser.Math.DegToRad(-90),
            Phaser.Math.DegToRad(-90 + 360 * pct), false);
      g.strokePath();
    }

    const remaining = Math.ceil(Math.max(0, 10 - elapsed));
    this._speedTimerTxt.setText(String(remaining));

    if (elapsed >= 10) {
      this._stopSpeedTimer();
    }
  }

  _stopSpeedTimer() {
    this._speedTimerRunning = false;
    if (this._speedTimerEvent) {
      this._speedTimerEvent.remove();
      this._speedTimerEvent = null;
    }
    if (this._speedTimerGfx) this._speedTimerGfx.setVisible(false);
    if (this._speedTimerTxt) this._speedTimerTxt.setVisible(false);
  }

  _getSpeedBonus(timeUsed) {
    if (timeUsed <= 2) return { mult: 2.0,  label: '⚡ SÜPER HIZLI! ×2' };
    if (timeUsed <= 4) return { mult: 1.5,  label: '🔥 Hızlı! ×1.5' };
    if (timeUsed <= 7) return { mult: 1.25, label: '👍 Güzel! ×1.25' };
    return { mult: 1.0, label: '' };
  }

  _applySpeedBonus(baseScore) {
    if (!this._speedTimerRunning && this._speedTimerStart === 0) return baseScore;

    const timeUsed = this._speedTimerRunning
      ? (this.time.now - this._speedTimerStart) / 1000
      : 10;

    this._stopSpeedTimer();

    const { mult, label } = this._getSpeedBonus(timeUsed);
    if (mult > 1 && label) {
      this._showSpeedBonusLabel(label, mult);
    }
    return Math.round(baseScore * mult);
  }

  _showSpeedBonusLabel(label, multiplier) {
    const W = this.scale.width;
    const lbl = this.add.text(W / 2, 320, label, {
      fontSize:        '28px',
      fontFamily:      '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",Arial',
      fontStyle:       'bold',
      color:           multiplier >= 2 ? '#ff4400' : multiplier >= 1.5 ? '#ffaa00' : '#ffdd44',
      stroke:          '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(36).setScale(0.4);

    this.tweens.add({
      targets: lbl, scaleX: 1, scaleY: 1,
      duration: 200, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: lbl,
          y: lbl.y - 80, alpha: 0,
          duration: 900, delay: 200, ease: 'Power2.easeIn',
          onComplete: () => lbl.destroy(),
        });
      },
    });
  }

  // ─── Wall Gaps ────────────────────────────────────────────────────────────

  _createWallsWithGaps(levelData) {
    const W = this.scale.width;
    const wallDefs = levelData.wallGaps; // array of {y, gaps:[{from,to}]}

    wallDefs.forEach(wallDef => {
      const y    = wallDef.y;
      const gaps = wallDef.gaps || [];

      // Get segments (areas between gaps)
      const segments = this._splitSegment(0, W, gaps);

      segments.forEach(seg => {
        // Static physics wall segment
        const segW = seg.to - seg.from;
        const segX = seg.from + segW / 2;

        const wall = this.add.rectangle(segX, y, segW, 4, 0x4466cc, 0.85)
          .setDepth(8);
        const phys = this.physics.add.staticImage(segX, y, '__DEFAULT')
          .setDisplaySize(segW, 4)
          .setVisible(false)
          .refreshBody();

        this.physics.add.collider(this.ball, phys);

        this._wallGapObjs.push(wall, phys);
      });

      // ⚠ warning icons at gap edges
      gaps.forEach(gap => {
        const midX = (gap.from + gap.to) / 2;
        const icon = this.add.text(midX, y - 14, '⚠', {
          fontSize: '13px', fontFamily: 'Arial', color: '#ffaa00',
        }).setOrigin(0.5).setDepth(9);
        this._wallGapObjs.push(icon);
      });
    });
  }

  _splitSegment(from, to, gaps) {
    const segments = [];
    let cur = from;

    const sorted = [...gaps].sort((a, b) => a.from - b.from);
    sorted.forEach(gap => {
      if (gap.from > cur) {
        segments.push({ from: cur, to: gap.from });
      }
      cur = gap.to;
    });

    if (cur < to) {
      segments.push({ from: cur, to });
    }

    return segments;
  }

  shutdown() {
    if (this.sounds) this.sounds.destroy();
    if (this.notifs) this.notifs.scheduleInactivity();

    // Bekleyen cloud save'i hemen gönder
    if (this.cloud && this._cloudUid) {
      this.cloud.flush(this._cloudUid).catch(() => {});
    }
    EconomyManager.unregisterCloudSave();
  }

}
