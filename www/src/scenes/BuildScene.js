// ─── Alan + adım tanımları ────────────────────────────────────────────────────
const AREAS = [
  {
    id: 'kafe', name: 'Kafe', icon: '☕', color: 0xc8792e, unlockLevel: 1,
    desc: 'Sıcak bir buluşma noktası',
    steps: [
      { cost: 500,   reward: { balls: 20 } },
      { cost: 1200,  reward: { balls: 30 } },
      { cost: 2500,  reward: { gems: 2 } },
      { cost: 5000,  reward: { balls: 100, gems: 5 } },
    ],
  },
  {
    id: 'bahce', name: 'Bahçe', icon: '🌿', color: 0x4caf50, unlockLevel: 10,
    desc: 'Dinlendirici yeşil alan',
    steps: [
      { cost: 800,   reward: { balls: 20 } },
      { cost: 2000,  reward: { balls: 30 } },
      { cost: 4000,  reward: { gems: 3 } },
      { cost: 8000,  reward: { balls: 100, gems: 8 } },
    ],
  },
  {
    id: 'salon', name: 'Oyun Salonu', icon: '🕹️', color: 0x2196f3, unlockLevel: 30,
    desc: 'Eğlencenin merkezi',
    steps: [
      { cost: 1500,  reward: { balls: 20 } },
      { cost: 3500,  reward: { balls: 30 } },
      { cost: 7000,  reward: { gems: 4 } },
      { cost: 14000, reward: { balls: 100, gems: 12 } },
    ],
  },
  {
    id: 'sahne', name: 'Sahne', icon: '🎭', color: 0x9c27b0, unlockLevel: 60,
    desc: 'Gösteri ve performans alanı',
    steps: [
      { cost: 3000,  reward: { balls: 20 } },
      { cost: 7000,  reward: { balls: 30 } },
      { cost: 14000, reward: { gems: 6 } },
      { cost: 28000, reward: { balls: 100, gems: 18 } },
    ],
  },
  {
    id: 'atolye', name: 'Atölye', icon: '🔧', color: 0xff5722, unlockLevel: 100,
    desc: 'Yaratıcı çalışmalar için',
    steps: [
      { cost: 5000,  reward: { balls: 20 } },
      { cost: 12000, reward: { balls: 30 } },
      { cost: 24000, reward: { gems: 8 } },
      { cost: 48000, reward: { balls: 100, gems: 25 } },
    ],
  },
];

const BUILD_V2_KEY = 'cupbounce_build_v2';

// ─── BuildScene ───────────────────────────────────────────────────────────────
export class BuildScene extends Phaser.Scene {
  constructor() { super({ key: 'BuildScene' }); }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this._W = W;
    this._H = H;
    this._cx = W / 2;
    this._busy = false;

    this._state = this._loadState();

    // Full-screen backdrop
    this.add.rectangle(W / 2, H / 2, W, H, 0x03030f).setDepth(200);

