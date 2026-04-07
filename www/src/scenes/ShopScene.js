import { EconomyManager } from '../managers/EconomyManager.js';
import { BoosterManager  } from '../managers/BoosterManager.js';
import { AdManager }       from '../managers/AdManager.js';

// ─── ShopScene ────────────────────────────────────────────────────────────────
// Overlay scene launched on top of GameScene + UIScene.
// GameScene is put to sleep while this scene is active.

export class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  create() {
    this.economy  = new EconomyManager();
    this.boosters = new BoosterManager();
    this.ads      = new AdManager(this);
    this._tab     = 'top';
    this._items   = [];   // currently rendered tab content

    const W = this.scale.width;
    const H = this.scale.height;

    // Dim backdrop — click outside panel to close
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.72)
      .setDepth(200).setInteractive();
    dim.on('pointerdown', () => this._close());

    // Panel
    this._panelW = 350;
    this._panelH = 570;
    this._cx     = W / 2;
    this._cy     = H / 2;

    const panelBg = this.add.rectangle(this._cx, this._cy, this._panelW, this._panelH, 0x08081e, 0.98)
      .setDepth(201).setStrokeStyle(2, 0x3355cc);
    // Stop clicks from falling through panel
    panelBg.setInteractive();

    // Title
    this.add.text(this._cx, this._cy - this._panelH / 2 + 26, 'MAĞAZA', {
      fontSize: '22px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#e0e8ff', stroke: '#000033', strokeThickness: 3
    }).setOrigin(0.5).setDepth(202);

    // Close button
    const closeBtn = this.add.text(
      this._cx + this._panelW / 2 - 22, this._cy - this._panelH / 2 + 22, '\u2715', {
        fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold', color: '#778899'
      }
    ).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerover', () => closeBtn.setStyle({ color: '#ffffff' }));
    closeBtn.on('pointerout',  () => closeBtn.setStyle({ color: '#778899' }));
    closeBtn.on('pointerdown', () => this._close());

    // Tabs
    this._buildTabs();

    // First content
    this._showTab('top');
  }

  // ── Tabs ───────────────────────────────────────────────────────────────────

  _buildTabs() {
    const tabLabels = ['TOP', 'BOOSTER', 'GEM', 'REKLAM'];
    const tabW   = 72;
    const tabGap = 4;
    const tabH   = 30;
    const tabY   = this._cy - this._panelH / 2 + 62;
    // Centre N tabs: first-center = cx - (N-1)/2 * (tabW+gap)
    const startX = this._cx - 1.5 * (tabW + tabGap);

    this._tabBtns = {};
    tabLabels.forEach((lbl, i) => {
      const tx  = startX + i * (tabW + tabGap);
      const bg  = this.add.rectangle(tx, tabY, tabW, tabH, 0x0d1035)
        .setDepth(202).setStrokeStyle(1, 0x334477).setInteractive({ useHandCursor: true });
      const txt = this.add.text(tx, tabY, lbl, {
        fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', color: '#7788bb'
      }).setOrigin(0.5).setDepth(203).setInteractive({ useHandCursor: true });

      const key = lbl.toLowerCase();
      bg .on('pointerdown', () => this._showTab(key));
      txt.on('pointerdown', () => this._showTab(key));
      this._tabBtns[key] = { bg, txt };
    });
  }

  _activateTab(key) {
    Object.entries(this._tabBtns).forEach(([k, { bg, txt }]) => {
      if (k === key) {
        bg.setFillStyle(0x142060).setStrokeStyle(2, 0x4466ff);
        txt.setStyle({ color: '#ffffff' });
      } else {
        bg.setFillStyle(0x0d1035).setStrokeStyle(1, 0x334477);
        txt.setStyle({ color: '#7788bb' });
      }
    });
  }

  _showTab(key) {
    this._tab = key;
    this._activateTab(key);
    this._clearItems();
    this._contentY = this._cy - this._panelH / 2 + 108;

    if (key === 'top')     this._buildTopTab();
    if (key === 'booster') this._buildBoosterTab();
    if (key === 'gem')     this._buildGemTab();
    if (key === 'reklam')  this._buildAdTab();
  }

  _clearItems() {
    this._items.forEach(o => o.destroy());
    this._items = [];
  }

  _reg(obj) { this._items.push(obj); return obj; }

  // ── TOP tab ───────────────────────────────────────────────────────────────

  _buildTopTab() {
    let y = this._contentY;
    const cx = this._cx;

    this._reg(this.add.text(cx, y, `\uD83E\uDE99 ${this.economy.getCoins()} coin    \u25CF ${this.economy.getBalls()} top`, {
      fontSize: '15px', fontFamily: 'Arial', color: '#99aabb'
    }).setOrigin(0.5).setDepth(203));
    y += 38;

    [
      { label: '+5 Top',  desc: 'Küçük paket',    cost: 50,  balls: 5  },
      { label: '+20 Top', desc: 'Orta paket',      cost: 150, balls: 20 },
      { label: '+50 Top', desc: 'Büyük paket',     cost: 300, balls: 50 },
    ].forEach(item => {
      this._buildRow(cx, y, item.label, item.desc, `${item.cost} \uD83E\uDE99`, () => {
        if (!this.economy.spendCoins(item.cost)) {
          this._toast('Yeterli coin yok!', '#ff5555'); return;
        }
        this.economy.setBalls(this.economy.getBalls() + item.balls);
        this.registry.set('balls', this.economy.getBalls());
        this.registry.set('coins', this.economy.getCoins());
        this._toast(`+${item.balls} top eklendi!`, '#44ff88');
        this._showTab('top');
      });
      y += 80;
    });
  }

  // ── BOOSTER tab ───────────────────────────────────────────────────────────

  _buildBoosterTab() {
    let y = this._contentY;
    const cx = this._cx;

    this._reg(this.add.text(cx, y, `\u25C6 ${this.economy.getGems()} gem`, {
      fontSize: '15px', fontFamily: 'Arial', color: '#cc88ff'
    }).setOrigin(0.5).setDepth(203));
    y += 38;

    [
      { key: 'x2Score',    label: '\u00D72 Skor',       desc: '1 level geçerli',    cost: 50, uses: 1  },
      { key: 'aimAssist',  label: 'Nişangah Yardımı',  desc: '3 atış geçerli',     cost: 25, uses: 3  },
      { key: 'slowMotion', label: 'Yavaş Hareket',     desc: '1 level geçerli',    cost: 40, uses: 1  },
      { key: 'extraLife',  label: 'Ekstra Can',         desc: 'Top 1 kez yanmaz',   cost: 35, uses: 1  },
    ].forEach(item => {
      const charge = this.boosters.get(item.key);
      this._buildRow(
        cx, y,
        `${item.label}  [${charge}]`, item.desc,
        `${item.cost} \u25C6`,
        () => {
          if (!this.economy.spendGems(item.cost)) {
            this._toast('Yeterli gem yok!', '#ff5555'); return;
          }
          this.boosters.add(item.key, item.uses);
          this.registry.set('gems', this.economy.getGems());
          this._toast(`${item.label} aktif!`, '#cc88ff');
          this._showTab('booster');
        }
      );
      y += 80;
    });
  }

  // ── GEM tab ───────────────────────────────────────────────────────────────

  _buildGemTab() {
    let y = this._contentY;
    const cx = this._cx;

    this._reg(this.add.text(cx, y, 'Gem satın al', {
      fontSize: '15px', fontFamily: 'Arial', color: '#cc88ff'
    }).setOrigin(0.5).setDepth(203));
    y += 38;

    [
      { amount: 100, label: 'Başlangıç',  colour: '#aaccff' },
      { amount: 250, label: 'Standart',   colour: '#88eeff' },
      { amount: 700, label: 'Avantaj',    colour: '#ffdd88' },
    ].forEach(item => {
      this._buildRow(
        cx, y,
        `\u25C6 ${item.amount} Gem`, item.label, 'Yakında!',
        () => this._toast('Ödeme sistemi yakında! \uD83D\uDE80', '#ffcc44'),
        '#ffcc44'
      );
      y += 80;
    });

    this._reg(this.add.text(cx, y + 10, 'Gerçek ödeme sistemi yakında geliyor', {
      fontSize: '12px', fontFamily: 'Arial', color: '#334455'
    }).setOrigin(0.5).setDepth(203));
  }

  // ── REKLAM tab ────────────────────────────────────────────────────────────

  _buildAdTab() {
    let y = this._contentY;
    const cx = this._cx;

    const watched  = this.ads.getAdWatches();
    const ADS_PER_GEM = 3;
    const remaining   = ADS_PER_GEM - (watched % ADS_PER_GEM);

    // Header info
    this._reg(this.add.text(cx, y, '\uD83D\uDCFA Reklam izleyerek \u00FCcretsiz \u00F6d\u00FCl kazan!', {
      fontSize: '13px', fontFamily: 'Arial', color: '#aabbcc', align: 'center'
    }).setOrigin(0.5).setDepth(203));
    y += 28;

    // Gem progress bar
    const BAR_W = 270, BAR_H = 14;
    this._reg(this.add.rectangle(cx, y, BAR_W, BAR_H, 0x0a0a20)
      .setDepth(203).setStrokeStyle(1, 0x223366));
    const fillPct = (watched % ADS_PER_GEM) / ADS_PER_GEM;
    if (fillPct > 0) {
      this._reg(this.add.rectangle(
        cx - BAR_W / 2 + (BAR_W * fillPct) / 2, y,
        BAR_W * fillPct, BAR_H - 4, 0x8833cc
      ).setDepth(204));
    }
    y += 20;
    this._reg(this.add.text(cx, y, `\u25C6 +1 Gem i\u00e7in ${remaining} reklam daha izle`, {
      fontSize: '12px', fontFamily: 'Arial', color: '#7755aa'
    }).setOrigin(0.5).setDepth(203));
    y += 36;

    // 3 watch-ad rows (+3 balls each)
    for (let i = 0; i < 3; i++) {
      const label = `\uD83D\uDCFA Reklam #${i + 1}`;
      const desc  = '+3 Top (ve gem progress)';

      this._buildAdRow(cx, y, label, desc, () => {
        this.ads.showRewardedAd(() => {
          // +3 balls
          this.economy.setBalls(this.economy.getBalls() + 3);
          this.registry.set('balls', this.economy.getBalls());

          // Gem milestone every 3 ads
          const total = this.ads.addAdWatch();
          if (total % ADS_PER_GEM === 0) {
            this.economy.addGems(1);
            this.registry.set('gems', this.economy.getGems());
            this._toast('+3 Top ve +1 Gem kazan\u0131ld\u0131! \u25C6', '#cc88ff');
          } else {
            this._toast('+3 Top kazan\u0131ld\u0131!', '#44ff88');
          }

          // Rebuild tab to refresh progress
          this._showTab('reklam');
        });
      });
      y += 80;
    }
  }

  _buildAdRow(cx, y, label, desc, onWatch) {
    const RW = 318, RH = 68;
    this._reg(this.add.rectangle(cx, y + RH / 2, RW, RH, 0x0c0e20)
      .setDepth(202).setStrokeStyle(1, 0x1e2a44));

    this._reg(this.add.text(cx - RW / 2 + 14, y + 14, label, {
      fontSize: '16px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ccd4f0'
    }).setOrigin(0, 0).setDepth(203));

    this._reg(this.add.text(cx - RW / 2 + 14, y + 36, desc, {
      fontSize: '12px', fontFamily: 'Arial', color: '#55667a'
    }).setOrigin(0, 0).setDepth(203));

    const btnW = 90, btnH = 34;
    const bx   = cx + RW / 2 - btnW / 2 - 8;
    const by   = y + RH / 2;

    const btnBg = this._reg(
      this.add.rectangle(bx, by, btnW, btnH, 0x1a1100)
        .setDepth(203).setStrokeStyle(1, 0x886600).setInteractive({ useHandCursor: true })
    );
    const btnTxt = this._reg(
      this.add.text(bx, by, '\uD83D\uDCFA \u0130zle', {
        fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ccaa00'
      }).setOrigin(0.5).setDepth(204).setInteractive({ useHandCursor: true })
    );

    btnBg .on('pointerover',  () => btnBg.setFillStyle(0x2a1e00));
    btnBg .on('pointerout',   () => btnBg.setFillStyle(0x1a1100));
    btnBg .on('pointerdown',  onWatch);
    btnTxt.on('pointerdown',  onWatch);
  }

  // ── Row builder ───────────────────────────────────────────────────────────

  _buildRow(cx, y, label, desc, priceLabel, onBuy, btnColor = '#aaccff') {
    const RW = 318, RH = 68;
    const bg = this._reg(
      this.add.rectangle(cx, y + RH / 2, RW, RH, 0x0c1028)
        .setDepth(202).setStrokeStyle(1, 0x1e2f66)
    );

    this._reg(this.add.text(cx - RW / 2 + 14, y + 14, label, {
      fontSize: '16px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ccd4f0'
    }).setOrigin(0, 0).setDepth(203));

    this._reg(this.add.text(cx - RW / 2 + 14, y + 36, desc, {
      fontSize: '12px', fontFamily: 'Arial', color: '#55667a'
    }).setOrigin(0, 0).setDepth(203));

    // Buy button
    const btnW = 90, btnH = 34;
    const bx   = cx + RW / 2 - btnW / 2 - 8;
    const by   = y + RH / 2;

    const btnBg  = this._reg(
      this.add.rectangle(bx, by, btnW, btnH, 0x112255)
        .setDepth(203).setStrokeStyle(1, 0x3355aa).setInteractive({ useHandCursor: true })
    );
    const btnTxt = this._reg(
      this.add.text(bx, by, priceLabel, {
        fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', color: btnColor
      }).setOrigin(0.5).setDepth(204).setInteractive({ useHandCursor: true })
    );

    btnBg .on('pointerover',  () => btnBg.setFillStyle(0x1a3d8a));
    btnBg .on('pointerout',   () => btnBg.setFillStyle(0x112255));
    btnBg .on('pointerdown',  () => onBuy());
    btnTxt.on('pointerdown',  () => onBuy());
  }

  // ── Toast ─────────────────────────────────────────────────────────────────

  _toast(msg, color = '#ffffff') {
    const t = this.add.text(this._cx, this._cy + this._panelH / 2 - 36, msg, {
      fontSize: '17px', fontFamily: 'Arial', fontStyle: 'bold',
      color, stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(210);

    this.tweens.add({
      targets: t, y: t.y - 55, alpha: 0,
      duration: 1400, ease: 'Power2.easeIn',
      onComplete: () => t.destroy()
    });
  }

  // ── Close ─────────────────────────────────────────────────────────────────

  _close() {
    this.scene.stop('ShopScene');
    this.scene.wake('GameScene');
  }
}
