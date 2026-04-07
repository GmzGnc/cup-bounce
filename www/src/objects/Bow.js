// ─── Constants ────────────────────────────────────────────────────────────────
const VELOCITY_MULT = 9.5;   // pull distance → launch velocity
const MAX_PULL      = 130;   // max string pull in pixels
const MIN_POWER     = 14;    // ignore tiny drags
const BOW_HALF_W    = 72;    // half-width of horizontal bow limbs
const BALL_GRAVITY  = 620;   // px/s² — must match Ball.js
const DRAG_THRESHOLD = 6;    // pixels of movement to count as "dragging started"

// ─── Portrait-mode Bow ────────────────────────────────────────────────────────
// Bow sits at the BOTTOM-CENTER of the screen, facing UP.
// Tips extend LEFT and RIGHT.  The body arcs DOWNWARD (away from target).
// Player pulls the string DOWNWARD → ball launches UPWARD.
//
// Launch direction = OPPOSITE of pull direction:
//   pull down        → shoot straight up
//   pull down-left   → shoot up-right
//   pull down-right  → shoot up-left

export class Bow {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x   pivot X  (canvas centre ≈ 195)
   * @param {number} y   pivot Y  (near bottom  ≈ 730)
   */
  constructor(scene, x, y) {
    this.scene   = scene;
    this.pivotX  = x;
    this.pivotY  = y;

    // Horizontal tips
    this.tipLeft  = { x: x - BOW_HALF_W, y };
    this.tipRight = { x: x + BOW_HALF_W, y };

    // Nock = string midpoint (at rest it is the pivot)
    this.nockX = x;
    this.nockY = y;

    // Current pull position (player drags this)
    this.pullX = x;
    this.pullY = y;

    this.isDragging    = false;
    this.enabled       = true;
    this._downX        = x;
    this._downY        = y;
    this._timerFired   = false;
    this.aimAssistActive = false;  // enhanced aim line when booster is on

    this.bowGfx = scene.add.graphics().setDepth(15);
    this.aimGfx = scene.add.graphics().setDepth(14);

    this._setupInput();
    this._draw();
  }

  // ─── Input ──────────────────────────────────────────────────────────────────

  _setupInput() {
    const H = this.scene.scale.height;

    // Activate only on the BOTTOM half of the canvas
    this.scene.input.on('pointerdown', (ptr) => {
      if (!this.enabled) return;
      if (ptr.y > H * 0.50) {
        this.isDragging  = false;         // movement not confirmed yet
        this._pendingDown = true;
        this._downX      = ptr.x;
        this._downY      = ptr.y;
        this._timerFired = false;
        this.pullX = ptr.x;
        this.pullY = ptr.y;
      }
    });

    this.scene.input.on('pointermove', (ptr) => {
      if (!this._pendingDown) return;

      // Confirm drag once the finger has moved beyond threshold
      const moved = Math.hypot(ptr.x - this._downX, ptr.y - this._downY);
      if (!this.isDragging) {
        if (moved < DRAG_THRESHOLD) return;
        this.isDragging = true;

        // Notify GameScene to start the shot timer
        if (!this._timerFired) {
          this._timerFired = true;
          this.scene.events.emit('bow-drag-start');
        }
      }

      // Clamp pull point to MAX_PULL from nock
      const dx   = ptr.x - this.nockX;
      const dy   = ptr.y - this.nockY;
      const dist = Math.hypot(dx, dy);

      if (dist > MAX_PULL) {
        const angle = Math.atan2(dy, dx);
        this.pullX  = this.nockX + Math.cos(angle) * MAX_PULL;
        this.pullY  = this.nockY + Math.sin(angle) * MAX_PULL;
      } else {
        this.pullX = ptr.x;
        this.pullY = ptr.y;
      }

      this._draw();
    });

    this.scene.input.on('pointerup', () => {
      if (!this._pendingDown) return;
      this._pendingDown = false;

      const wasDragging = this.isDragging;
      this.isDragging   = false;
      this.aimGfx.clear();

      if (!wasDragging) {
        // Tap without drag — reset visuals, no launch
        this.pullX = this.nockX;
        this.pullY = this.nockY;
        this._draw();
        return;
      }

      const dx    = this.nockX - this.pullX; // inverted: opposite of pull direction
      const dy    = this.nockY - this.pullY;
      const power = Math.hypot(dx, dy);

      if (power >= MIN_POWER) {
        this.scene.events.emit('bow-release', {
          vx: dx * VELOCITY_MULT,
          vy: dy * VELOCITY_MULT
        });
      }

      this.pullX = this.nockX;
      this.pullY = this.nockY;
      this._draw();
    });
  }

  // ─── Drawing ────────────────────────────────────────────────────────────────

