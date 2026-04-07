const BALL_RADIUS  = 15;
const TRAIL_LENGTH = 22;
const BALL_GRAVITY = 620; // px/s² — must match Bow.js

export class Ball {
  constructor(scene, x, y) {
    this.scene  = scene;
    this.radius = BALL_RADIUS;
    this.active = false;
    this.trail  = [];

    // Trail drawn beneath the ball
    this.trailGfx = scene.add.graphics().setDepth(5);

    // Outer glow ring
    this.glow = scene.add.circle(x, y, BALL_RADIUS + 7, 0x5577ff, 0.2)
      .setDepth(9);

    // Ball body
    this.sprite = scene.add.circle(x, y, BALL_RADIUS, 0xffffff).setDepth(10);

    // Specular highlight dot (top-left of ball for 3D feel)
    this.highlight = scene.add.circle(x - 5, y - 5, 4, 0xffffff, 0.55)
      .setDepth(11);

    // Add arcade physics to the sprite
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body;
    this.body.setCircle(BALL_RADIUS, 0, 0);
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(0.65, 0.65);
    this.body.setMaxVelocity(1500, 2000);
    this.body.setAllowGravity(false);
  }

  launch(vx, vy) {
    this.active = true;
    this.trail  = [];
    this.body.setAllowGravity(true);
    this.body.setGravityY(BALL_GRAVITY);
    this.body.setVelocity(vx, vy);
  }

  update() {
    if (!this.active) return;

    const x = this.sprite.x;
    const y = this.sprite.y;

    this.glow.setPosition(x, y);
    this.highlight.setPosition(x - 5, y - 5);

    // Record trail
    this.trail.push({ x, y });
    if (this.trail.length > TRAIL_LENGTH) this.trail.shift();

    // Render fading trail
    this.trailGfx.clear();
    for (let i = 0; i < this.trail.length; i++) {
      const progress = (i + 1) / this.trail.length;
      const alpha    = progress * 0.55;
      const radius   = progress * BALL_RADIUS * 0.7;
      // Colour shifts blue→purple along trail
      const col = i < this.trail.length / 2 ? 0x4466ff : 0x7744cc;
      this.trailGfx.fillStyle(col, alpha);
      this.trailGfx.fillCircle(this.trail[i].x, this.trail[i].y, radius);
    }
  }

  reset(x, y) {
    this.active = false;
    this.trail  = [];
    this.trailGfx.clear();

    this.sprite.setPosition(x, y);
    this.glow.setPosition(x, y);
    this.highlight.setPosition(x - 5, y - 5);

    this.body.setAllowGravity(false);
    this.body.setGravityY(0);
    this.body.setVelocity(0, 0);
    this.body.setAcceleration(0, 0);
  }

  isOutOfBounds(maxY) {
    return this.sprite.y > maxY + 60;
  }

  getX()         { return this.sprite.x; }
  getY()         { return this.sprite.y; }
  getVelocityY() { return this.body.velocity.y; }

  destroy() {
    this.trailGfx.destroy();
    this.glow.destroy();
    this.highlight.destroy();
    this.sprite.destroy();
  }
}
