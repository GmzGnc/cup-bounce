// ─── Bina + adım tanımları ────────────────────────────────────────────────────
const BUILDINGS = [
  {
    id: 'kafe', label: 'Kafe', emoji: '☕', unlockLevel: 1,
    x: 390, y: 280,
    steps: [
      { desc: 'Tezgah ve sandalyeler',    cost: 500,   reward: { balls: 20 } },
      { desc: 'Espresso makinesi',         cost: 1200,  reward: { balls: 30 } },
      { desc: 'Dekorasyon ve aydınlatma', cost: 2500,  reward: { gems: 2 } },
      { desc: 'Dış cephe tamamlandı',     cost: 5000,  reward: { balls: 100, gems: 5 } },
    ],
  },
  {
    id: 'bahce', label: 'Bahçe', emoji: '🌿', unlockLevel: 10,
    x: 160, y: 520,
    steps: [
      { desc: 'Toprak düzenleme',         cost: 800,   reward: { balls: 20 } },
      { desc: 'Çiçek ve bitkiler',         cost: 2000,  reward: { balls: 30 } },
      { desc: 'Yürüyüş yolu',             cost: 4000,  reward: { gems: 3 } },
      { desc: 'Çeşme ve banklar',          cost: 8000,  reward: { balls: 100, gems: 8 } },
    ],
  },
  {
    id: 'salon', label: 'Oyun Salonu', emoji: '🎮', unlockLevel: 30,
    x: 620, y: 520,
    steps: [
      { desc: 'Zemin ve duvarlar',         cost: 1500,  reward: { balls: 20 } },
      { desc: 'Oyun makineleri',           cost: 3500,  reward: { balls: 30 } },
      { desc: 'Işık ve ses sistemi',       cost: 7000,  reward: { gems: 4 } },
      { desc: 'Büyük açılış hazır!',       cost: 14000, reward: { balls: 100, gems: 12 } },
    ],
  },
  {
    id: 'sahne', label: 'Sahne', emoji: '🎭', unlockLevel: 60,
    x: 220, y: 800,
    steps: [
      { desc: 'Platform inşası',           cost: 3000,  reward: { balls: 20 } },
      { desc: 'Perde ve sahne ekipmanı',   cost: 7000,  reward: { balls: 30 } },
      { desc: 'Işık ve mikrofon',          cost: 14000, reward: { gems: 6 } },
      { desc: 'İlk gösteri hazır!',        cost: 28000, reward: { balls: 100, gems: 18 } },
    ],
  },
  {
    id: 'atolye', label: 'Atölye', emoji: '⚙️', unlockLevel: 100,
    x: 560, y: 800,
    steps: [
      { desc: 'Tezgah ve aletler',         cost: 5000,  reward: { balls: 20 } },
      { desc: 'Ağır ekipman',             cost: 12000, reward: { balls: 30 } },
      { desc: 'Güvenlik sistemi',          cost: 24000, reward: { gems: 8 } },
      { desc: 'Atölye tam kapasite!',      cost: 48000, reward: { balls: 100, gems: 25 } },
    ],
  },
];

// Dekorasyon noktaları (dünya koordinatları)
const DECO = [
  { e: '🌳', x: 80,  y: 180 }, { e: '🌸', x: 310, y: 160 }, { e: '🌳', x: 510, y: 200 },
  { e: '🌿', x: 680, y: 160 }, { e: '🌳', x: 60,  y: 400 }, { e: '🌸', x: 280, y: 420 },
  { e: '🌳', x: 480, y: 400 }, { e: '🌿', x: 720, y: 380 }, { e: '🌳', x: 90,  y: 660 },
  { e: '🌸', x: 340, y: 680 }, { e: '🌳', x: 680, y: 660 }, { e: '🌿', x: 120, y: 940 },
  { e: '🌳', x: 400, y: 960 }, { e: '🌸', x: 650, y: 920 }, { e: '🌳', x: 740, y: 1050 },
  { e: '🌿', x: 50,  y: 1100 },{ e: '🌸', x: 300, y: 1150 },{ e: '🌳', x: 580, y: 1120 },
];

const WORLD_W    = 780;
const WORLD_H    = 1400;
const BUILD_V2_KEY = 'cupbounce_build_v2';

