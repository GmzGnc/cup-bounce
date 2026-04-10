import { SeasonManager } from '../managers/SeasonManager.js';
import { EconomyManager } from '../managers/EconomyManager.js';

// ─── SeasonScene ─────────────────────────────────────────────────────────────
// Aktif sezonu karşılayan animasyonlu popup.
// GameScene.create() içinde — günlük giriş popupından sonra — başlatılır.
// Aktif sezon yoksa veya popup zaten görüldüyse hemen kapanır.

export class SeasonScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SeasonScene' });
  }

  create() {
    const W      = this.scale.width;
    const H      = this.scale.height;
    const mgr    = new SeasonManager();
    const season = mgr.getActiveSeason();

    if (!season || mgr.hasSeenPopup(season.id)) {
      this.scene.stop();
      return;
    }

    mgr.markPopupSeen(season.id);

    const eco    = new EconomyManager();
    const canClaim = mgr.claimBonus(season.id);
    const theme  = season.theme;
    const CY     = Math.round(H * 0.44);
    const D      = 60;

    // ── Overlay ──────────────────────────────────────────────────────────────
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6)
      .setDepth(D).setInteractive();

    const popupObjs = [overlay];
    const cardObjs  = [];
    const reg  = o => { popupObjs.push(o); return o; };
    const card = o => { popupObjs.push(o); cardObjs.push(o); return o; };

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      overlay.setVisible(false);
      this.tweens.add({
        targets:  cardObjs,
        scaleX:   0.4, scaleY: 0.4, alpha: 0,
        duration: 200, ease: 'Back.easeIn',
        onComplete: () => {
          popupObjs.forEach(o => { try { o.destroy(); } catch {} });
          this.scene.stop();
        }
      });
    };

    // ── Kart ─────────────────────────────────────────────────────────────────
    card(this.add.rectangle(W / 2, CY, 300, 320, 0x080818)
      .setDepth(D + 1).setStrokeStyle(2, theme.accentColor));

    // İç parlama çerçevesi
    card(this.add.rectangle(W / 2, CY, 294, 314, 0x000000, 0)
      .setDepth(D + 1).setStrokeStyle(1, theme.accentColor, 0.35));

    // Üst aksanlı çizgi
    card(this.add.rectangle(W / 2, CY - 160, 300, 3, theme.accentColor)
      .setDepth(D + 2).setAlpha(0.8));

    // ── İkon (büyük) ─────────────────────────────────────────────────────────
    card(this.add.text(W / 2, CY - 120, season.icon, {
      fontSize: '52px',
      fontFamily: '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",Arial'
    }).setOrigin(0.5).setDepth(D + 3));

    // ── Sezon adı ────────────────────────────────────────────────────────────
    card(this.add.text(W / 2, CY - 52, season.name, {
      fontSize: '22px', fontFamily: 'Arial', fontStyle: 'bold',
      color: Phaser.Display.Color.IntegerToColor(theme.accentColor).rgba,
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(D + 3));

    // ── Açıklama ─────────────────────────────────────────────────────────────
    card(this.add.text(W / 2, CY + 8, season.description, {
      fontSize: '14px', fontFamily: 'Arial', color: '#aabbcc',
      align: 'center', lineSpacing: 6
    }).setOrigin(0.5).setDepth(D + 3));

    // ── Ödül kutusu ───────────────────────────────────────────────────────────
    if (canClaim) {
      const { type, amount } = season.bonus;
      const rewardLabel = _rewardLabel(type, amount);
      const rewardColor = _rewardColor(type);

      card(this.add.rectangle(W / 2, CY + 76, 220, 44, 0x0a0a22)
        .setDepth(D + 2).setStrokeStyle(1, theme.accentColor, 0.6));

      card(this.add.text(W / 2, CY + 76, `\u{1F381} ${rewardLabel}`, {
        fontSize: '16px', fontFamily: 'Arial', fontStyle: 'bold',
        color: rewardColor, stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5).setDepth(D + 3));

      // Ödülü ekonomiye ekle
      _applyReward(eco, type, amount);
      // registry güncelle (GameScene varsa)
      try {
        const gs = this.scene.get('GameScene');
        if (gs && gs._syncRegistry) gs._syncRegistry();
      } catch {}
    }

    // ── Kapat butonu ─────────────────────────────────────────────────────────
    const btnY   = CY + 136;
    const btnBg  = card(this.add.rectangle(W / 2, btnY, 180, 40, 0x0f3020)
      .setDepth(D + 2).setStrokeStyle(2, theme.accentColor).setInteractive({ useHandCursor: true }));
    const btnTxt = card(this.add.text(W / 2, btnY, 'Harika! \uD83C\uDF89', {
      fontSize: '15px', fontFamily: 'Arial', fontStyle: 'bold',
      color: Phaser.Display.Color.IntegerToColor(theme.accentColor).rgba
    }).setOrigin(0.5).setDepth(D + 3).setInteractive({ useHandCursor: true }));

    btnBg .on('pointerover',  () => btnBg.setFillStyle(0x1a4a32));
    btnBg .on('pointerout',   () => btnBg.setFillStyle(0x0f3020));
    btnBg .on('pointerdown',  close);
    btnTxt.on('pointerdown',  close);
    overlay.on('pointerdown', close);

    // ── Parçacık yağmuru ─────────────────────────────────────────────────────
    this._spawnParticles(W, theme.particleColor, D);

    // ── Scale-in animasyonu ───────────────────────────────────────────────────
    cardObjs.forEach(o => { o.setScale(0.5).setAlpha(0); });
    this.tweens.add({
      targets: cardObjs, scaleX: 1, scaleY: 1, alpha: 1,
      duration: 340, ease: 'Back.easeOut'
    });

    // ── Otomatik kapanma (5 s) ────────────────────────────────────────────────
    this.time.delayedCall(5000, close);
  }

  _spawnParticles(W, color, D) {
    const col = Phaser.Display.Color.IntegerToColor(color).rgba;
    for (let i = 0; i < 30; i++) {
      const px  = Phaser.Math.Between(10, W - 10);
      const py  = Phaser.Math.Between(-10, -100);
      const sz  = Phaser.Math.FloatBetween(3, 7);
      const p   = this.add.circle(px, py, sz, color, 0.85).setDepth(D + 5);

      this.tweens.add({
        targets:  p,
        y:        this.scale.height + 20,
        x:        px + Phaser.Math.Between(-60, 60),
        alpha:    0,
        duration: Phaser.Math.Between(1500, 3500),
        delay:    Phaser.Math.Between(0, 1200),
        ease:     'Linear',
        onComplete: () => p.destroy()
      });
    }
  }
}

// ─── Modül yardımcıları ───────────────────────────────────────────────────────

function _rewardLabel(type, amount) {
  switch (type) {
    case 'gems':  return `+${amount} Gem`;
    case 'coins': return `+${amount} Coin`;
    case 'balls': return `+${amount} Top`;
    default:      return `+${amount}`;
  }
}

function _rewardColor(type) {
  switch (type) {
    case 'gems':  return '#cc88ff';
    case 'coins': return '#ffdd66';
    case 'balls': return '#88eeff';
    default:      return '#ffffff';
  }
}

function _applyReward(eco, type, amount) {
  switch (type) {
    case 'gems':  eco.addGems(amount);  break;
    case 'coins': eco.addCoins(amount); break;
    case 'balls': eco.setBalls(Math.min(eco.getBalls() + amount, eco.getMaxBalls())); break;
  }
}
