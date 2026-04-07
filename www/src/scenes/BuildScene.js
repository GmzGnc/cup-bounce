import { EconomyManager } from '../managers/EconomyManager.js';

// ─── Alan tanımları ───────────────────────────────────────────────────────────
const AREAS = [
  { id: 'cafe',     name: 'Kafe',          cost: 10000,  color: 0xc8792e, abbr: 'KF',
    desc: 'S\u0131cak bir bulu\u015fma noktas\u0131' },
  { id: 'garden',   name: 'Bah\u00e7e',    cost: 25000,  color: 0x4caf50, abbr: 'BH',
    desc: 'Dinlendirici ye\u015fil alan' },
  { id: 'arcade',   name: 'Oyun Salonu',   cost: 50000,  color: 0x2196f3, abbr: 'OS',
    desc: 'E\u011flencenin merkezi' },
  { id: 'stage',    name: 'Sahne',         cost: 90000,  color: 0x9c27b0, abbr: 'SH',
    desc: 'G\u00f6steri ve performans alan\u0131' },
  { id: 'workshop', name: 'At\u00f6lye',   cost: 140000, color: 0xff5722, abbr: 'AT',
    desc: 'Yarat\u0131c\u0131 \u00e7al\u0131\u015fmalar i\u00e7in' },
  { id: 'funpark',  name: 'E\u011flence Park\u0131', cost: 200000, color: 0xf5c400, abbr: 'EP',
    desc: 'Dev e\u011flence kompleksi' },
];

const CARD_H   = 82;
const CARD_GAP = 7;
const CARD_W   = 358;
const START_Y  = 118;

