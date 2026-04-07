const BALL_RADIUS = 15;

export class Cup {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} color  - hex integer
   * @param {number} points
   * @param {object} options
   *   @param {boolean} [options.isGem]  - shows 💎, awards a gem on score
   *   @param {boolean} [options.small]  - smaller cup (harder to hit)
   *   @param {object}  [options.move]   - { axis:'x'|'y', speed, range, phaseOffset? }
   */
  constructor(scene, x, y, color, points, options = {}) {
    this.scene      = scene;
    this.x          = x;
    this.y          = y;
    this.originX    = x;
    this.originY    = y;
    this.color      = color;
    this.points     = points;
    this.isGem      = options.isGem  ?? false;
    this.small      = options.small  ?? false;
    this.moveConfig = options.move   ?? null;
    this.scored     = false;

    this.cupW  = this.small ? 48 : 64;
    this.cupH  = this.small ? 40 : 52;
    this.taper = this.small ? 5  : 8;

    // Shadow layer behind cup
    this.shadowGfx = scene.add.graphics().setDepth(7);
    this.gfx       = scene.add.graphics().setDepth(8);

    // Points badge
    const badgeFontSize = this.small ? '13px' : '17px';
    this.label = scene.add.text(x, y - this.cupH / 2 - 16, `+${points}`, {
      fontSize: badgeFontSize,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(9);

    // Gem icon
    if (this.isGem) {
      const gemSize = this.small ? '16px' : '22px';
      this.gemIcon = scene.add.text(x, y + 4, '💎', {
        fontSize: gemSize,
        fontFamily: '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",Arial'
      }).setOrigin(0.5).setDepth(10);
    }

    this.draw();
  }

  // ─── CSS hex helper ────────────────────────────────────────────────────────
  _css(hex) {
    return '#' + hex.toString(16).padStart(6, '0');
  }

  // ─── Drawing ───────────────────────────────────────────────────────────────

  draw() {
    this.shadowGfx.clear();
    const g = this.gfx;
    g.clear();

    if (this.scored) {
      g.alpha       = 0.15;
      this.shadowGfx.alpha = 0;
      return;
    }
    g.alpha       = 1;
    this.shadowGfx.alpha = 1;

    const { x, y, cupW: w, cupH: h, taper } = this;
    const hw = w / 2;
    const hh = h / 2;

    // ── Drop shadow ───────────────────────────────────────────────────────────
    const sg = this.shadowGfx;
    sg.fillStyle(0x000000, 0.28);
    sg.beginPath();
    sg.moveTo(x - hw + 4,         y - hh + 5);
    sg.lineTo(x + hw + 4,         y - hh + 5);
    sg.lineTo(x + hw - taper + 4, y + hh + 5);
    sg.lineTo(x - hw + taper + 4, y + hh + 5);
    sg.closePath();
    sg.fillPath();

    // ── Body fill — two-tone for 3D depth ─────────────────────────────────────
    // Lower, darker fill
    g.fillStyle(this.color, 0.18);
    g.beginPath();
    g.moveTo(x - hw,          y - hh);
    g.lineTo(x + hw,          y - hh);
    g.lineTo(x + hw - taper,  y + hh);
    g.lineTo(x - hw + taper,  y + hh);
    g.closePath();
    g.fillPath();

    // Upper, brighter fill (upper 45% of cup)
    const splitY   = y - hh + h * 0.45;
    const splitHWL = hw   - taper * 0.45;
    const splitHWR = splitHWL;
    g.fillStyle(this.color, 0.38);
    g.beginPath();
    g.moveTo(x - hw,       y - hh);
    g.lineTo(x + hw,       y - hh);
    g.lineTo(x + splitHWR, splitY);
    g.lineTo(x - splitHWL, splitY);
    g.closePath();
    g.fillPath();

    // ── Outline ───────────────────────────────────────────────────────────────
    g.lineStyle(this.small ? 2.5 : 3, this.color, 1);
    g.beginPath();
    g.moveTo(x - hw,          y - hh);
    g.lineTo(x + hw,          y - hh);
    g.lineTo(x + hw - taper,  y + hh);
    g.lineTo(x - hw + taper,  y + hh);
    g.closePath();
    g.strokePath();

    // ── Bright rim (opening) ─────────────────────────────────────────────────
    g.lineStyle(this.small ? 3 : 5, 0xffffff, 0.92);
    g.beginPath();
    g.moveTo(x - hw, y - hh);
    g.lineTo(x + hw, y - hh);
    g.strokePath();

    // Slight coloured rim tint below the white rim
    g.lineStyle(1, this.color, 0.65);
    g.beginPath();
    g.moveTo(x - hw, y - hh + 5);
    g.lineTo(x + hw, y - hh + 5);
    g.strokePath();

    // ── Gem cup: glowing outer border ─────────────────────────────────────────
    if (this.isGem) {
      g.lineStyle(2, 0xce93d8, 0.9);
      g.beginPath();
      g.moveTo(x - hw,          y - hh);
      g.lineTo(x + hw,          y - hh);
      g.lineTo(x + hw - taper,  y + hh);
      g.lineTo(x - hw + taper,  y + hh);
      g.closePath();
      g.strokePath();

      // Outer glow halo
      g.lineStyle(6, 0x9c27b0, 0.22);
      g.beginPath();
      g.moveTo(x - hw - 3,          y - hh - 2);
      g.lineTo(x + hw + 3,          y - hh - 2);
      g.lineTo(x + hw - taper + 3,  y + hh + 2);
      g.lineTo(x - hw + taper - 3,  y + hh + 2);
      g.closePath();
      g.strokePath();
    }

    // ── Inner shine stripes ───────────────────────────────────────────────────
    g.lineStyle(2, 0xffffff, 0.38);
    g.beginPath();
    g.moveTo(x - hw + 7,  y - hh + 5);
    g.lineTo(x - hw + 12, y + hh - 5);
    g.strokePath();

    g.lineStyle(1, 0xffffff, 0.16);
    g.beginPath();
    g.moveTo(x - hw + 16, y - hh + 5);
    g.lineTo(x - hw + 19, y + hh - 8);
    g.strokePath();
  }

  // ─── Movement ──────────────────────────────────────────────────────────────

  update(time, timeScale = 1.0) {
    if (!this.moveConfig || this.scored) return;

    const { axis, speed, range, phaseOffset = 0 } = this.moveConfig;
    const offset = Math.sin(time * speed * timeScale * 0.001 + phaseOffset) * range;

    if (axis === 'x') {
      this.x = this.originX + offset;
    } else {
      this.y = this.originY + offset;
    }

    this.draw();
    this.label.setPosition(this.x, this.y - this.cupH / 2 - 16);
    if (this.gemIcon) this.gemIcon.setPosition(this.x, this.y + 4);
  }

  // ─── Collision check ───────────────────────────────────────────────────────

  checkBallEntry(ball) {
    if (this.scored) return false;

    const bx = ball.getX();
    const by = ball.getY();
    const vy = ball.getVelocityY();

    const openingY   = this.y - this.cupH / 2;
    const innerLeft  = this.x - this.cupW / 2 + BALL_RADIUS;
    const innerRight = this.x + this.cupW / 2 - BALL_RADIUS;

    const inXRange   = bx >= innerLeft && bx <= innerRight;
    const nearRim    = by >= openingY - 20 && by <= openingY + 26;
    const movingDown = vy > 40;

    return inXRange && nearRim && movingDown;
  }

  // ─── Score effects ─────────────────────────────────────────────────────────

  scoreEffect() {
    this.scored = true;
    this.draw();
    this.label.setAlpha(0.15);

    if (this.isGem) {
      this._gemScoreEffect();
    } else {
      this._normalScoreEffect();
    }
  }

  _normalScoreEffect() {
    // Popup text in the cup's own colour
    const cssColor = this._css(this.color);
    const popup = this.scene.add.text(this.x, this.y - 20, `+${this.points}`, {
      fontSize: '38px', fontFamily: 'Arial', fontStyle: 'bold',
      color: cssColor, stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5).setDepth(30).setScale(0.5);

    this.scene.tweens.add({
      targets: popup,
      scaleX: 1.1, scaleY: 1.1,
      duration: 160, ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: popup,
          y: this.y - 140, alpha: 0,
          duration: 900, ease: 'Power2.easeIn',
          onComplete: () => popup.destroy()
        });
      }
    });

    // Particle burst
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist  = Phaser.Math.Between(45, 90);
      const size  = Phaser.Math.FloatBetween(4, 7);
      const dot   = this.scene.add.circle(this.x, this.y, size, this.color).setDepth(20);
      this.scene.tweens.add({
        targets: dot,
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist,
        alpha: 0, scaleX: 0, scaleY: 0,
        duration: Phaser.Math.Between(400, 750),
        ease: 'Power2Out',
        onComplete: () => dot.destroy()
      });
    }
  }

  _gemScoreEffect() {
    if (this.gemIcon) {
      this.scene.tweens.add({
        targets: this.gemIcon,
        y: this.y - 140, scaleX: 2.8, scaleY: 2.8, alpha: 0,
        duration: 1200, ease: 'Power2Out',
        onComplete: () => {
          if (this.gemIcon) { this.gemIcon.destroy(); this.gemIcon = null; }
        }
      });
    }

    const popup = this.scene.add.text(this.x, this.y - 20, '+1 \uD83D\uDC8E', {
      fontSize: '38px', fontFamily: '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",Arial',
      fontStyle: 'bold', color: '#ee88ff', stroke: '#330033', strokeThickness: 5
    }).setOrigin(0.5).setDepth(35).setScale(0.5);

    this.scene.tweens.add({
      targets: popup, scaleX: 1.1, scaleY: 1.1,
      duration: 160, ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: popup,
          y: this.y - 160, alpha: 0, scaleX: 1.7, scaleY: 1.7,
          duration: 1200, ease: 'Power2',
          onComplete: () => popup.destroy()
        });
      }
    });

    // Purple star burst
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const dist  = Phaser.Math.Between(55, 105);
      const dot   = this.scene.add.circle(this.x, this.y, Phaser.Math.Between(5, 8), 0xcc44ff).setDepth(25);
      this.scene.tweens.add({
        targets: dot,
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist,
        alpha: 0, scaleX: 0, scaleY: 0,
        duration: Phaser.Math.Between(500, 950),
        ease: 'Power2Out',
        onComplete: () => dot.destroy()
      });
    }
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  reset() {
    this.scored = false;
    this.x = this.originX;
    this.y = this.originY;
    this.shadowGfx.alpha = 1;
    this.draw();
    this.label.setAlpha(1);
    this.label.setPosition(this.x, this.y - this.cupH / 2 - 16);
  }

  destroy() {
    this.shadowGfx.destroy();
    this.gfx.destroy();
    this.label.destroy();
    if (this.gemIcon) this.gemIcon.destroy();
  }
}
