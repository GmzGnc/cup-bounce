// ─── TutorialScene ────────────────────────────────────────────────────────────
// 5-step interactive tutorial shown only to first-time players.
// Each step waits for the specific player action before advancing.

const DONE_KEY = 'cupbounce_tutorial_done';

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  {
    id:      'draw',
    title:   'Yayı Çek!',
    body:    'Parmağını yaya koy ve\naşağıya doğru çek.',
    hint:    'Yayı çekince devam edeceğiz…',
    arrow:   true,   // animated arrow pointing at bow
    waitFor: 'drag', // wait for bow-drag event
  },
  {
    id:      'power',
    title:   'Gücü Ayarla!',
    body:    'Az çekersen yavaş gider.\nÇok çekersen hızlı!',
    hint:    'Ne kadar çektiğini hisset.',
    arrow:   false,
    waitFor: 'tap',  // just tap / tap to continue
  },
  {
    id:      'score',
    title:   'Bardağa Sok!',
    body:    'Topu salıver ve bardağa\nhedefle. Dene!',
    hint:    'Salıver ve bardağa gir…',
    arrow:   false,
    waitFor: 'hit',  // wait for ball-hit event
  },
  {
    id:      'cups',
    title:   'Puan Kazan!',
    body:    'Yeşil bardak → 100 puan\nKırmızı bardak → 200 puan\nMor bardak → 💎 Gem!',
    hint:    'Devam etmek için dokun.',
    arrow:   false,
    waitFor: 'tap',
  },
  {
    id:      'ready',
    title:   'Hazırsın! 🎯',
    body:    'Topların biter mi?\n→ Mağazadan veya reklam\n   izleyerek ücretsiz kazan!\n\nHer gün giriş yap → Bonus top!',
    hint:    'Hadi oynayalım!',
    arrow:   false,
    waitFor: 'tap',
  },
];