  _draw() {
    const g  = this.bowGfx;
    const tl = this.tipLeft;
    const tr = this.tipRight;
    g.clear();

    const cpX    = this.pivotX;
    const cpY    = this.pivotY + 28; // bow body curves DOWNWARD
    const STEPS  = 28;
    const tension = this.isDragging
      ? Math.hypot(this.nockX - this.pullX, this.nockY - this.pullY) / MAX_PULL
      : 0;

    // ── Bow body shadow (offset slightly) ────────────────────────────────────
    g.lineStyle(10, 0x000000, 0.25);
    g.beginPath();
    for (let i = 0; i <= STEPS; i++) {
      const t  = i / STEPS; const mt = 1 - t;
      const bx = mt*mt*tl.x + 2*mt*t*cpX + t*t*tr.x + 2;
      const by = mt*mt*tl.y + 2*mt*t*cpY + t*t*tr.y + 3;
      if (i === 0) g.moveTo(bx, by); else g.lineTo(bx, by);
    }
    g.strokePath();

    // ── Bow body: dark wood base ──────────────────────────────────────────────
    g.lineStyle(9, 0x6b3a0f, 1);
    g.beginPath();
    for (let i = 0; i <= STEPS; i++) {
      const t  = i / STEPS; const mt = 1 - t;
      const bx = mt*mt*tl.x + 2*mt*t*cpX + t*t*tr.x;
      const by = mt*mt*tl.y + 2*mt*t*cpY + t*t*tr.y;
      if (i === 0) g.moveTo(bx, by); else g.lineTo(bx, by);
    }
    g.strokePath();

    // ── Bow body: warm wood highlight ─────────────────────────────────────────
    g.lineStyle(5, 0xd4924a, 1);
    g.beginPath();
    for (let i = 0; i <= STEPS; i++) {
      const t  = i / STEPS; const mt = 1 - t;
      const bx = mt*mt*tl.x + 2*mt*t*cpX + t*t*tr.x;
      const by = mt*mt*tl.y + 2*mt*t*cpY + t*t*tr.y;
      if (i === 0) g.moveTo(bx, by); else g.lineTo(bx, by);
    }
    g.strokePath();

    // ── Tip decorations (nocks) ───────────────────────────────────────────────
    g.fillStyle(0x4a2008, 1);
    g.fillCircle(tl.x, tl.y, 5);
    g.fillCircle(tr.x, tr.y, 5);
    g.fillStyle(0xe8aa60, 0.7);
    g.fillCircle(tl.x, tl.y, 3);
    g.fillCircle(tr.x, tr.y, 3);

    // ── String ────────────────────────────────────────────────────────────────
    // Tension changes string colour/thickness
    const strAlpha = 0.85 + tension * 0.15;
    const strColor = tension > 0.5 ? 0xffddbb : 0xeeeeee;
    g.lineStyle(2 + tension * 1.5, strColor, strAlpha);
    g.beginPath();
    g.moveTo(tl.x, tl.y);
    g.lineTo(this.pullX, this.pullY);
    g.lineTo(tr.x, tr.y);
    g.strokePath();

    if (this.isDragging) {
      // Tension cross-line (shows bow under stress)
      g.lineStyle(1, 0xff8844, tension * 0.5);
      g.beginPath();
      g.moveTo(tl.x, tl.y);
      g.lineTo(tr.x, tr.y);
      g.strokePath();

      // Pull dot with outer glow
      g.fillStyle(0xff8833, tension * 0.4);
      g.fillCircle(this.pullX, this.pullY, 14);
      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(this.pullX, this.pullY, 7);
      g.fillStyle(0xffcc88, 0.6);
      g.fillCircle(this.pullX - 2, this.pullY - 2, 3);

      this._drawAimLine();
    } else {
      // Nock dot at rest
      g.fillStyle(0xaaaadd, 0.5);
      g.fillCircle(this.nockX, this.nockY - 28, 5);
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(this.nockX, this.nockY - 28, 3);
    }
  }

  /** Enable/disable enhanced aim-assist line. */
  setAimAssist(active) {
    this.aimAssistActive = active;
  }

  // ─── Aim prediction (dashed arc upward from pivot) ────────────────────────

  _drawAimLine() {
    const ag = this.aimGfx;
    ag.clear();

    const dx = this.nockX - this.pullX;
    const dy = this.nockY - this.pullY;
    const vx = dx * VELOCITY_MULT;
    const vy = dy * VELOCITY_MULT;

    const dt    = 0.04;
    const STEPS = this.aimAssistActive ? 52 : 32;  // longer lookahead with assist
    const dotColor = this.aimAssistActive ? 0x44ffcc : 0xffffff;
    const dotW     = this.aimAssistActive ? 3 : 2;

    let px  = this.pivotX;
    let py  = this.pivotY - 28;
    let pvx = vx;
    let pvy = vy;

    for (let i = 0; i < STEPS; i++) {
      const nx    = px + pvx * dt;
      const ny    = py + pvy * dt;
      const alpha = (1 - i / STEPS) * (this.aimAssistActive ? 0.75 : 0.55);

      if (i % 2 === 0) {
        ag.lineStyle(dotW, dotColor, alpha);
        ag.beginPath();
        ag.moveTo(px, py);
        ag.lineTo(nx, ny);
        ag.strokePath();
      }

      // With aim assist: draw landing marker at the last visible point
      if (this.aimAssistActive && i === STEPS - 1) {
        ag.fillStyle(0x44ffcc, 0.5);
        ag.fillCircle(nx, ny, 8);
        ag.lineStyle(2, 0x44ffcc, 0.8);
        ag.strokeCircle(nx, ny, 12);
      }

      pvy += BALL_GRAVITY * dt;
      px   = nx;
      py   = ny;

      if (py > this.scene.scale.height + 40) break;
      if (px < -20 || px > this.scene.scale.width + 20) break;
    }
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  reset() {
    this.isDragging   = false;
    this._pendingDown = false;
    this._timerFired  = false;
    this.pullX = this.nockX;
    this.pullY = this.nockY;
    this.aimGfx.clear();
    this._draw();
  }

  setEnabled(val) {
    this.enabled = val;
    if (!val) {
      this.isDragging   = false;
      this._pendingDown = false;
      this._timerFired  = false;
      this.pullX = this.nockX;
      this.pullY = this.nockY;
      this.aimGfx.clear();
      this._draw();
    }
  }

  destroy() {
    this.bowGfx.destroy();
    this.aimGfx.destroy();
  }
}
