// ─── Alan tanımları ────────────────────────────────────────────────────────────
const AREAS = [
  {
    id: 'kafe', name: 'Kafe', icon: '☕', color: 0xc8792e, unlockLevel: 1,
    steps: [
      { desc: 'Tezgah ve sandalyeler',     cost: 500,   reward: { balls: 20 } },
      { desc: 'Espresso makinesi',          cost: 1200,  reward: { balls: 30 } },
      { desc: 'Dekorasyon ve aydınlatma',  cost: 2500,  reward: { gems: 2 } },
      { desc: 'Dış cephe tamamlandı',      cost: 5000,  reward: { balls: 100, gems: 5 } },
    ],
  },
  {
    id: 'bahce', name: 'Bahçe', icon: '🌿', color: 0x4caf50, unlockLevel: 10,
    steps: [
      { desc: 'Toprak düzenleme',          cost: 800,   reward: { balls: 20 } },
      { desc: 'Çiçek ve bitkiler',          cost: 2000,  reward: { balls: 30 } },
      { desc: 'Yürüyüş yolu',              cost: 4000,  reward: { gems: 3 } },
      { desc: 'Çeşme ve banklar',           cost: 8000,  reward: { balls: 100, gems: 8 } },
    ],
  },
  {
    id: 'salon', name: 'Oyun Salonu', icon: '🕹️', color: 0x2196f3, unlockLevel: 30,
    steps: [
      { desc: 'Zemin ve duvarlar',          cost: 1500,  reward: { balls: 20 } },
      { desc: 'Oyun makineleri',            cost: 3500,  reward: { balls: 30 } },
      { desc: 'Işık ve ses sistemi',        cost: 7000,  reward: { gems: 4 } },
      { desc: 'Büyük açılış hazır!',        cost: 14000, reward: { balls: 100, gems: 12 } },
    ],
  },
  {
    id: 'sahne', name: 'Sahne', icon: '🎭', color: 0x9c27b0, unlockLevel: 60,
    steps: [
      { desc: 'Platform inşası',            cost: 3000,  reward: { balls: 20 } },
      { desc: 'Perde ve sahne ekipmanı',    cost: 7000,  reward: { balls: 30 } },
      { desc: 'Işık ve mikrofon',           cost: 14000, reward: { gems: 6 } },
      { desc: 'İlk gösteri hazır!',         cost: 28000, reward: { balls: 100, gems: 18 } },
    ],
  },
  {
    id: 'atolye', name: 'Atölye', icon: '🔧', color: 0xff5722, unlockLevel: 100,
    steps: [
      { desc: 'Tezgah ve aletler',          cost: 5000,  reward: { balls: 20 } },
      { desc: 'Ağır ekipman',              cost: 12000, reward: { balls: 30 } },
      { desc: 'Güvenlik sistemi',           cost: 24000, reward: { gems: 8 } },
      { desc: 'Atölye tam kapasite!',       cost: 48000, reward: { balls: 100, gems: 25 } },
    ],
  },
];

// Harita üzerindeki sabit slotlar
const SLOTS = [
  { id: 'kafe',   x: 195, y: 180, label: 'Kafe'        },
  { id: 'bahce',  x:  90, y: 320, label: 'Bahçe'       },
  { id: 'salon',  x: 300, y: 320, label: 'Oyun Salonu' },
  { id: 'sahne',  x: 120, y: 460, label: 'Sahne'       },
  { id: 'atolye', x: 270, y: 460, label: 'Atölye'      },
];

const BUILD_V2_KEY = 'cupbounce_build_v2';

// ─── BuildScene ───────────────────────────────────────────────────────────────
export class BuildScene extends Phaser.Scene {
  constructor() { super({ key: 'BuildScene' }); }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this._W    = W;
    this._H    = H;
    this._busy = false;
    this._popup = null;

    this._state = this._loadState();