    this._buildHeader();
    this._buildScrollArea();
    this._buildFooter();
  }

  // ── State ────────────────────────────────────────────────────────────────────

  _loadState() {
    try {
      return JSON.parse(localStorage.getItem(BUILD_V2_KEY) || '{}');
    } catch { return {}; }
  }

  _saveState() {
    localStorage.setItem(BUILD_V2_KEY, JSON.stringify(this._state));
  }

  /** Returns 0-4: how many steps completed for this area. */
  _getStep(areaId) {
    return Math.min(this._state[areaId] || 0, 4);
  }

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
    localStorage.setItem('cupbounce_coins', cur - amount);
    return true;
  }

  _giveReward(reward) {
    const em = window.economyManager;
    if (reward.balls) {
      if (em) em.setBalls(em.getBalls() + reward.balls);
      else {
        const b = parseInt(localStorage.getItem('cupbounce_balls') || '0', 10);
        localStorage.setItem('cupbounce_balls', b + reward.balls);
      }
    }
    if (reward.gems) {
      if (em) em.setGems(em.getGems() + reward.gems);
      else {
        const g = parseInt(localStorage.getItem('cupbounce_gems') || '0', 10);
        localStorage.setItem('cupbounce_gems', g + reward.gems);
      }
    }
  }

  // ── Header ───────────────────────────────────────────────────────────────────

  _buildHeader() {
    const W = this._W;
    // Panel header bg
    this.add.rectangle(W / 2, 38, W, 76, 0x07071e).setDepth(201);
    this.add.graphics().setDepth(201)
      .lineStyle(1, 0x1e2f66, 0.9)
      .beginPath().moveTo(0, 76).lineTo(W, 76).strokePath();

    this.add.text(W / 2, 22, '🏗️ İNŞA MODU', {
      fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#dde8ff', stroke: '#000033', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(202);

    this._coinLabel = this.add.text(W / 2, 52, '', {
      fontSize: '14px', fontFamily: 'Arial', color: '#ffdd66',
    }).setOrigin(0.5).setDepth(202);
    this._refreshCoinLabel();

    // Back button top-left
    const back = this.add.text(22, 22, '← Geri', {
      fontSize: '14px', fontFamily: 'Arial', color: '#7aadff',
    }).setOrigin(0, 0.5).setDepth(202).setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setStyle({ color: '#aaccff' }));
    back.on('pointerout',  () => back.setStyle({ color: '#7aadff' }));
    back.on('pointerdown', () => this._goBack());
  }

  _refreshCoinLabel() {
    this._coinLabel.setText('🪙 ' + this._getCoins().toLocaleString('tr-TR') + ' coin');
  }

  // ── Scroll area ──────────────────────────────────────────────────────────────

  _buildScrollArea() {
    const W = this._W;
    const H = this._H;
    const TOP = 82;
    const BOT = 56; // footer height
    const viewH = H - TOP - BOT;

    // Mask rectangle
    const maskRect = this.add.rectangle(W / 2, TOP + viewH / 2, W, viewH, 0xffffff)
      .setVisible(false).setDepth(205);
    const mask = new Phaser.Display.Masks.GeometryMask(this, maskRect);

    // Scrollable container
    this._container = this.add.container(0, TOP).setDepth(204).setMask(mask);
    this._scrollY   = 0;
    this._maxScroll = 0;
    this._viewH     = viewH;
    this._topY      = TOP;

    this._buildCards();
    this._enableScroll(TOP, viewH);
  }

  _buildCards() {
    // Destroy previous children
    this._container.removeAll(true);

    const W  = this._W;
    const cx = W / 2;
    const CARD_W   = W - 24;
    const CARD_H   = 120;
    const CARD_GAP = 10;
    const PAD      = 8;

    const currentLevel = this._getLevel();

    AREAS.forEach((area, i) => {
      const step   = this._getStep(area.id);
      const done   = step >= 4;
      const locked = currentLevel < area.unlockLevel && step === 0;
      const cardY  = PAD + i * (CARD_H + CARD_GAP);
      const cy     = cardY + CARD_H / 2;

      // ── Card bg ──────────────────────────────────────────────────────────────
      const bgColor  = done   ? 0x091e09
                     : locked ? 0x0c0c18
                     :          0x080e24;
      const brdColor = done   ? 0x2d7a2d
                     : locked ? 0x1a1a2e
                     :          0x2244aa;
      const cardBg = this.add.rectangle(cx, cy, CARD_W, CARD_H, bgColor)
        .setStrokeStyle(done ? 2 : 1, brdColor);
      this._container.add(cardBg);

      // ── Area visual (PNG varsa göster, yoksa emoji fallback) ─────────────────
      this._drawAreaVisual(
        area, step,
        cx - CARD_W / 2 + 4, cardY + 4, // x, y (sol üst köşe)
        100, CARD_H - 8,                 // w, h — büyütüldü
        !locked
      );

      const nameColor = done ? '#88ffaa' : locked ? '#445566' : '#ccd4ff';
      const nameTxt = this.add.text(cx - CARD_W / 2 + 112, cardY + 12, area.name, {
        fontSize: '16px', fontFamily: 'Arial', fontStyle: 'bold', color: nameColor,
      }).setOrigin(0, 0);
      this._container.add(nameTxt);

      const descTxt = this.add.text(cx - CARD_W / 2 + 112, cardY + 32, area.desc, {
        fontSize: '11px', fontFamily: 'Arial', color: '#445566',
      }).setOrigin(0, 0);
      this._container.add(descTxt);

      // ── Step progress bar ────────────────────────────────────────────────────
      const barX   = cx - CARD_W / 2 + 112;
      const barY   = cardY + 58;
      const barW   = CARD_W - 120;
      const stepW  = (barW - 3 * 4) / 4; // 4 steps with 4px gaps

      for (let s = 0; s < 4; s++) {
        const sx  = barX + s * (stepW + 4);
        const col = s < step ? 0x44cc44 : (s === step && !done ? 0x2244aa : 0x1a1a2e);
        const seg = this.add.rectangle(sx + stepW / 2, barY, stepW, 10, col)
          .setStrokeStyle(1, 0x223366);
        this._container.add(seg);
      }

      // Step label
      const stepLabel = done
        ? '✅ Tamamlandı'
        : locked
          ? `🔒 Level ${area.unlockLevel} gerekli`
          : `Adım ${step + 1}/4`;
      const stepLabelTxt = this.add.text(cx - CARD_W / 2 + 112, barY + 14, stepLabel, {
        fontSize: '11px', fontFamily: 'Arial',
        color: done ? '#44ff88' : locked ? '#445566' : '#7788aa',
      }).setOrigin(0, 0);
      this._container.add(stepLabelTxt);

      // ── Action button (right side) ───────────────────────────────────────────
      if (!done && !locked) {
        const nextStep = area.steps[step];
        const coins    = this._getCoins();
        const afford   = coins >= nextStep.cost;

        const rewardStr = this._rewardStr(nextStep.reward);
        const costStr   = nextStep.cost.toLocaleString('tr-TR') + ' coin';

        const btnW  = 92;
        const btnH  = 52;
        const btnX  = cx + CARD_W / 2 - btnW / 2 - 8;
        const btnCy = cy;

        const bFill = afford ? 0x0a2a0a : 0x111122;
        const bBord = afford ? 0x44cc44 : 0x2a2a40;

        const btnBg = this.add.rectangle(btnX, btnCy, btnW, btnH, bFill)
          .setStrokeStyle(1, bBord);
        this._container.add(btnBg);

        const costTxt = this.add.text(btnX, btnCy - 10, costStr, {
          fontSize: '11px', fontFamily: 'Arial', fontStyle: 'bold',
          color: afford ? '#ffcc44' : '#334455',
        }).setOrigin(0.5);
        this._container.add(costTxt);

        const rwdTxt = this.add.text(btnX, btnCy + 7, rewardStr, {
          fontSize: '11px', fontFamily: 'Arial',
          color: afford ? '#88ffcc' : '#334455',
        }).setOrigin(0.5);
        this._container.add(rwdTxt);

        const actTxt = this.add.text(btnX, btnCy + 22, afford ? 'İnşa Et' : 'Yetersiz', {
          fontSize: '12px', fontFamily: 'Arial', fontStyle: 'bold',
          color: afford ? '#44ff88' : '#445566',
        }).setOrigin(0.5);
        this._container.add(actTxt);

        if (afford) {
          btnBg.setInteractive({ useHandCursor: true });
          actTxt.setInteractive({ useHandCursor: true });

          const onBuildPress = () => {
            if (this._isDragging) return; // kullanıcı scroll yapıyordu, tıklama değil
            console.log('[Build] Butona tıklandı:', area.id, 'adım:', step + 1,
                        'coins:', this._getCoins(), 'busy:', this._busy);
            this._buildStep(area, step, cardY, CARD_H);
          };

          btnBg.on('pointerover', () => btnBg.setFillStyle(0x163516));
          btnBg.on('pointerout',  () => btnBg.setFillStyle(bFill));
          btnBg.on('pointerup',   onBuildPress);
          actTxt.on('pointerup',  onBuildPress);
        }
      }
    });

    // Update max scroll
    const totalH   = PAD + AREAS.length * (120 + CARD_GAP) + 8;
    this._maxScroll = Math.max(0, totalH - this._viewH);
  }

  // ── Alan görseli ─────────────────────────────────────────────────────────────

  /**
   * Alan için PNG texture varsa göster, yoksa _drawAreaVisualFallback'e düş.
   * Tüm objeler this._container'a eklenir (scroll içinde kalması için).
   */
  _drawAreaVisual(area, step, x, y, w, h, unlocked) {
    if (!unlocked) {
      const lockTxt = this.add.text(x + w / 2, y + h / 2, '🔒', {
        fontSize: '32px', fontFamily: 'Arial',
      }).setOrigin(0.5).setAlpha(0.4);
      this._container.add(lockTxt);
      return;
    }

    const texKey = `build_${area.id}_${Math.min(step, 3)}`;
    try {
      const img    = this.add.image(x + w / 2, y + h / 2, texKey);
      const scaleX = (w - 8) / img.width;
      const scaleY = (h - 8) / img.height;
      img.setScale(Math.min(scaleX, scaleY)).setOrigin(0.5);
      this._container.add(img);
    } catch (e) {
      this._drawAreaVisualFallback(area, step, x, y, w, h);
    }
  }

  /** Eski emoji-tabanlı ikon — PNG yoksa kullanılır. */
  _drawAreaVisualFallback(area, step, x, y, w, h) {
    const iconTxt = this.add.text(x + w / 2, y + h / 2 - 8, area.icon, {
      fontSize: '22px', fontFamily: 'Arial',
    }).setOrigin(0.5);
    this._container.add(iconTxt);

    // Tamamlanan adım sayısını küçük bir badge olarak göster
    if (step > 0) {
      const badge = this.add.text(x + w / 2, y + h / 2 + 14, `${step}/4`, {
        fontSize: '9px', fontFamily: 'Arial', color: '#44cc88',
      }).setOrigin(0.5);
      this._container.add(badge);
    }
  }

  _rewardStr(reward) {
    const parts = [];
    if (reward.balls) parts.push(`+${reward.balls} 🎱`);
    if (reward.gems)  parts.push(`+${reward.gems} 💎`);
    return parts.join('  ');
  }

  // ── Build animation ──────────────────────────────────────────────────────────

  _buildStep(area, stepIdx, cardY, cardH) {
    if (this._busy) return;
    const step = area.steps[stepIdx];
    if (!this._spendCoins(step.cost)) return;
    this._busy = true;
    this._refreshCoinLabel();

    const W  = this._W;
    const cx = W / 2;
    // Card center in screen coords
    const cy = this._topY + cardY + cardH / 2 + this._scrollY;

    // Overlay on card
    const overlay = this.add.rectangle(cx, cy, W - 24, cardH, 0x000000, 0.65).setDepth(210);

    // 🔨 icon that wobbles
    const hammerTxt = this.add.text(cx - 40, cy, '🔨', {
      fontSize: '28px', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(211);

    this.tweens.add({
      targets: hammerTxt, angle: 25, duration: 180, yoyo: true, repeat: -1,
    });

    // Progress bar bg + fill
    const barW = 160;
    const barY = cy + 20;
    this.add.rectangle(cx, barY, barW, 10, 0x111133, 1).setDepth(211).setStrokeStyle(1, 0x3344aa);
    const fill = this.add.rectangle(cx - barW / 2, barY, 0, 10, 0x44cc44).setDepth(212).setOrigin(0, 0.5);

    const buildLbl = this.add.text(cx + 50, cy, 'İnşa Ediliyor...', {
      fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffcc44', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(211);

    this.tweens.add({
      targets: fill, scaleX: barW / fill.width, duration: 2200, ease: 'Linear',
      onUpdate: (tween) => {
        fill.width = barW * tween.progress;
      },
      onComplete: () => {
        overlay.destroy(); hammerTxt.destroy(); fill.destroy(); buildLbl.destroy();

        // Commit step
        this._state[area.id] = stepIdx + 1;
        this._saveState();
        this._giveReward(step.reward);
        const isUnlock = stepIdx === 3;
        if (isUnlock) this._grantAreaUnlockReward(area);
        this._refreshCoinLabel();

        this._busy = false;
        this._buildCards();
        this._spawnConfetti();
        this._showRewardPopup(area, step.reward, isUnlock);
      },
    });
  }

  // ── Alan açılma ödülü ─────────────────────────────────────────────────────────

  _grantAreaUnlockReward(area) {
    // +100 ekstra top
    this._giveReward({ balls: 100 });

    // Çift top modunu aktifleştir (100 atış kotası)
    localStorage.setItem('cupbounce_double_ball_quota',  '100');
    localStorage.setItem('cupbounce_double_ball_active', 'true');

    // GameScene çalışıyorsa anında bildir
    const gs = this.scene.get('GameScene');
    if (gs && gs._checkDoubleBallMode) gs._checkDoubleBallMode();
  }

  // ── Reward popup ─────────────────────────────────────────────────────────────

  _showRewardPopup(area, reward, isUnlock = false) {
    const W  = this._W;
    const H  = this._H;
    const cx = W / 2;
    const cy = H / 2;

    const popH = isUnlock ? 280 : 200;
    const objs = [];
    const reg  = o => { objs.push(o); return o; };

    reg(this.add.rectangle(cx, cy, 310, popH, 0x07071e, 0.97)
      .setDepth(220).setStrokeStyle(2, isUnlock ? 0xff8c00 : 0x44cc44));

    // Title
    const titleStr = isUnlock
      ? `🏗️ ${area.name} TAMAMLANDI!`
      : `${area.icon} ${area.name}`;
    reg(this.add.text(cx, cy - popH / 2 + 28, titleStr, {
      fontSize: '17px', fontFamily: 'Arial', fontStyle: 'bold',
      color: isUnlock ? '#ffaa44' : '#88ffaa',
    }).setOrigin(0.5).setDepth(221));

    reg(this.add.text(cx, cy - popH / 2 + 52, isUnlock ? 'Tüm adımlar tamamlandı!' : 'İnşa tamamlandı!', {
      fontSize: '13px', fontFamily: 'Arial', color: '#aabbdd',
    }).setOrigin(0.5).setDepth(221));

    // Separator
    const sepG = this.add.graphics().setDepth(221);
    sepG.lineStyle(1, 0x334466, 0.8)
      .beginPath().moveTo(cx - 120, cy - popH / 2 + 66).lineTo(cx + 120, cy - popH / 2 + 66).strokePath();
    objs.push(sepG);

    // Reward icons
    let rowY = cy - popH / 2 + 92;
    const iconStyle = { fontSize: '18px', fontFamily: 'Arial' };
    const valStyle  = { fontSize: '22px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffee88' };
    const lblStyle  = { fontSize: '12px', fontFamily: 'Arial', color: '#aabbcc' };

    if (reward.balls) {
      reg(this.add.text(cx - 60, rowY, '⚾', iconStyle).setOrigin(0.5).setDepth(221));
      reg(this.add.text(cx - 20, rowY, `+${reward.balls}`, valStyle).setOrigin(0, 0.5).setDepth(221));
      reg(this.add.text(cx + 50, rowY, 'Top', lblStyle).setOrigin(0, 0.5).setDepth(221));
      rowY += 34;
    }
    if (reward.gems) {
      reg(this.add.text(cx - 60, rowY, '💎', iconStyle).setOrigin(0.5).setDepth(221));
      reg(this.add.text(cx - 20, rowY, `+${reward.gems}`, valStyle).setOrigin(0, 0.5).setDepth(221));
      reg(this.add.text(cx + 50, rowY, 'Gem', lblStyle).setOrigin(0, 0.5).setDepth(221));
      rowY += 34;
    }

    if (isUnlock) {
      // Extra +100 top unlock reward
      reg(this.add.text(cx - 60, rowY, '⚾', iconStyle).setOrigin(0.5).setDepth(221));
      reg(this.add.text(cx - 20, rowY, '+100', valStyle).setOrigin(0, 0.5).setDepth(221));
      reg(this.add.text(cx + 50, rowY, 'Bonus Top', lblStyle).setOrigin(0, 0.5).setDepth(221));
      rowY += 40;

      // Double ball badge
      const badgeBg = reg(this.add.rectangle(cx, rowY + 14, 240, 34, 0xff6f00, 1)
        .setDepth(221).setStrokeStyle(2, 0xffcc44));
      reg(this.add.text(cx, rowY + 14, '⚾×2  Çift Top Modu Aktif!  (100 atış)', {
        fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5).setDepth(222));
      rowY += 46;
    }

    const btn = reg(this.add.text(cx, cy + popH / 2 - 22, '  Harika!  ', {
      fontSize: '17px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#44ff88', backgroundColor: '#0a2a0a',
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setDepth(222).setInteractive({ useHandCursor: true }));

    const close = () => { objs.forEach(o => { try { o.destroy(); } catch {} }); };
    btn.on('pointerdown', close);
    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#163516' }));
    btn.on('pointerout',  () => btn.setStyle({ backgroundColor: '#0a2a0a' }));
    this.time.delayedCall(isUnlock ? 6000 : 3500, () => { try { close(); } catch {} });
  }

  // ── Footer ───────────────────────────────────────────────────────────────────

  _buildFooter() {
    const W = this._W;
    const H = this._H;

    this.add.rectangle(W / 2, H - 28, W, 56, 0x07071e).setDepth(201);
    this.add.graphics().setDepth(201)
      .lineStyle(1, 0x1e2f66, 0.9)
      .beginPath().moveTo(0, H - 56).lineTo(W, H - 56).strokePath();

    const backBtn = this.add.text(W / 2, H - 28, '← Oyuna Dön', {
      fontSize: '17px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#7aadff', stroke: '#000033', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => backBtn.setStyle({ color: '#aaccff' }));
    backBtn.on('pointerout',  () => backBtn.setStyle({ color: '#7aadff' }));
    backBtn.on('pointerdown', () => this._goBack());
  }

  // ── Scroll ───────────────────────────────────────────────────────────────────

  _enableScroll(topY, viewH) {
    const DRAG_THRESHOLD = 8; // px — bu kadar hareket yoksa scroll değil, tıklama

    let pointerDownY     = null;
    let scrollStart      = 0;
    this._isDragging     = false;

    this.input.on('pointerdown', (p) => {
      if (p.y < topY || p.y > topY + viewH) return;
      pointerDownY     = p.y;
      scrollStart      = this._scrollY;
      this._isDragging = false;
    });

    this.input.on('pointermove', (p) => {
      if (pointerDownY === null || !p.isDown) return;
      const delta = pointerDownY - p.y;
      if (Math.abs(delta) >= DRAG_THRESHOLD) this._isDragging = true;
      if (!this._isDragging) return;
      this._scrollY = Phaser.Math.Clamp(scrollStart + delta, -this._maxScroll, 0);
      this._container.setY(topY + this._scrollY);
    });

    // Obje pointerup olayları sahne pointerup'ından ÖNCE tetiklenir —
    // dolayısıyla buton handler'ları _isDragging'i doğru okur, sonra burada temizlenir.
    this.input.on('pointerup', () => {
      pointerDownY     = null;
      this._isDragging = false;
    });
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
        .setDepth(215);

      this.tweens.add({
        targets:  p,
        y:        H + 20,
        x:        px + Phaser.Math.Between(-70, 70),
        angle:    Phaser.Math.Between(-270, 270),
        duration: Phaser.Math.Between(1000, 2500),
        delay:    Phaser.Math.Between(0, 400),
        ease:     'Linear',
        onComplete: () => p.destroy(),
      });
    }
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  _goBack() {
    this.scene.start('GameScene');
  }
}