// ─── BuildScene ───────────────────────────────────────────────────────────────
export class BuildScene extends Phaser.Scene {
  constructor() { super({ key: 'BuildScene' }); }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  create() {
    const W = this.scale.width;   // 390
    const H = this.scale.height;  // 844
    this._W    = W;
    this._H    = H;
    this._busy = false;
    this._popup = null;

    this._state = this._loadState();

    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_W, WORLD_H);
    // Başlangıç scroll — dünyanın üstünü göster, header'ın altından başla
    cam.scrollX = 195; // haritanın üst ortası
    cam.scrollY = 0;

    this._drawWorld();
    this._drawBuildings();
    this._buildHUD();
    this._enableDragScroll();
  }

  // ── State ────────────────────────────────────────────────────────────────────

  _loadState() {
    try { return JSON.parse(localStorage.getItem(BUILD_V2_KEY) || '{}'); }
    catch { return {}; }
  }

  _saveState() {
    localStorage.setItem(BUILD_V2_KEY, JSON.stringify(this._state));
  }

  _getStep(id) { return Math.min(this._state[id] || 0, 4); }

  _getCoins() {
    const em = window.economyManager;
    if (em) return em.getCoins();
    return parseInt(localStorage.getItem('cupbounce_coins') || '0', 10);
  }

  _getLevel() {
    return parseInt(localStorage.getItem('cupbounce_level') || '1', 10);
  }

  _spendCoins(n) {
    const em = window.economyManager;
    if (em) return em.spendCoins(n);
    const cur = parseInt(localStorage.getItem('cupbounce_coins') || '0', 10);
    if (cur < n) return false;
    localStorage.setItem('cupbounce_coins', String(cur - n));
    return true;
  }

  _giveReward(reward) {
    const em = window.economyManager;
    if (reward.balls) {
      if (em) em.setBalls(Math.min(em.getBalls() + reward.balls, em.getMaxBalls ? em.getMaxBalls() : 100));
      else {
        const b = parseInt(localStorage.getItem('cupbounce_balls') || '0', 10);
        localStorage.setItem('cupbounce_balls', String(b + reward.balls));
      }
    }
    if (reward.gems) {
      if (em) em.addGems(reward.gems);
      else {
        const g = parseInt(localStorage.getItem('cupbounce_gems') || '0', 10);
        localStorage.setItem('cupbounce_gems', String(g + reward.gems));
      }
    }
  }

  // ── Dünya arka plan ───────────────────────────────────────────────────────────

  _drawWorld() {
    // Yeşil zemin
    this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x5a8f3c).setDepth(0);

    // Taş yollar — binalar arası döndürülmüş dikdörtgenler
    const roadDefs = [
      [390, 280, 160, 520],
      [390, 280, 620, 520],
      [160, 520, 220, 800],
      [620, 520, 560, 800],
    ];
    roadDefs.forEach(([x1, y1, x2, y2]) => {
      const rcx   = (x1 + x2) / 2;
      const rcy   = (y1 + y2) / 2;
      const len   = Math.hypot(x2 - x1, y2 - y1);
      const angle = Math.atan2(y2 - y1, x2 - x1);
      this.add.rectangle(rcx, rcy, len, 18, 0x8B7355).setRotation(angle).setDepth(1);
      this.add.rectangle(rcx, rcy, len - 4, 8, 0xA0896B).setRotation(angle).setDepth(2);
    });

    // Dekorasyonlar
    for (const d of DECO) {
      this.add.text(d.x, d.y, d.e, {
        fontSize: '32px', fontFamily: 'Arial',
      }).setOrigin(0.5).setDepth(3);
    }
  }

  // ── Binalar ───────────────────────────────────────────────────────────────────

  _drawBuildings() {
    if (this._buildingObjs) {
      this._buildingObjs.forEach(o => { try { o.destroy(); } catch {} });
    }
    this._buildingObjs = [];

    const currentLevel = this._getLevel();

    for (const b of BUILDINGS) {
      this._drawBuilding(b, currentLevel);
    }
  }

  _drawBuilding(b, currentLevel) {
    const step   = this._getStep(b.id);
    const done   = step >= 4;
    const locked = currentLevel < b.unlockLevel && step === 0;
    const R      = 80; // yarıçap
    const objs   = [];
    const reg    = o => { objs.push(o); this._buildingObjs.push(o); return o; };

    if (done) {
      // Tamamlandı: gerçek bina görseli
      const texKey = `build_${b.id}_3`;
      // Şeffaf PNG arka planını kesin engellemek için dolu dikdörtgen + daire
      reg(this.add.rectangle(b.x, b.y, 132, 132, 0x5a8f3c).setDepth(4));
      reg(this.add.circle(b.x, b.y, 85, 0x6aaf4c).setDepth(4));
      // Yeşil halka
      reg(this.add.circle(b.x, b.y, R + 6, 0x00ff88, 0).setDepth(4)
        .setStrokeStyle(3, 0x44ffaa, 0.85));
      const { bg: dBg, img: dImg } = this._drawBuildingImage(b.x, b.y, texKey, 120, 5);
      reg(dBg);
      if (dImg) {
        reg(dImg);
      } else {
        reg(this.add.circle(b.x, b.y, R, 0x336633, 0.95).setDepth(5)
          .setStrokeStyle(3, 0x44ff88, 0.9));
        reg(this.add.text(b.x, b.y - 4, b.emoji, {
          fontSize: '48px', fontFamily: 'Arial',
        }).setOrigin(0.5).setDepth(6));
      }
      // ✅ rozet
      reg(this.add.text(b.x + R - 2, b.y - R + 2, '✅', {
        fontSize: '18px', fontFamily: 'Arial',
      }).setOrigin(0.5).setDepth(7));

    } else if (locked) {
      // Kilitli
      reg(this.add.circle(b.x, b.y, R, 0x111122, 0.5).setDepth(5)
        .setStrokeStyle(2, 0x222244, 0.7));
      reg(this.add.text(b.x, b.y - 6, '🔒', {
        fontSize: '30px', fontFamily: 'Arial',
      }).setOrigin(0.5).setDepth(6).setAlpha(0.55));
      reg(this.add.text(b.x, b.y + R + 16, b.label, {
        fontSize: '12px', fontFamily: 'Arial', color: '#445566',
        stroke: '#001100', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(6));
      reg(this.add.text(b.x, b.y + R + 32, `Lv.${b.unlockLevel} gerekli`, {
        fontSize: '10px', fontFamily: 'Arial', color: '#334455',
      }).setOrigin(0.5).setDepth(6));

    } else {
      // İnşaat bekliyor
      // Zemin dairesi (her zaman çiz — şeffaflık gözükmesin)
      reg(this.add.circle(b.x, b.y, 85, 0x6aaf4c).setDepth(4));
      reg(this.add.circle(b.x, b.y, R, 0x2a3a2a, 0.5).setDepth(5)
        .setStrokeStyle(2, 0x3355aa, 0.7));
      // Adım görseli (varsa, yarı şeffaf)
      if (step > 0) {
        const texKey = `build_${b.id}_${Math.min(step - 1, 3)}`;
        const { bg: sBg, img: sImg } = this._drawBuildingImage(b.x, b.y, texKey, 120, 5, 0.65);
        reg(sBg);
        if (sImg) reg(sImg);
      }

      // Pulse overlay
      const pulse = reg(this.add.circle(b.x, b.y, R + 2, 0xffffff, 0.12).setDepth(6));
      this.tweens.add({
        targets: pulse, alpha: 0.04,
        duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });

      // 🏗️ ikon
      const crane = reg(this.add.text(b.x, b.y - 4, '🏗️', {
        fontSize: '40px', fontFamily: 'Arial',
      }).setOrigin(0.5).setDepth(7));
      this.tweens.add({
        targets: crane, y: b.y - 9,
        duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });

      // Adım noktaları
      for (let s = 0; s < 4; s++) {
        const dotX = b.x - 18 + s * 12;
        const dotY = b.y - R - 8;
        reg(this.add.circle(dotX, dotY, 4, s < step ? 0x44cc88 : 0x2a3344, 1)
          .setDepth(7).setStrokeStyle(1, 0x334455));
      }

      // Alan adı
      reg(this.add.text(b.x, b.y + R + 16, b.label, {
        fontSize: '12px', fontFamily: 'Arial', fontStyle: 'bold',
        color: '#aabbdd', stroke: '#001122', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(6));
    }

    // Tıklama alanı
    const hit = this.add.circle(b.x, b.y, R + 12, 0xffffff, 0)
      .setDepth(8).setInteractive({ useHandCursor: !locked });
    this._buildingObjs.push(hit);

    if (!locked) {
      hit.on('pointerup', () => {
        if (this._busy || this._popup || this._wasDragging) return;
        this._openPopup(b);
      });
    }
  }

  // ── HUD (kameradan bağımsız) ──────────────────────────────────────────────────

  _buildHUD() {
    const W = this._W;
    const H = this._H;

    // Header bg
    const headerBg = this.add.rectangle(W / 2, 36, W, 72, 0x07111a, 0.96)
      .setDepth(20).setScrollFactor(0);
    this.add.graphics().setDepth(20).setScrollFactor(0)
      .lineStyle(1, 0x224433, 0.9)
      .beginPath().moveTo(0, 72).lineTo(W, 72).strokePath();

    this.add.text(W / 2, 22, '🏙️ ŞEHRİM', {
      fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#cce8ff', stroke: '#001122', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);

    this._coinLabel = this.add.text(W - 12, 52, '', {
      fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffdd66', stroke: '#332200', strokeThickness: 2,
    }).setOrigin(1, 0.5).setDepth(21).setScrollFactor(0);
    this._refreshCoinLabel();

    const back = this.add.text(14, 22, '← Geri', {
      fontSize: '14px', fontFamily: 'Arial',
      color: '#7aadff', stroke: '#000033', strokeThickness: 2,
    }).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setStyle({ color: '#aaccff' }));
    back.on('pointerout',  () => back.setStyle({ color: '#7aadff' }));
    back.on('pointerup',   () => this._goBack());

    // Kaydırma ipucu
    const hint = this.add.text(W / 2, H - 22, '↕ Kaydırarak keşfet', {
      fontSize: '11px', fontFamily: 'Arial', color: '#556644',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);
    this.tweens.add({
      targets: hint, alpha: 0.2,
      duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  _refreshCoinLabel() {
    if (this._coinLabel) {
      this._coinLabel.setText('💰 ' + this._getCoins().toLocaleString('tr-TR'));
    }
  }

  // ── Drag-to-scroll ────────────────────────────────────────────────────────────

  _enableDragScroll() {
    const cam    = this.cameras.main;
    const HEADER = 72;
    const FOOTER = 40;
    const H      = this._H;
    const TAP_THRESHOLD = 10;

    let drag = null;
    this._wasDragging = false;

    this.input.on('pointerdown', (p) => {
      if (p.y < HEADER || p.y > H - FOOTER) return;
      drag = { sx: p.x, sy: p.y, cx: cam.scrollX, cy: cam.scrollY };
      this._wasDragging = false;
    });

    this.input.on('pointermove', (p) => {
      if (!drag || !p.isDown) return;
      const dx = p.x - drag.sx;
      const dy = p.y - drag.sy;
      if (!this._wasDragging && Math.sqrt(dx * dx + dy * dy) < TAP_THRESHOLD) return;
      this._wasDragging = true;
      cam.scrollX = Phaser.Math.Clamp(drag.cx - dx, 0, WORLD_W - this._W);
      cam.scrollY = Phaser.Math.Clamp(drag.cy - dy, 0, WORLD_H - this._H);
    });

    this.input.on('pointerup', () => {
      drag = null;
      // _wasDragging bir sonraki frame'de sıfırlanır (pointerup sonrası hit.on('pointerup') tetiklenir)
      this.time.delayedCall(16, () => { this._wasDragging = false; });
    });
  }

  // ── Popup (slide-up, ekrana sabit) ───────────────────────────────────────────

  _openPopup(b) {
    const W    = this._W;
    const H    = this._H;
    const cx   = W / 2;
    const step = this._getStep(b.id);
    const done = step >= 4;

    const objs  = [];
    const reg   = o => { objs.push(o); return o; };
    const close = () => {
      objs.forEach(o => { try { o.destroy(); } catch {} });
      this._popup = null;
    };
    this._popup = { close };

    // Karartma overlay
    const overlay = reg(this.add.rectangle(cx, H / 2, W, H, 0x000000, 0.7)
      .setDepth(30).setScrollFactor(0).setInteractive());
    overlay.on('pointerup', close);

    // Panel yüksekliği
    const panelH = done ? 340 : 440;
    const panelY = H - panelH / 2;

    // Slide-up animasyon için panel container
    const panelBg = reg(this.add.rectangle(cx, H + panelH / 2, W, panelH, 0x0c1a2e, 1)
      .setDepth(31).setScrollFactor(0).setStrokeStyle(2, 0x3366aa, 0.9));
    this.tweens.add({ targets: panelBg, y: panelY, duration: 280, ease: 'Back.easeOut' });

    // Panel içerik — hepsi sabit Y hesabıyla, slide animasyonu yok (panelBg ile birlikte gelmiyor)
    // Bunun yerine tüm elemanlar panelY referansıyla, alpha:0 → 1 ile fade-in
    const fadeIn = (o, delay = 0) => {
      o.setAlpha(0);
      this.tweens.add({ targets: o, alpha: 1, duration: 200, delay: delay + 60 });
      return o;
    };

    // Üst çizgi tutacak
    const topY = H - panelH;

    // Başlık
    const title = reg(fadeIn(this.add.text(cx, topY + 28, `${b.emoji}  ${b.label}`, {
      fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ddeeff', stroke: '#000d1a', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(32).setScrollFactor(0)));

    // × kapat
    const xBtn = reg(fadeIn(this.add.text(W - 18, topY + 28, '✕', {
      fontSize: '20px', fontFamily: 'Arial', color: '#556688',
    }).setOrigin(0.5).setDepth(32).setScrollFactor(0).setInteractive({ useHandCursor: true })));
    xBtn.on('pointerover', () => xBtn.setStyle({ color: '#aabbdd' }));
    xBtn.on('pointerout',  () => xBtn.setStyle({ color: '#556688' }));
    xBtn.on('pointerup',   close);

    // Ayırıcı
    reg(fadeIn(this.add.graphics().setDepth(32).setScrollFactor(0)
      .lineStyle(1, 0x334466, 0.8)
      .beginPath().moveTo(cx - 150, topY + 52).lineTo(cx + 150, topY + 52).strokePath()));

    if (done) {
      // Tamamlandı görünümü
      const texKey = `build_${b.id}_3`;
      {
        const { bg: pBg, img: pImg } = this._drawBuildingImage(cx, topY + 160, texKey, 140, 32, 1, true);
        reg(fadeIn(pBg, 40));
        if (pImg) { reg(fadeIn(pImg, 40)); } else {
          reg(fadeIn(this.add.text(cx, topY + 160, b.emoji, {
            fontSize: '72px', fontFamily: 'Arial',
          }).setOrigin(0.5).setDepth(32).setScrollFactor(0), 40));
        }
      }
      reg(fadeIn(this.add.text(cx, topY + 250, '✅ Tamamlandı!', {
        fontSize: '18px', fontFamily: 'Arial', fontStyle: 'bold', color: '#44ffaa',
      }).setOrigin(0.5).setDepth(32).setScrollFactor(0), 80));
      reg(fadeIn(this.add.text(cx, topY + 280, 'Bu alan tam olarak inşa edildi.', {
        fontSize: '12px', fontFamily: 'Arial', color: '#667788',
      }).setOrigin(0.5).setDepth(32).setScrollFactor(0), 100));

    } else {
      // İnşaat görünümü
      const nextStep = b.steps[step];
      const coins    = this._getCoins();
      const afford   = coins >= nextStep.cost;

      // Bina görseli
      const imgStep = Math.max(step - 1, 0);
      const texKey  = `build_${b.id}_${imgStep}`;
      {
        const { bg: iBg, img: iImg } = this._drawBuildingImage(cx, topY + 140, texKey, 130, 32, 1, true);
        reg(fadeIn(iBg, 40));
        if (iImg) { reg(fadeIn(iImg, 40)); } else {
          reg(fadeIn(this.add.text(cx, topY + 140, b.emoji, {
            fontSize: '60px', fontFamily: 'Arial',
          }).setOrigin(0.5).setDepth(32).setScrollFactor(0), 40));
        }
      }

      // Progress dots
      for (let s = 0; s < 4; s++) {
        const dotX = cx - 18 + s * 14;
        const dotY = topY + 224;
        reg(fadeIn(this.add.circle(dotX, dotY, 5, s < step ? 0x44cc88 : 0x1e2e3e, 1)
          .setDepth(32).setScrollFactor(0).setStrokeStyle(1, 0x334455), 60));
      }
      reg(fadeIn(this.add.text(cx + 36, topY + 224, `${step}/4`, {
        fontSize: '11px', fontFamily: 'Arial', color: '#556677',
      }).setOrigin(0, 0.5).setDepth(32).setScrollFactor(0), 60));

      // Adım açıklaması
      reg(fadeIn(this.add.text(cx, topY + 252, nextStep.desc, {
        fontSize: '13px', fontFamily: 'Arial', color: '#aabbcc',
        wordWrap: { width: 300 },
      }).setOrigin(0.5).setDepth(32).setScrollFactor(0), 70));

      // Ödül
      const rewardParts = [];
      if (nextStep.reward.balls) rewardParts.push(`+${nextStep.reward.balls} ⚾`);
      if (nextStep.reward.gems)  rewardParts.push(`+${nextStep.reward.gems} 💎`);
      reg(fadeIn(this.add.text(cx, topY + 278, `Ödül: ${rewardParts.join('  ')}`, {
        fontSize: '12px', fontFamily: 'Arial', color: '#66ddaa',
      }).setOrigin(0.5).setDepth(32).setScrollFactor(0), 80));

      // Maliyet
      reg(fadeIn(this.add.text(cx, topY + 302, `💰 ${nextStep.cost.toLocaleString('tr-TR')} coin`, {
        fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold',
        color: afford ? '#ffdd66' : '#664433',
      }).setOrigin(0.5).setDepth(32).setScrollFactor(0), 90));

      // İNŞA ET butonu
      const btnY  = topY + 360;
      const bFill = afford ? 0x0d3a12 : 0x151520;
      const bBord = afford ? 0x44cc55 : 0x2a2a44;
      const bTxt  = afford
        ? `🔨 İNŞA ET — ${nextStep.cost.toLocaleString('tr-TR')} coin`
        : '⛔ Yetersiz coin';
      const bCol  = afford ? '#44ff88' : '#445566';

      const btnBg = reg(fadeIn(this.add.rectangle(cx, btnY, 290, 50, bFill)
        .setDepth(32).setScrollFactor(0).setStrokeStyle(2, bBord), 110));
      const btnTxt = reg(fadeIn(this.add.text(cx, btnY, bTxt, {
        fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold', color: bCol,
      }).setOrigin(0.5).setDepth(33).setScrollFactor(0), 110));

      if (afford) {
        btnBg.setInteractive({ useHandCursor: true });
        btnTxt.setInteractive({ useHandCursor: true });

        const doBuild = () => {
          if (this._busy) return;
          this._startBuild(close, b, step, objs, reg, fadeIn, topY, panelH);
        };

        btnBg.on('pointerover',  () => btnBg.setFillStyle(0x16501a));
        btnBg.on('pointerout',   () => btnBg.setFillStyle(bFill));
        btnBg.on('pointerup',    doBuild);
        btnTxt.on('pointerup',   doBuild);
      }
    }
  }

  // ── İnşaat animasyonu (popup içinde) ─────────────────────────────────────────

  _startBuild(closePopup, b, stepIdx, existingObjs, reg, fadeIn, topY, panelH) {
    const step = b.steps[stepIdx];
    if (!this._spendCoins(step.cost)) return;
    this._busy = true;
    this._refreshCoinLabel();

    // Popup içindeki eski elemanları temizle (overlay + panelBg hariç ilk 2 nesne tutulur)
    existingObjs.slice(2).forEach(o => { try { o.destroy(); } catch {} });

    const W  = this._W;
    const H  = this._H;
    const cx = W / 2;

    // İnşaat başlık
    reg(this.add.text(cx, topY + 80, '🔨 İnşa ediliyor...', {
      fontSize: '17px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffcc44', stroke: '#330000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(33).setScrollFactor(0));

    // Hammer animasyon
    const hammerTxt = reg(this.add.text(cx, topY + 160, '🔨', {
      fontSize: '52px', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(33).setScrollFactor(0));
    this.tweens.add({
      targets: hammerTxt, angle: 35,
      duration: 150, yoyo: true, repeat: -1,
    });

    // Progress bar
    const barW  = 200;
    const barY  = topY + 230;
    reg(this.add.rectangle(cx, barY, barW, 14, 0x111133)
      .setDepth(33).setScrollFactor(0).setStrokeStyle(1, 0x3344aa));
    const fill = reg(this.add.rectangle(cx - barW / 2, barY, 2, 14, 0x44cc44)
      .setDepth(34).setScrollFactor(0).setOrigin(0, 0.5));

    this.tweens.add({
      targets: fill, duration: 2000, ease: 'Linear',
      onUpdate: t => { fill.width = Math.max(2, barW * t.progress); },
      onComplete: () => {
        // Tüm popup kapat
        existingObjs.forEach(o => { try { o.destroy(); } catch {} });
        this._popup = null;

        // State güncelle
        this._state[b.id] = stepIdx + 1;
        this._saveState();
        this._giveReward(step.reward);

        const isUnlock = stepIdx === 3;
        if (isUnlock) this._grantAreaUnlockReward(b);

        this._refreshCoinLabel();
        this._busy = false;
        this._drawBuildings();
        this._spawnConfetti();
        this._showRewardPopup(b, step.reward, isUnlock);
      },
    });
  }

  // ── Alan açılma ödülü ─────────────────────────────────────────────────────────

  _grantAreaUnlockReward(b) {
    this._giveReward({ balls: 100 });
    localStorage.setItem('cupbounce_double_ball_quota',  '100');
    localStorage.setItem('cupbounce_double_ball_active', 'true');
    const gs = this.scene.get('GameScene');
    if (gs && gs._checkDoubleBallMode) gs._checkDoubleBallMode();
  }

  // ── Ödül popup'u ─────────────────────────────────────────────────────────────

  _showRewardPopup(b, reward, isUnlock = false) {
    const W   = this._W;
    const H   = this._H;
    const cx  = W / 2;
    const cy  = H / 2;
    const popH = isUnlock ? 300 : 220;
    const objs = [];
    const reg  = o => { objs.push(o); return o; };
    const close = () => objs.forEach(o => { try { o.destroy(); } catch {} });

    reg(this.add.rectangle(cx, cy, 320, popH, 0x07071e, 0.97)
      .setDepth(50).setScrollFactor(0).setStrokeStyle(2, isUnlock ? 0xff8c00 : 0x44cc44));

    reg(this.add.text(cx, cy - popH / 2 + 30, isUnlock ? `🏗️ ${b.label} TAMAMLANDI!` : `${b.emoji}  ${b.label}`, {
      fontSize: '17px', fontFamily: 'Arial', fontStyle: 'bold',
      color: isUnlock ? '#ffaa44' : '#88ffaa',
    }).setOrigin(0.5).setDepth(51).setScrollFactor(0));

    reg(this.add.text(cx, cy - popH / 2 + 54,
      isUnlock ? 'Tüm adımlar tamamlandı!' : 'İnşa tamamlandı!', {
        fontSize: '13px', fontFamily: 'Arial', color: '#aabbdd',
      }).setOrigin(0.5).setDepth(51).setScrollFactor(0));

    reg(this.add.graphics().setDepth(51).setScrollFactor(0)
      .lineStyle(1, 0x334466, 0.8)
      .beginPath().moveTo(cx - 120, cy - popH / 2 + 68)
      .lineTo(cx + 120, cy - popH / 2 + 68).strokePath());

    let rowY = cy - popH / 2 + 94;
    const iS = { fontSize: '18px', fontFamily: 'Arial' };
    const vS = { fontSize: '22px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffee88' };
    const lS = { fontSize: '12px', fontFamily: 'Arial', color: '#aabbcc' };

    if (reward.balls) {
      reg(this.add.text(cx - 60, rowY, '⚾', iS).setOrigin(0.5).setDepth(51).setScrollFactor(0));
      reg(this.add.text(cx - 20, rowY, `+${reward.balls}`, vS).setOrigin(0, 0.5).setDepth(51).setScrollFactor(0));
      reg(this.add.text(cx + 50, rowY, 'Top', lS).setOrigin(0, 0.5).setDepth(51).setScrollFactor(0));
      rowY += 34;
    }
    if (reward.gems) {
      reg(this.add.text(cx - 60, rowY, '💎', iS).setOrigin(0.5).setDepth(51).setScrollFactor(0));
      reg(this.add.text(cx - 20, rowY, `+${reward.gems}`, vS).setOrigin(0, 0.5).setDepth(51).setScrollFactor(0));
      reg(this.add.text(cx + 50, rowY, 'Gem', lS).setOrigin(0, 0.5).setDepth(51).setScrollFactor(0));
      rowY += 34;
    }

    if (isUnlock) {
      reg(this.add.text(cx - 60, rowY, '⚾', iS).setOrigin(0.5).setDepth(51).setScrollFactor(0));
      reg(this.add.text(cx - 20, rowY, '+100', vS).setOrigin(0, 0.5).setDepth(51).setScrollFactor(0));
      reg(this.add.text(cx + 50, rowY, 'Bonus Top', lS).setOrigin(0, 0.5).setDepth(51).setScrollFactor(0));
      rowY += 38;
      reg(this.add.rectangle(cx, rowY + 14, 250, 32, 0xff6f00)
        .setDepth(51).setScrollFactor(0).setStrokeStyle(2, 0xffcc44));
      reg(this.add.text(cx, rowY + 14, '⚾×2  Çift Top Modu — 100 atış', {
        fontSize: '12px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5).setDepth(52).setScrollFactor(0));
    }

    const btn = reg(this.add.text(cx, cy + popH / 2 - 22, '  Harika!  ', {
      fontSize: '17px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#44ff88', backgroundColor: '#0a2a0a',
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setDepth(52).setScrollFactor(0).setInteractive({ useHandCursor: true }));
    btn.on('pointerup', close);
    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#163516' }));
    btn.on('pointerout',  () => btn.setStyle({ backgroundColor: '#0a2a0a' }));
    this.time.delayedCall(isUnlock ? 6000 : 3500, () => { try { close(); } catch {} });
  }

  // ── Confetti ─────────────────────────────────────────────────────────────────

  _spawnConfetti() {
    const W = this._W;
    const H = this._H;
    const colors = [0xff1744, 0x00e676, 0xffd700, 0x2979ff, 0xcc44ff, 0xff6d00, 0x00bcd4];
    for (let i = 0; i < 55; i++) {
      const col = colors[Phaser.Math.Between(0, colors.length - 1)];
      const px  = Phaser.Math.Between(20, W - 20);
      const sz  = Phaser.Math.Between(5, 12);
      const p   = this.add.rectangle(px, -10, sz, sz * (Phaser.Math.Between(0, 1) ? 1.8 : 1), col)
        .setDepth(45).setScrollFactor(0);
      this.tweens.add({
        targets: p, y: H + 20,
        x:       px + Phaser.Math.Between(-80, 80),
        angle:   Phaser.Math.Between(-300, 300),
        duration: Phaser.Math.Between(1000, 2600),
        delay:    Phaser.Math.Between(0, 400),
        ease:    'Linear',
        onComplete: () => p.destroy(),
      });
    }
  }

  // ── Görsel yardımcısı ────────────────────────────────────────────────────────

  /**
   * Yeşil arka plan kutusu üzerine ölçeklenmiş bina görseli çizer.
   * Tüm nesneler döndürülen dizi içinde — reg() ile kayıt edilebilir.
   * @param {number} x
   * @param {number} y
   * @param {string} texKey
   * @param {number} size    — görsel boyutu (px)
   * @param {number} depth
   * @param {number} alpha
   * @param {boolean} scrollFixed — setScrollFactor(0) uygulansın mı
   * @returns {{ bg, img }} — bg her zaman var, img texture yoksa null
   */
  _drawBuildingImage(x, y, texKey, size, depth = 5, alpha = 1, scrollFixed = false) {
    const bgSize = size + 10;
    const bg = this.add.rectangle(x, y, bgSize, bgSize, 0x5a8f3c).setDepth(depth - 1);
    if (scrollFixed) bg.setScrollFactor(0);

    let img = null;
    if (this.textures.exists(texKey)) {
      img = this.add.image(x, y, texKey).setDepth(depth).setAlpha(alpha);
      if (scrollFixed) img.setScrollFactor(0);
      const scale = size / Math.max(img.width, img.height);
      img.setScale(scale);
    }
    return { bg, img };
  }

  // ── Navigasyon ───────────────────────────────────────────────────────────────

  _goBack() {
    this.scene.start('GameScene');
  }
}