    this._drawBackground();
    this._drawMapPaths();
    this._drawSlots();
    this._buildHeader();
  }

  // ── State ────────────────────────────────────────────────────────────────────

  _loadState() {
    try { return JSON.parse(localStorage.getItem(BUILD_V2_KEY) || '{}'); }
    catch { return {}; }
  }

  _saveState() {
    localStorage.setItem(BUILD_V2_KEY, JSON.stringify(this._state));
  }

  _getStep(areaId) { return Math.min(this._state[areaId] || 0, 4); }

  _getCoins() {
    const em = window.economyManager;
    if (em) return em.getCoins();
    return parseInt(localStorage.getItem('cupbounce_coins') || '0', 10);
  }

  _getLevel() {
    return parseInt(localStorage.getItem('cupbounce_level') || '1', 10);
  }

  _spendCoins(amount) {
    const em = window.economyManager;
    if (em) return em.spendCoins(amount);
    const cur = parseInt(localStorage.getItem('cupbounce_coins') || '0', 10);
    if (cur < amount) return false;
    localStorage.setItem('cupbounce_coins', String(cur - amount));
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

  // ── Arka plan ─────────────────────────────────────────────────────────────────

  _drawBackground() {
    const W = this._W;
    const H = this._H;

    // Zemin — koyu yeşil
    this.add.rectangle(W / 2, H / 2, W, H, 0x1a2e1a).setDepth(0);

    // Izgara doku (ince çizgiler)
    const grid = this.add.graphics().setDepth(1).setAlpha(0.12);
    grid.lineStyle(1, 0x44aa44);
    const STEP = 40;
    for (let x = 0; x <= W; x += STEP) {
      grid.beginPath().moveTo(x, 80).lineTo(x, H - 60).strokePath();
    }
    for (let y = 80; y <= H - 60; y += STEP) {
      grid.beginPath().moveTo(0, y).lineTo(W, y).strokePath();
    }

    // Köşe dekor oval — şehir "adası" hissi
    const islandGfx = this.add.graphics().setDepth(2);
    islandGfx.fillStyle(0x22401a, 0.55);
    islandGfx.fillEllipse(W / 2, 330, 360, 460);
    islandGfx.lineStyle(2, 0x336633, 0.4);
    islandGfx.strokeEllipse(W / 2, 330, 360, 460);
  }

  // ── Yollar ───────────────────────────────────────────────────────────────────

  _drawMapPaths() {
    const path = this.add.graphics().setDepth(3);
    path.lineStyle(8, 0x3a3020, 0.7);

    // Merkez (kafe) → bahçe
    this._drawPath(path, 195, 180, 90, 320);
    // Merkez (kafe) → salon
    this._drawPath(path, 195, 180, 300, 320);
    // Bahçe → sahne
    this._drawPath(path, 90, 320, 120, 460);
    // Salon → atölye
    this._drawPath(path, 300, 320, 270, 460);
    // Sahne → atölye (alt bağlantı)
    this._drawPath(path, 120, 460, 270, 460);

    // Yol kenarı (açık renk)
    const pathLight = this.add.graphics().setDepth(3);
    pathLight.lineStyle(3, 0x8a7040, 0.35);
    this._drawPath(pathLight, 195, 180, 90, 320);
    this._drawPath(pathLight, 195, 180, 300, 320);
    this._drawPath(pathLight, 90, 320, 120, 460);
    this._drawPath(pathLight, 300, 320, 270, 460);
    this._drawPath(pathLight, 120, 460, 270, 460);
  }

  _drawPath(gfx, x1, y1, x2, y2) {
    gfx.beginPath().moveTo(x1, y1).lineTo(x2, y2).strokePath();
  }

  // ── Slot çizimi ───────────────────────────────────────────────────────────────

  _drawSlots() {
    // Tüm eski slot objelerini temizle (yeniden çizim için)
    if (this._slotObjs) {
      this._slotObjs.forEach(o => { try { o.destroy(); } catch {} });
    }
    this._slotObjs = [];

    const currentLevel = this._getLevel();

    for (const slot of SLOTS) {
      const area   = AREAS.find(a => a.id === slot.id);
      const step   = this._getStep(slot.id);
      const done   = step >= 4;
      const locked = currentLevel < area.unlockLevel && step === 0;

      this._drawSlot(slot, area, step, done, locked);
    }
  }

  _drawSlot(slot, area, step, done, locked) {
    const R    = 52; // slot yarıçapı
    const objs = [];
    const reg  = o => { objs.push(o); this._slotObjs.push(o); return o; };

    if (done) {
      // ── Tamamlanmış: gerçek bina görseli ─────────────────────────────────────
      const texKey = `build_${area.id}_3`;
      let   img    = null;
      try {
        img = reg(this.add.image(slot.x, slot.y, texKey)
          .setDepth(5).setDisplaySize(104, 104));
      } catch {
        img = null;
      }

      if (!img) {
        // Fallback: renkli daire + büyük ikon
        reg(this.add.circle(slot.x, slot.y, R, area.color, 0.9).setDepth(5)
          .setStrokeStyle(3, 0xffffff, 0.5));
        reg(this.add.text(slot.x, slot.y - 6, area.icon, {
          fontSize: '32px', fontFamily: 'Arial',
        }).setOrigin(0.5).setDepth(6));
      }

      // Parlak tamamlandı halkası
      reg(this.add.circle(slot.x, slot.y, R + 4, 0x00ff88, 0).setDepth(4)
        .setStrokeStyle(3, 0x44ffaa, 0.9));

      // Alan adı etiketi
      const lbl = reg(this.add.text(slot.x, slot.y + R + 14, slot.label, {
        fontSize: '12px', fontFamily: 'Arial', fontStyle: 'bold',
        color: '#88ffaa', stroke: '#001100', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(6));

      // ✅ rozet
      reg(this.add.text(slot.x + R - 4, slot.y - R + 4, '✅', {
        fontSize: '16px', fontFamily: 'Arial',
      }).setOrigin(0.5).setDepth(7));

    } else if (locked) {
      // ── Kilitli: koyu gri + kilit ─────────────────────────────────────────────
      reg(this.add.circle(slot.x, slot.y, R, 0x111122, 0.9).setDepth(5)
        .setStrokeStyle(2, 0x222244, 0.8));

      reg(this.add.text(slot.x, slot.y - 4, '🔒', {
        fontSize: '28px', fontFamily: 'Arial',
      }).setOrigin(0.5).setDepth(6).setAlpha(0.5));

      reg(this.add.text(slot.x, slot.y + R + 14, slot.label, {
        fontSize: '12px', fontFamily: 'Arial',
        color: '#445566', stroke: '#000011', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(6));

      reg(this.add.text(slot.x, slot.y + R + 29, `Lv.${AREAS.find(a => a.id === slot.id).unlockLevel}`, {
        fontSize: '10px', fontFamily: 'Arial', color: '#334455',
      }).setOrigin(0.5).setDepth(6));

    } else {
      // ── İnşaat bekliyor ───────────────────────────────────────────────────────
      // Zemin dairesi
      reg(this.add.circle(slot.x, slot.y, R, 0x2a2a3a, 0.85).setDepth(5)
        .setStrokeStyle(2, 0x3355aa, 0.8));

      // Mevcut adım görseli (varsa)
      const texKey = `build_${area.id}_${Math.max(step - 1, 0)}`;
      if (step > 0) {
        try {
          const img = reg(this.add.image(slot.x, slot.y, texKey)
            .setDepth(5).setDisplaySize(96, 96).setAlpha(0.6));
        } catch { /* görsel yok */ }
      }

      // Sis / bulut overlay
      reg(this.add.circle(slot.x, slot.y, R - 2, 0xaabbcc, 0.18).setDepth(6));
      reg(this.add.circle(slot.x - 14, slot.y - 8, 24, 0xbbccdd, 0.12).setDepth(6));
      reg(this.add.circle(slot.x + 18, slot.y + 6, 20, 0xbbccdd, 0.10).setDepth(6));

      // 🏗️ ikon
      const crane = reg(this.add.text(slot.x, slot.y - 6, '🏗️', {
        fontSize: '30px', fontFamily: 'Arial',
      }).setOrigin(0.5).setDepth(7));

      // Hafif sallanma animasyonu
      this.tweens.add({
        targets: crane, y: slot.y - 10,
        duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });

      // Adım progress nokta göstergesi (üst sağ)
      for (let s = 0; s < 4; s++) {
        const dotX = slot.x + R - 10 - (3 - s) * 11;
        const dotY = slot.y - R + 8;
        reg(this.add.circle(dotX, dotY, 4, s < step ? 0x44cc88 : 0x334455, 1)
          .setDepth(7).setStrokeStyle(1, 0x223344));
      }

      // Alan adı
      reg(this.add.text(slot.x, slot.y + R + 14, slot.label, {
        fontSize: '12px', fontFamily: 'Arial', fontStyle: 'bold',
        color: '#aabbdd', stroke: '#000011', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(6));

      // "Dokunarak inşa et" alt yazı
      const hint = reg(this.add.text(slot.x, slot.y + R + 29, 'Dokunarak inşa et', {
        fontSize: '9px', fontFamily: 'Arial', color: '#556688',
      }).setOrigin(0.5).setDepth(6));

      // Hint titreme
      this.tweens.add({
        targets: hint, alpha: 0.3,
        duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // ── Tıklama alanı ─────────────────────────────────────────────────────────
    const hit = this.add.circle(slot.x, slot.y, R + 10, 0xffffff, 0)
      .setDepth(8).setInteractive({ useHandCursor: !locked });
    this._slotObjs.push(hit);

    if (!locked) {
      hit.on('pointerover', () => {
        this.tweens.add({ targets: hit, scaleX: 1.08, scaleY: 1.08, duration: 120 });
      });
      hit.on('pointerout', () => {
        this.tweens.add({ targets: hit, scaleX: 1, scaleY: 1, duration: 120 });
      });
      hit.on('pointerup', () => {
        if (this._busy || this._popup) return;
        this._openPopup(slot, AREAS.find(a => a.id === slot.id));
      });
    }
  }

  // ── Üst bar ───────────────────────────────────────────────────────────────────

  _buildHeader() {
    const W = this._W;

    // Header arka plan
    this.add.rectangle(W / 2, 36, W, 72, 0x07111a, 0.96).setDepth(20);
    this.add.graphics().setDepth(20)
      .lineStyle(1, 0x224433, 0.9)
      .beginPath().moveTo(0, 72).lineTo(W, 72).strokePath();

    // Başlık
    this.add.text(W / 2, 22, '🏗️ ŞEHRİM', {
      fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#cce8ff', stroke: '#001122', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(21);

    // Coin etiketi (sağ)
    this._coinLabel = this.add.text(W - 12, 52, '', {
      fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffdd66', stroke: '#332200', strokeThickness: 2,
    }).setOrigin(1, 0.5).setDepth(21);
    this._refreshCoinLabel();

    // Geri butonu (sol)
    const back = this.add.text(14, 22, '← Geri', {
      fontSize: '14px', fontFamily: 'Arial', color: '#7aadff',
      stroke: '#000033', strokeThickness: 2,
    }).setOrigin(0, 0.5).setDepth(21).setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setStyle({ color: '#aaccff' }));
    back.on('pointerout',  () => back.setStyle({ color: '#7aadff' }));
    back.on('pointerup',   () => this._goBack());
  }

  _refreshCoinLabel() {
    if (this._coinLabel) {
      this._coinLabel.setText('💰 ' + this._getCoins().toLocaleString('tr-TR'));
    }
  }

  // ── Popup ─────────────────────────────────────────────────────────────────────

  _openPopup(slot, area) {
    const W    = this._W;
    const H    = this._H;
    const cx   = W / 2;
    const step = this._getStep(area.id);
    const done = step >= 4;

    const objs  = [];
    const reg   = o => { objs.push(o); return o; };
    const close = () => {
      objs.forEach(o => { try { o.destroy(); } catch {} });
      this._popup = null;
    };
    this._popup = { close };

    // Karartma overlay
    const overlay = reg(this.add.rectangle(cx, H / 2, W, H, 0x000000, 0.72).setDepth(30)
      .setInteractive());
    overlay.on('pointerup', close);

    // Panel
    const panelH = done ? 320 : 380;
    const panelY = H / 2 - 20;
    reg(this.add.rectangle(cx, panelY, 330, panelH, 0x0c1a2e, 1)
      .setDepth(31).setStrokeStyle(2, 0x3366aa, 0.95));

    // × kapat
    const xBtn = reg(this.add.text(cx + 148, panelY - panelH / 2 + 18, '✕', {
      fontSize: '18px', fontFamily: 'Arial', color: '#556688',
    }).setOrigin(0.5).setDepth(32).setInteractive({ useHandCursor: true }));
    xBtn.on('pointerover', () => xBtn.setStyle({ color: '#aabbdd' }));
    xBtn.on('pointerout',  () => xBtn.setStyle({ color: '#556688' }));
    xBtn.on('pointerup',   close);

    // Alan adı
    reg(this.add.text(cx, panelY - panelH / 2 + 32, `${area.icon}  ${area.name}`, {
      fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ddeeff', stroke: '#000d1a', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(32));

    // Ayırıcı
    reg(this.add.graphics().setDepth(32).lineStyle(1, 0x334466, 0.8)
      .beginPath().moveTo(cx - 140, panelY - panelH / 2 + 50)
      .lineTo(cx + 140, panelY - panelH / 2 + 50).strokePath());

    if (done) {
      // Tamamlandı görünümü
      const texKey = `build_${area.id}_3`;
      try {
        reg(this.add.image(cx, panelY - 30, texKey)
          .setDepth(32).setDisplaySize(160, 130));
      } catch {
        reg(this.add.text(cx, panelY - 30, area.icon, {
          fontSize: '64px', fontFamily: 'Arial',
        }).setOrigin(0.5).setDepth(32));
      }
      reg(this.add.text(cx, panelY + 80, '✅ Tam Olarak İnşa Edildi!', {
        fontSize: '15px', fontFamily: 'Arial', fontStyle: 'bold', color: '#44ffaa',
      }).setOrigin(0.5).setDepth(32));
      reg(this.add.text(cx, panelY + 108, 'Bu alan tamamlandı.', {
        fontSize: '12px', fontFamily: 'Arial', color: '#778899',
      }).setOrigin(0.5).setDepth(32));

    } else {
      // İnşa görünümü
      const nextStep  = area.steps[step];
      const coins     = this._getCoins();
      const afford    = coins >= nextStep.cost;

      // Mevcut adım görseli
      const imgStep   = Math.max(step - 1, 0);
      const texKey    = `build_${area.id}_${imgStep}`;
      try {
        reg(this.add.image(cx, panelY - 55, texKey)
          .setDepth(32).setDisplaySize(130, 110));
      } catch {
        reg(this.add.text(cx, panelY - 55, area.icon, {
          fontSize: '52px', fontFamily: 'Arial',
        }).setOrigin(0.5).setDepth(32));
      }

      // Adım bilgisi
      reg(this.add.text(cx, panelY + 14, `Adım ${step + 1} / 4`, {
        fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', color: '#6688aa',
      }).setOrigin(0.5).setDepth(32));

      reg(this.add.text(cx, panelY + 34, nextStep.desc, {
        fontSize: '14px', fontFamily: 'Arial', color: '#aabbcc',
        wordWrap: { width: 280 },
      }).setOrigin(0.5).setDepth(32));

      // Adım progress
      const barX = cx - 110;
      const barY = panelY + 62;
      const segW = 52;
      for (let s = 0; s < 4; s++) {
        const sx  = barX + s * (segW + 4);
        const col = s < step ? 0x44cc44 : (s === step ? 0x2244aa : 0x1a1a2e);
        reg(this.add.rectangle(sx + segW / 2, barY, segW, 10, col)
          .setDepth(32).setStrokeStyle(1, 0x223366));
      }

      // Ödül metni
      const rewardParts = [];
      if (nextStep.reward.balls) rewardParts.push(`+${nextStep.reward.balls} ⚾`);
      if (nextStep.reward.gems)  rewardParts.push(`+${nextStep.reward.gems} 💎`);
      reg(this.add.text(cx, panelY + 82, `Ödül: ${rewardParts.join('  ')}`, {
        fontSize: '12px', fontFamily: 'Arial', color: '#66ddaa',
      }).setOrigin(0.5).setDepth(32));

      // Coin maliyeti
      reg(this.add.text(cx, panelY + 106, `Maliyet: ${nextStep.cost.toLocaleString('tr-TR')} 💰`, {
        fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold',
        color: afford ? '#ffdd66' : '#664433',
      }).setOrigin(0.5).setDepth(32));

      // İNŞA ET butonu
      const btnY   = panelY + panelH / 2 - 38;
      const bFill  = afford ? 0x0d3a12 : 0x111122;
      const bBord  = afford ? 0x44cc55 : 0x2a2a40;
      const bLabel = afford
        ? `🔨 İNŞA ET — ${nextStep.cost.toLocaleString('tr-TR')} coin`
        : '⛔ Yetersiz coin';
      const bColor = afford ? '#44ff88' : '#445566';

      const btnBg = reg(this.add.rectangle(cx, btnY, 260, 48, bFill)
        .setDepth(32).setStrokeStyle(2, bBord));
      const btnTxt = reg(this.add.text(cx, btnY, bLabel, {
        fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold', color: bColor,
      }).setOrigin(0.5).setDepth(33));

      if (afford) {
        btnBg.setInteractive({ useHandCursor: true });
        btnTxt.setInteractive({ useHandCursor: true });

        const doBuild = () => {
          if (this._busy) return;
          close();
          this._buildStep(slot, area, step);
        };

        btnBg.on('pointerover', () => btnBg.setFillStyle(0x16501a));
        btnBg.on('pointerout',  () => btnBg.setFillStyle(bFill));
        btnBg.on('pointerup',   doBuild);
        btnTxt.on('pointerup',  doBuild);
      }
    }
  }

  // ── İnşaat animasyonu ─────────────────────────────────────────────────────────

  _buildStep(slot, area, stepIdx) {
    if (this._busy) return;
    const step = area.steps[stepIdx];
    if (!this._spendCoins(step.cost)) return;
    this._busy = true;
    this._refreshCoinLabel();

    const W  = this._W;
    const cx = W / 2;
    const H  = this._H;

    // Animasyon overlay (ekran ortası)
    const aniObjs = [];
    const regA    = o => { aniObjs.push(o); return o; };
    const cleanA  = () => aniObjs.forEach(o => { try { o.destroy(); } catch {} });

    regA(this.add.rectangle(cx, H / 2, W, H, 0x000000, 0.6).setDepth(40));

    const hammerTxt = regA(this.add.text(cx - 30, H / 2 - 20, '🔨', {
      fontSize: '44px', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(41));

    this.tweens.add({
      targets: hammerTxt, angle: 30,
      duration: 160, yoyo: true, repeat: -1,
    });

    regA(this.add.text(cx + 28, H / 2 - 18, 'İnşa Ediliyor...', {
      fontSize: '15px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffcc44', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0, 0.5).setDepth(41));

    // Progress bar
    const barW = 180;
    const barY = H / 2 + 30;
    regA(this.add.rectangle(cx, barY, barW, 12, 0x111133)
      .setDepth(41).setStrokeStyle(1, 0x3344aa));
    const fill = regA(this.add.rectangle(cx - barW / 2, barY, 2, 12, 0x44cc44)
      .setDepth(42).setOrigin(0, 0.5));

    this.tweens.add({
      targets: fill, duration: 2000, ease: 'Linear',
      onUpdate: (t) => { fill.width = Math.max(2, barW * t.progress); },
      onComplete: () => {
        cleanA();

        // State güncelle
        this._state[area.id] = stepIdx + 1;
        this._saveState();
        this._giveReward(step.reward);

        const isUnlock = stepIdx === 3;
        if (isUnlock) this._grantAreaUnlockReward(area);

        this._refreshCoinLabel();
        this._busy = false;

        // Slotları yeniden çiz
        this._drawSlots();

        // Efektler
        this._spawnConfetti();
        this._showRewardPopup(area, step.reward, isUnlock);
      },
    });
  }

  // ── Alan açılma ödülü ─────────────────────────────────────────────────────────

  _grantAreaUnlockReward(area) {
    this._giveReward({ balls: 100 });
    localStorage.setItem('cupbounce_double_ball_quota',  '100');
    localStorage.setItem('cupbounce_double_ball_active', 'true');
    const gs = this.scene.get('GameScene');
    if (gs && gs._checkDoubleBallMode) gs._checkDoubleBallMode();
  }

  // ── Ödül popup'u ─────────────────────────────────────────────────────────────

  _showRewardPopup(area, reward, isUnlock = false) {
    const W   = this._W;
    const H   = this._H;
    const cx  = W / 2;
    const cy  = H / 2;
    const popH = isUnlock ? 290 : 210;

    const objs = [];
    const reg  = o => { objs.push(o); return o; };

    reg(this.add.rectangle(cx, cy, 320, popH, 0x07071e, 0.97)
      .setDepth(50).setStrokeStyle(2, isUnlock ? 0xff8c00 : 0x44cc44));

    const titleStr = isUnlock ? `🏗️ ${area.name} TAMAMLANDI!` : `${area.icon} ${area.name}`;
    reg(this.add.text(cx, cy - popH / 2 + 30, titleStr, {
      fontSize: '17px', fontFamily: 'Arial', fontStyle: 'bold',
      color: isUnlock ? '#ffaa44' : '#88ffaa',
    }).setOrigin(0.5).setDepth(51));

    reg(this.add.text(cx, cy - popH / 2 + 54, isUnlock ? 'Tüm adımlar tamamlandı!' : 'İnşa tamamlandı!', {
      fontSize: '13px', fontFamily: 'Arial', color: '#aabbdd',
    }).setOrigin(0.5).setDepth(51));

    reg(this.add.graphics().setDepth(51).lineStyle(1, 0x334466, 0.8)
      .beginPath().moveTo(cx - 120, cy - popH / 2 + 68)
      .lineTo(cx + 120, cy - popH / 2 + 68).strokePath());

    let rowY = cy - popH / 2 + 92;
    const iconSt = { fontSize: '18px', fontFamily: 'Arial' };
    const valSt  = { fontSize: '22px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffee88' };
    const lblSt  = { fontSize: '12px', fontFamily: 'Arial', color: '#aabbcc' };

    if (reward.balls) {
      reg(this.add.text(cx - 60, rowY, '⚾', iconSt).setOrigin(0.5).setDepth(51));
      reg(this.add.text(cx - 20, rowY, `+${reward.balls}`, valSt).setOrigin(0, 0.5).setDepth(51));
      reg(this.add.text(cx + 50, rowY, 'Top', lblSt).setOrigin(0, 0.5).setDepth(51));
      rowY += 34;
    }
    if (reward.gems) {
      reg(this.add.text(cx - 60, rowY, '💎', iconSt).setOrigin(0.5).setDepth(51));
      reg(this.add.text(cx - 20, rowY, `+${reward.gems}`, valSt).setOrigin(0, 0.5).setDepth(51));
      reg(this.add.text(cx + 50, rowY, 'Gem', lblSt).setOrigin(0, 0.5).setDepth(51));
      rowY += 34;
    }

    if (isUnlock) {
      reg(this.add.text(cx - 60, rowY, '⚾', iconSt).setOrigin(0.5).setDepth(51));
      reg(this.add.text(cx - 20, rowY, '+100', valSt).setOrigin(0, 0.5).setDepth(51));
      reg(this.add.text(cx + 50, rowY, 'Bonus Top', lblSt).setOrigin(0, 0.5).setDepth(51));
      rowY += 36;
      reg(this.add.rectangle(cx, rowY + 14, 250, 32, 0xff6f00)
        .setDepth(51).setStrokeStyle(2, 0xffcc44));
      reg(this.add.text(cx, rowY + 14, '⚾×2  Çift Top Modu — 100 atış', {
        fontSize: '12px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5).setDepth(52));
    }

    const close = () => objs.forEach(o => { try { o.destroy(); } catch {} });

    const btn = reg(this.add.text(cx, cy + popH / 2 - 22, '  Harika!  ', {
      fontSize: '17px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#44ff88', backgroundColor: '#0a2a0a',
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setDepth(52).setInteractive({ useHandCursor: true }));
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

    for (let i = 0; i < 50; i++) {
      const col = colors[Phaser.Math.Between(0, colors.length - 1)];
      const px  = Phaser.Math.Between(20, W - 20);
      const sz  = Phaser.Math.Between(5, 12);
      const p   = this.add.rectangle(px, -10, sz, sz * (Phaser.Math.Between(0, 1) ? 1.8 : 1), col)
        .setDepth(45);
      this.tweens.add({
        targets: p, y: H + 20,
        x:       px + Phaser.Math.Between(-70, 70),
        angle:   Phaser.Math.Between(-270, 270),
        duration: Phaser.Math.Between(1000, 2500),
        delay:    Phaser.Math.Between(0, 400),
        ease:    'Linear',
        onComplete: () => p.destroy(),
      });
    }
  }

  // ── Navigasyon ───────────────────────────────────────────────────────────────

  _goBack() {
    this.scene.start('GameScene');
  }
}