// ─── BuildScene ───────────────────────────────────────────────────────────────
export class BuildScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BuildScene' });
  }

  create() {
    this.economy = new EconomyManager();
    this._cards  = [];   // current card game objects

    const W = this.scale.width;
    const H = this.scale.height;
    this._cx = W / 2;

    // ── Dim backdrop ──────────────────────────────────────────────────────────
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.78)
      .setDepth(200).setInteractive(); // absorb clicks

    // ── Panel ─────────────────────────────────────────────────────────────────
    this.add.rectangle(W / 2, H / 2, W - 10, H - 30, 0x07071e, 0.97)
      .setDepth(201).setStrokeStyle(2, 0x2244aa);

    // ── Header ───────────────────────────────────────────────────────────────
    this.add.text(W / 2, 26, '\u0130N\u015eA MODU', {
      fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#dde8ff', stroke: '#000033', strokeThickness: 3
    }).setOrigin(0.5).setDepth(202);

    // Coin balance
    this._coinLabel = this.add.text(W / 2, 52, '', {
      fontSize: '15px', fontFamily: 'Arial', color: '#ffdd66'
    }).setOrigin(0.5).setDepth(202);
    this._refreshCoinLabel();

    // Separator
    const sep = this.add.graphics().setDepth(202);
    sep.lineStyle(1, 0x1e2f66, 0.9)
      .beginPath().moveTo(20, 68).lineTo(W - 20, 68).strokePath();

    // Close button
    const closeBtn = this.add.text(W - 22, 22, '\u2715', {
      fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold', color: '#778899'
    }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerover', () => closeBtn.setStyle({ color: '#ffffff' }));
    closeBtn.on('pointerout',  () => closeBtn.setStyle({ color: '#778899' }));
    closeBtn.on('pointerdown', () => this._close());

    // Progress indicator (X / 6 alan)
    this._progressLabel = this.add.text(20, 52, '', {
      fontSize: '12px', fontFamily: 'Arial', color: '#445566'
    }).setOrigin(0, 0.5).setDepth(202);
    this._refreshProgressLabel();

    // ── Cards ─────────────────────────────────────────────────────────────────
    this._buildCards();

    // ── Bottom close button ───────────────────────────────────────────────────
    const bottomY = START_Y + AREAS.length * (CARD_H + CARD_GAP) + 20;
    const closeBtnBig = this.add.text(W / 2, bottomY, '[ Geri D\u00f6n ]', {
      fontSize: '18px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#7aadff', stroke: '#000033', strokeThickness: 2
    }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });
    closeBtnBig.on('pointerover', () => closeBtnBig.setStyle({ color: '#aaccff' }));
    closeBtnBig.on('pointerout',  () => closeBtnBig.setStyle({ color: '#7aadff' }));
    closeBtnBig.on('pointerdown', () => this._close());
  }

  // ── Card management ───────────────────────────────────────────────────────

  _buildCards() {
    AREAS.forEach((area, i) => {
      const cardY = START_Y + i * (CARD_H + CARD_GAP);
      this._buildCard(area, cardY);
    });
  }

  _clearCards() {
    this._cards.forEach(o => o.destroy());
    this._cards = [];
  }

  _reg(obj) { this._cards.push(obj); return obj; }

  _buildCard(area, cardY) {
    const cx     = this._cx;
    const isOpen = this.economy.isAreaUnlocked(area.id);
    const coins  = this.economy.getCoins();
    const afford = coins >= area.cost;
    const cy     = cardY + CARD_H / 2;

    // Card background
    const bgColor  = isOpen ? 0x081e0c : 0x0b0f28;
    const brdColor = isOpen ? 0x2d7a2d : (afford ? 0x2244aa : 0x1a1a2e);
    const brdW     = isOpen ? 2 : 1;

    this._reg(
      this.add.rectangle(cx, cy, CARD_W, CARD_H, bgColor)
        .setDepth(203).setStrokeStyle(brdW, brdColor)
    );

    // Colour icon box (54×54)
    const iconX = cx - CARD_W / 2 + 32;
    this._reg(
      this.add.rectangle(iconX, cy, 50, 54, area.color, isOpen ? 0.9 : 0.25)
        .setDepth(204).setStrokeStyle(1, area.color, isOpen ? 1 : 0.4)
    );
    this._reg(
      this.add.text(iconX, cy, area.abbr, {
        fontSize: '15px', fontFamily: 'Arial', fontStyle: 'bold',
        color: isOpen ? '#ffffff' : '#556677'
      }).setOrigin(0.5).setDepth(205)
    );

    // Name
    const textX = cx - CARD_W / 2 + 66;
    this._reg(
      this.add.text(textX, cardY + 18, area.name, {
        fontSize: '16px', fontFamily: 'Arial', fontStyle: 'bold',
        color: isOpen ? '#88ffaa' : '#ccd4f0'
      }).setOrigin(0, 0).setDepth(204)
    );

    // Description
    this._reg(
      this.add.text(textX, cardY + 38, area.desc, {
        fontSize: '11px', fontFamily: 'Arial', color: '#44556a'
      }).setOrigin(0, 0).setDepth(204)
    );

    // Status / cost text
    const statusStr   = isOpen
      ? '\u2713 ACIK'
      : this._fmtCoin(area.cost);
    const statusColor = isOpen ? '#44ff88' : (afford ? '#ffcc44' : '#445566');

    this._reg(
      this.add.text(textX, cardY + 56, statusStr, {
        fontSize: '13px', fontFamily: 'Arial', fontStyle: isOpen ? 'bold' : 'normal',
        color: statusColor
      }).setOrigin(0, 0).setDepth(204)
    );

    // Action button (right side, only when not open)
    if (!isOpen) {
      const btnW  = 86, btnH = 36;
      const btnX  = cx + CARD_W / 2 - btnW / 2 - 6;
      const bFill = afford ? 0x133a13 : 0x111122;
      const bBord = afford ? 0x44cc44 : 0x2a2a40;
      const bTxt  = afford ? '#44ff88' : '#334455';
      const label = afford ? 'Sat\u0131n Al' : 'Yetersiz';

      const btnBg = this._reg(
        this.add.rectangle(btnX, cy, btnW, btnH, bFill)
          .setDepth(204).setStrokeStyle(1, bBord)
      );
      const btnTxt = this._reg(
        this.add.text(btnX, cy, label, {
          fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', color: bTxt
        }).setOrigin(0.5).setDepth(205)
      );

      if (afford) {
        btnBg .setInteractive({ useHandCursor: true });
        btnTxt.setInteractive({ useHandCursor: true });
        const buy = () => this._purchase(area, cardY);
        btnBg .on('pointerover',  () => btnBg.setFillStyle(0x226622));
        btnBg .on('pointerout',   () => btnBg.setFillStyle(bFill));
        btnBg .on('pointerdown',  buy);
        btnTxt.on('pointerdown',  buy);
      }
    }
  }

  // ── Purchase flow ─────────────────────────────────────────────────────────

  _purchase(area, cardY) {
    if (!this.economy.spendCoins(area.cost)) return;
    this._syncRegistry();
    this._refreshCoinLabel();

    // "İnşa Ediliyor" overlay on the card
    const cx = this._cx;
    const cy = cardY + CARD_H / 2;

    const blocker = this.add.rectangle(cx, cy, CARD_W, CARD_H, 0x000000, 0.55)
      .setDepth(210);
    const buildTxt = this.add.text(cx, cy, '\uD83C\uDFD7  \u0130n\u015fa Ediliyor...', {
      fontSize: '17px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffcc44', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(211);

    this.tweens.add({
      targets: buildTxt,
      alpha: 0.25, duration: 350, yoyo: true, repeat: 3,
      onComplete: () => {
        blocker.destroy();
        buildTxt.destroy();

        // Persist + reward
        this.economy.unlockArea(area.id);
        this.economy.setBalls(this.economy.getBalls() + 100);
        this._syncRegistry();
        this._refreshCoinLabel();
        this._refreshProgressLabel();

        // Sound
        const gs = this.scene.get('GameScene');
        if (gs && gs.sounds) gs.sounds.playBuildUnlock();

        // Rebuild cards
        this._clearCards();
        this._buildCards();

        // Confetti
        this._spawnConfetti();

        // Toast
        this._toast(`${area.name} a\u00e7\u0131ld\u0131! +100 Top kazan\u0131ld\u0131!`, '#44ff88');
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _fmtCoin(n) {
    return n.toLocaleString('tr-TR') + ' coin';
  }

  _syncRegistry() {
    this.registry.set('coins', this.economy.getCoins());
    this.registry.set('balls', this.economy.getBalls());
  }

  _refreshCoinLabel() {
    const coins = this.economy.getCoins();
    this._coinLabel.setText('\uD83E\uDE99 ' + coins.toLocaleString('tr-TR') + ' coin');
  }

  _refreshProgressLabel() {
    const total    = AREAS.length;
    const unlocked = AREAS.filter(a => this.economy.isAreaUnlocked(a.id)).length;
    this._progressLabel.setText(`${unlocked} / ${total} alan`);
  }

  _spawnConfetti() {
    const W = this.scale.width;
    const H = this.scale.height;
    const colors = [0xff1744, 0x00e676, 0xffd700, 0x2979ff, 0xcc44ff, 0xff6d00, 0x00bcd4];

    for (let i = 0; i < 50; i++) {
      const col  = colors[Phaser.Math.Between(0, colors.length - 1)];
      const px   = Phaser.Math.Between(20, W - 20);
      const sz   = Phaser.Math.Between(5, 12);
      const tall = Phaser.Math.Between(0, 1);
      const p    = this.add.rectangle(px, -10, sz, tall ? sz * 1.8 : sz, col).setDepth(220);

      this.tweens.add({
        targets:  p,
        y:        H + 20,
        x:        px + Phaser.Math.Between(-70, 70),
        angle:    Phaser.Math.Between(-270, 270),
        duration: Phaser.Math.Between(1000, 2500),
        delay:    Phaser.Math.Between(0, 500),
        ease:     'Linear',
        onComplete: () => p.destroy()
      });
    }
  }

  _toast(msg, color = '#ffffff') {
    const t = this.add.text(this._cx, this.scale.height - 60, msg, {
      fontSize: '17px', fontFamily: 'Arial', fontStyle: 'bold',
      color, stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(225);

    this.tweens.add({
      targets: t, y: t.y - 70, alpha: 0,
      duration: 1800, ease: 'Power2.easeIn',
      onComplete: () => t.destroy()
    });
  }

  // ── Close ─────────────────────────────────────────────────────────────────

  _close() {
    this.scene.stop('BuildScene');
    this.scene.wake('GameScene');
  }
}