export class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialScene' });
  }

  /** Returns true if tutorial has already been completed. */
  static isDone() {
    return localStorage.getItem(DONE_KEY) === 'true';
  }

  static markDone() {
    localStorage.setItem(DONE_KEY, 'true');
  }

  static reset() {
    localStorage.removeItem(DONE_KEY);
  }

  // ─────────────────────────────────────────────────────────────────────────────

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this._W = W;
    this._H = H;

    this._step    = 0;
    this._waiting = false;
    this._objs    = [];   // objects belonging to current step (cleared between steps)

    // ── Static background (matches GameScene look) ────────────────────────────
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a);

    // Stars
    for (let i = 0; i < 70; i++) {
      const sx = Phaser.Math.Between(5, W - 5);
      const sy = Phaser.Math.Between(5, H - 5);
      const r  = Phaser.Math.FloatBetween(0.5, 1.8);
      const a  = Phaser.Math.FloatBetween(0.2, 0.75);
      const s  = this.add.circle(sx, sy, r, 0xffffff, a);
      this.tweens.add({
        targets: s, alpha: a * 0.15,
        duration: Phaser.Math.Between(900, 2600),
        yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
        ease: 'Sine.easeInOut',
      });
    }

    // Bow zone separator (visual reference)
    const groundY = H - 164;
    const zone = this.add.graphics();
    zone.fillStyle(0x030310, 0.65);
    zone.fillRect(0, groundY, W, H - groundY);
    zone.lineStyle(2, 0x2244cc, 0.85);
    zone.beginPath().moveTo(0, groundY).lineTo(W, groundY).strokePath();

    // ── Mock bow ──────────────────────────────────────────────────────────────
    this._drawMockBow(W / 2, H - 114);

    // ── Mock cup (step 3 only, hidden initially) ──────────────────────────────
    this._mockCup = this._drawMockCup(W / 2, H / 2 - 60, 0x44cc66, 100);
    this._mockCup.forEach(o => o.setAlpha(0));

    // ── "Skip" button — always visible ───────────────────────────────────────
    const skipBg = this.add.rectangle(W - 46, 28, 76, 28, 0x1a1a2e)
      .setDepth(300).setStrokeStyle(1, 0x334466).setInteractive({ useHandCursor: true });
    const skipTxt = this.add.text(W - 46, 28, 'Atla →', {
      fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', color: '#445577',
    }).setOrigin(0.5).setDepth(301).setInteractive({ useHandCursor: true });

    skipBg .on('pointerover',  () => { skipBg.setFillStyle(0x252540); skipTxt.setStyle({ color: '#7799cc' }); });
    skipBg .on('pointerout',   () => { skipBg.setFillStyle(0x1a1a2e); skipTxt.setStyle({ color: '#445577' }); });
    skipBg .on('pointerdown',  () => this._finish());
    skipTxt.on('pointerdown',  () => this._finish());

    // ── Progress dots ─────────────────────────────────────────────────────────
    this._dots = [];
    const dotSpacing = 14;
    const dotsStartX = W / 2 - ((STEPS.length - 1) * dotSpacing) / 2;
    for (let i = 0; i < STEPS.length; i++) {
      const d = this.add.circle(dotsStartX + i * dotSpacing, H - 24, 4, 0x334466).setDepth(300);
      this._dots.push(d);
    }

    // ── Start first step ──────────────────────────────────────────────────────
    this._showStep(0);
  }

  // ─── Step rendering ───────────────────────────────────────────────────────────

  _showStep(index) {
    this._clearStepObjs();
    this._step    = index;
    this._waiting = false;

    // Update progress dots
    this._dots.forEach((d, i) => d.setFillStyle(i <= index ? 0x4477cc : 0x334466));

    const step = STEPS[index];

    // Show mock cup only on step 3
    const showCup = (step.waitFor === 'hit');
    this._mockCup.forEach(o => {
      this.tweens.add({ targets: o, alpha: showCup ? 1 : 0, duration: 300 });
    });

    // Dim overlay
    const overlay = this._reg(
      this.add.rectangle(this._W / 2, this._H / 2, this._W, this._H, 0x000000, 0.52)
        .setDepth(200).setInteractive()  // absorbs stray taps
    );

    // Balloon panel
    this._buildBalloon(step);

    // Animated arrow (step 1 only)
    if (step.arrow) {
      this._buildArrow();
    }

    // Set up action listener for this step
    this._armWaitFor(step.waitFor);
  }

  // ── Balloon tooltip ──────────────────────────────────────────────────────────

  _buildBalloon(step) {
    const W    = this._W;
    const panW = 310;
    const panH = 190;
    const panX = W / 2;
    const panY = this._H / 2 - 110;

    // Shadow
    this._reg(this.add.rectangle(panX + 3, panY + 4, panW, panH, 0x000000, 0.35).setDepth(210));

    // Panel background
    const panel = this._reg(
      this.add.rectangle(panX, panY, panW, panH, 0x0d1235, 0.97)
        .setDepth(211).setStrokeStyle(2, 0x3366cc)
    );

    // Step counter
    this._reg(this.add.text(panX - panW / 2 + 14, panY - panH / 2 + 14,
      `ADIM ${this._step + 1} / ${STEPS.length}`, {
        fontSize: '10px', fontFamily: 'Arial', fontStyle: 'bold',
        color: '#334477', letterSpacing: 2,
      }).setOrigin(0, 0).setDepth(212)
    );

    // Title
    this._reg(this.add.text(panX, panY - panH / 2 + 36, step.title, {
      fontSize: '22px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffffff', stroke: '#000033', strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(212));

    // Separator
    const sep = this._reg(this.add.graphics().setDepth(212));
    sep.lineStyle(1, 0x1e3066, 0.8)
      .beginPath()
      .moveTo(panX - panW / 2 + 16, panY - panH / 2 + 68)
      .lineTo(panX + panW / 2 - 16, panY - panH / 2 + 68)
      .strokePath();

    // Body text
    this._reg(this.add.text(panX, panY - panH / 2 + 84, step.body, {
      fontSize: '15px', fontFamily: 'Arial', color: '#aabbdd',
      align: 'center', lineSpacing: 6,
    }).setOrigin(0.5, 0).setDepth(212));

    // Hint / CTA
    const isLastStep = (this._step === STEPS.length - 1);
    const ctaLabel   = isLastStep ? '🎮  Oyuna Başla!' : step.hint;
    const ctaColor   = isLastStep ? '#44ff88' : '#556688';

    const hintTxt = this._reg(this.add.text(panX, panY + panH / 2 - 22, ctaLabel, {
      fontSize: '13px', fontFamily: 'Arial', fontStyle: isLastStep ? 'bold' : 'normal',
      color: ctaColor,
    }).setOrigin(0.5).setDepth(212));

    // Pulse hint on tap-steps
    if (step.waitFor === 'tap') {
      this.tweens.add({
        targets: hintTxt, alpha: 0.35,
        duration: 750, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // "Tail" triangle pointing downward toward bow
    const tailX  = panX;
    const tailTY = panY + panH / 2;
    const tailBY = tailTY + 22;
    const tailG  = this._reg(this.add.graphics().setDepth(211));
    tailG.fillStyle(0x0d1235, 0.97);
    tailG.fillTriangle(tailX - 12, tailTY, tailX + 12, tailTY, tailX, tailBY);

    // Slide-in animation
    panel.setAlpha(0);
    this.tweens.add({ targets: panel, alpha: 1, duration: 220, ease: 'Power2' });
  }

  // ── Animated arrow pointing at bow ───────────────────────────────────────────

  _buildArrow() {
    const cx = this._W / 2;
    const ay = this._H - 190;   // just above the bow zone

    const arrowGfx = this._reg(this.add.graphics().setDepth(215));
    const drawArrow = (offset) => {
      arrowGfx.clear();
      arrowGfx.fillStyle(0xffffff, 0.9);
      const y = ay + offset;
      // Downward arrow shape
      arrowGfx.fillTriangle(cx - 18, y,  cx + 18, y,  cx, y + 28);
      arrowGfx.fillRect(cx - 7, y - 24, 14, 26);
    };

    let t = 0;
    this._arrowTimer = this.time.addEvent({
      delay: 16,
      loop:  true,
      callback: () => {
        t += 0.08;
        drawArrow(Math.sin(t) * 8);
      },
    });
    this._objs.push({ destroy: () => {
      if (this._arrowTimer) { this._arrowTimer.remove(false); this._arrowTimer = null; }
    }});
  }

  // ── Waiting for player action ─────────────────────────────────────────────────

  _armWaitFor(action) {
    this._waiting = true;

    if (action === 'tap') {
      // Any tap on overlay or panel advances
      this.time.delayedCall(400, () => {
        if (!this._waiting) return;
        this.input.once('pointerdown', () => {
          if (this._waiting) this._nextStep();
        });
      });
      return;
    }

    if (action === 'drag') {
      // Listen for pointer moving downward significantly — simulates a drag
      let startY = null;
      const onDown = (ptr) => {
        startY = ptr.y;
        this.input.on('pointermove', onMove);
      };
      const onMove = (ptr) => {
        if (startY !== null && ptr.y - startY > 40 && this._waiting) {
          this.input.off('pointerdown', onDown);
          this.input.off('pointermove', onMove);
          this.time.delayedCall(300, () => this._nextStep());
        }
      };
      this.input.on('pointerdown', onDown);
      // Store cleanup so _clearStepObjs can remove listeners
      this._objs.push({ destroy: () => {
        this.input.off('pointerdown', onDown);
        this.input.off('pointermove', onMove);
      }});
      return;
    }

    if (action === 'hit') {
      // Simulate a "hit" when player taps anywhere after 1 second
      this.time.delayedCall(800, () => {
        if (!this._waiting) return;
        this.input.once('pointerdown', () => {
          if (!this._waiting) return;
          // Flash the cup as "hit"
          this._mockCup.forEach(o => {
            this.tweens.add({ targets: o, alpha: 0, duration: 120, yoyo: true, repeat: 1,
              onComplete: () => o.setAlpha(1),
            });
          });
          this.time.delayedCall(400, () => this._nextStep());
        });
      });
      return;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  _nextStep() {
    this._waiting = false;
    const next = this._step + 1;
    if (next >= STEPS.length) {
      this._finish();
    } else {
      this._showStep(next);
    }
  }

  _finish() {
    TutorialScene.markDone();
    // Fade out then start GameScene
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene');
    });
  }

  // ─── Object management ────────────────────────────────────────────────────────

  _reg(obj) {
    this._objs.push(obj);
    return obj;
  }

  _clearStepObjs() {
    this._objs.forEach(o => { try { o.destroy(); } catch {} });
    this._objs = [];
    this.tweens.killAll();
    this.input.off('pointerdown');
    this.input.off('pointermove');
  }

  // ─── Static mock visuals ─────────────────────────────────────────────────────

  _drawMockBow(cx, cy) {
    // Simplified bow — dark wood arc
    const g = this.add.graphics().setDepth(10);
    g.lineStyle(7, 0x6b3a0f, 1);
    g.beginPath();
    g.moveTo(cx, cy - 60);
    g.quadraticCurveTo(cx - 55, cy, cx, cy + 60);
    g.strokePath();
    // String
    g.lineStyle(1, 0xcccccc, 0.7);
    g.beginPath().moveTo(cx, cy - 60).lineTo(cx, cy + 60).strokePath();
    // Ball on string
    this.add.circle(cx, cy, 10, 0x4488ff).setDepth(11);
    this.add.circle(cx - 3, cy - 3, 3, 0xffffff, 0.5).setDepth(12);
  }

  _drawMockCup(cx, cy, color, points) {
    const g = this.add.graphics().setDepth(10);
    // Cup body (trapezoid)
    g.fillStyle(color, 0.9);
    g.fillTriangle(cx - 28, cy, cx + 28, cy, cx + 20, cy + 38);
    g.fillTriangle(cx - 28, cy, cx - 20, cy + 38, cx + 20, cy + 38);
    g.fillRect(cx - 20, cy + 38, 40, 6);
    // Rim highlight
    g.fillStyle(0xffffff, 0.3);
    g.fillEllipse(cx, cy, 56, 10);

    const label = this.add.text(cx, cy + 22, `${points}`, {
      fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(11);

    return [g, label];
  }
}
