export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // ── İnşa görselleri ──────────────────────────────────────────────────────
    console.log('[Boot] build assets yükleniyor');
    ['kafe', 'bahce', 'salon', 'sahne', 'atolye'].forEach(alan => {
      for (let i = 0; i < 4; i++) {
        const key  = `build_${alan}_${i}`;
        const path = `./assets/build/${alan}_${i}.png`;
        this.load.image(key, path);
        console.log('[Boot] yükleniyor:', key, path);
      }
    });

    this.load.on('filecomplete', (key) => {
      if (key.startsWith('build_')) console.log('[Boot] yüklendi:', key);
    });
    this.load.on('loaderror', (file) => {
      if (file.key.startsWith('build_')) console.error('[Boot] HATA:', file.key, file.url);
    });

    // Read all localStorage keys in one pass and cache globally.
    // Managers check window.CupBounceCache first → zero redundant reads.
    const KEYS = [
      'cupbounce_user',
      'cupbounce_economy',
      'cupbounce_boosters',
      'cupbounce_missions',
      'cupbounce_mission_progress',
      'cupbounce_tutorial_done',
      'cupbounce_scores',
      'cupbounce_player_level',
      'cupbounce_sound',
      'cupbounce_ad_watches',
      'cupbounce_last_play',
      'cupbounce_build',
    ];
    const cache = {};
    for (const key of KEYS) {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        try { cache[key] = JSON.parse(raw); }
        catch { cache[key] = raw; }
      }
    }
    window.CupBounceCache = cache;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    this.add.rectangle(W / 2, H / 2, W, H, 0x07071a);

    // Animated twinkling stars
    for (let i = 0; i < 100; i++) {
      const sx    = Phaser.Math.Between(0, W);
      const sy    = Phaser.Math.Between(0, H);
      const sz    = Phaser.Math.FloatBetween(0.6, 2.2);
      const baseA = Phaser.Math.FloatBetween(0.25, 0.85);
      const star  = this.add.circle(sx, sy, sz, 0xffffff, baseA);
      this.tweens.add({
        targets:  star,
        alpha:    baseA * Phaser.Math.FloatBetween(0.08, 0.3),
        duration: Phaser.Math.Between(700, 2800),
        yoyo:     true, repeat: -1,
        delay:    Phaser.Math.Between(0, 2000),
        ease:     'Sine.easeInOut'
      });
    }

    // Glow backdrop for logo
    const glowR = this.add.rectangle(W / 2, H / 2 - 30, 280, 140, 0x112299, 0.22);
    this.tweens.add({
      targets: glowR, alpha: 0.08,
      duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // "CUP" title
    const cup = this.add.text(W / 2, H / 2 - 70, 'CUP', {
      fontSize: '78px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffffff', stroke: '#1133ee', strokeThickness: 9
    }).setOrigin(0.5).setAlpha(0);

    // "BOUNCE" subtitle
    const bounce = this.add.text(W / 2, H / 2 + 14, 'BOUNCE', {
      fontSize: '54px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#4d8fff', stroke: '#000033', strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);

    // Fade in logo
    this.tweens.add({ targets: cup,    alpha: 1, duration: 600, ease: 'Power2' });
    this.tweens.add({ targets: bounce, alpha: 1, duration: 600, delay: 200, ease: 'Power2' });

    // Decorative line under logo
    const line = this.add.graphics().setAlpha(0);
    line.lineStyle(2, 0x3355ff, 0.7)
      .beginPath().moveTo(W/2 - 90, H/2 + 60).lineTo(W/2 + 90, H/2 + 60).strokePath();
    this.tweens.add({ targets: line, alpha: 1, duration: 500, delay: 500, ease: 'Power2' });

    // Pulsing "Tap to Play"
    const sub = this.add.text(W / 2, H / 2 + 100, 'Oynamak için dokun', {
      fontSize: '20px', fontFamily: 'Arial',
      color: '#8899ee', stroke: '#000020', strokeThickness: 2
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: sub, alpha: 1, duration: 400, delay: 700, ease: 'Power2',
      onComplete: () => {
        this.tweens.add({
          targets: sub, alpha: 0.2,
          duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
      }
    });

    // Version label
    this.add.text(W / 2, H - 40, 'v1.0', {
      fontSize: '12px', fontFamily: 'Arial', color: '#222244'
    }).setOrigin(0.5);

    // Advance — check auth state
    const _go = () => {
      const user = localStorage.getItem('cupbounce_user');
      this.scene.start(user ? 'GameScene' : 'AuthScene');
    };
    this.time.delayedCall(1500, _go);
    this.input.once('pointerdown', _go);
  }
}
