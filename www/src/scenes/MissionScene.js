import { EconomyManager } from '../managers/EconomyManager.js';
import { MissionManager  } from '../managers/MissionManager.js';

// ─── MissionScene ─────────────────────────────────────────────────────────────
// Overlay scene showing daily missions. GameScene is put to sleep while open.

export class MissionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MissionScene' });
  }

  create() {
    this.economy  = new EconomyManager();
    this.missions = new MissionManager();
    this._items   = [];

    const W = this.scale.width;
    const H = this.scale.height;
    this._cx = W / 2;
    this._cy = H / 2;
    this._PW = 350;
    this._PH = 560;

    // Dim backdrop
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.72)
      .setDepth(200).setInteractive();
    dim.on('pointerdown', () => this._close());

    // Panel
    const panelBg = this.add.rectangle(this._cx, this._cy, this._PW, this._PH, 0x080820, 0.98)
      .setDepth(201).setStrokeStyle(2, 0x2244aa);
    panelBg.setInteractive(); // block clicks

    // Title
    this.add.text(this._cx, this._cy - this._PH / 2 + 26, 'G\u00DCNl\u00DCK G\u00D6REVLER', {
      fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#e0e8ff', stroke: '#000033', strokeThickness: 3
    }).setOrigin(0.5).setDepth(202);

    // Date
    const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    this.add.text(this._cx, this._cy - this._PH / 2 + 52, today, {
      fontSize: '12px', fontFamily: 'Arial', color: '#445566'
    }).setOrigin(0.5).setDepth(202);

    // Close button
    const closeBtn = this.add.text(
      this._cx + this._PW / 2 - 22, this._cy - this._PH / 2 + 22, '\u2715', {
        fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold', color: '#778899'
      }
    ).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerover', () => closeBtn.setStyle({ color: '#ffffff' }));
    closeBtn.on('pointerout',  () => closeBtn.setStyle({ color: '#778899' }));
    closeBtn.on('pointerdown', () => this._close());

    this._buildMissions();
  }

  _buildMissions() {
    const all = this.missions.getAll();
    let y = this._cy - this._PH / 2 + 88;

    all.forEach(m => {
      this._buildMissionRow(m, y);
      y += 86;
    });
  }

  _buildMissionRow(m, y) {
    const cx = this._cx;
    const RW = 322, RH = 76;

    // Row background
    const rowColor = m.claimed ? 0x0a1e0a : m.completed ? 0x0d1d0d : 0x0c1028;
    const bordColor = m.claimed ? 0x226622 : m.completed ? 0x33aa33 : 0x1e2f66;
    this._add(
      this.add.rectangle(cx, y + RH / 2, RW, RH, rowColor)
        .setDepth(202).setStrokeStyle(m.completed ? 2 : 1, bordColor)
    );

    // Icon + label
    this._add(this.add.text(cx - RW / 2 + 12, y + 14, m.icon, {
      fontSize: '20px',
      fontFamily: '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",Arial'
    }).setOrigin(0, 0).setDepth(203));

    this._add(this.add.text(cx - RW / 2 + 40, y + 14, m.label, {
      fontSize: '15px', fontFamily: 'Arial', fontStyle: 'bold',
      color: m.claimed ? '#44aa44' : '#ccd4f0'
    }).setOrigin(0, 0).setDepth(203));

    // Progress bar
    const barW = RW - 100, barH = 8;
    const barX = cx - RW / 2 + 40;
    const barY = y + 40;

    this._add(this.add.rectangle(barX + barW / 2, barY, barW, barH, 0x111122)
      .setDepth(203));

    const prog = m.target > 0 ? Math.min(m.progress / m.target, 1) : 1;
    if (prog > 0) {
      const fillColor = m.claimed ? 0x33aa33 : m.completed ? 0x44dd44 : 0x2255cc;
      this._add(
        this.add.rectangle(barX + (barW * prog) / 2, barY, barW * prog, barH, fillColor)
          .setDepth(203)
      );
    }

    // Progress text
    const progLabel = m.claimed
      ? '\u2713 Tamamlandı'
      : `${m.progress} / ${m.target}`;
    this._add(this.add.text(cx - RW / 2 + 40, y + 52, progLabel, {
      fontSize: '11px', fontFamily: 'Arial',
      color: m.claimed ? '#44aa44' : m.completed ? '#88ff88' : '#556677'
    }).setOrigin(0, 0).setDepth(203));

    // Reward label
    const rew = m.reward;
    const rewStr = rew.type === 'coin'  ? `+${rew.amount} \uD83E\uDE99`
                 : rew.type === 'gem'   ? `+${rew.amount} \u25C6`
                 : rew.type === 'balls' ? `+${rew.amount} top`
                 : '';
    const rewColor = rew.type === 'coin' ? '#ffcc44' : rew.type === 'gem' ? '#cc88ff' : '#88bbff';

    // Claim / reward button (right side)
    const btnW = 74, btnH = 50;
    const bx   = cx + RW / 2 - btnW / 2 - 4;
    const by   = y + RH / 2;

    if (m.claimed) {
      // Already claimed — just show reward text greyed out
      this._add(this.add.text(bx, by, rewStr, {
        fontSize: '13px', fontFamily: 'Arial', color: '#334444'
      }).setOrigin(0.5).setDepth(203));
    } else if (m.completed) {
      // Claimable
      const btnBg  = this._add(
        this.add.rectangle(bx, by, btnW, btnH, 0x114400)
          .setDepth(203).setStrokeStyle(2, 0x44cc44).setInteractive({ useHandCursor: true })
      );
      const btnTop = this._add(this.add.text(bx, by - 10, 'AL!', {
        fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold', color: '#44ff88'
      }).setOrigin(0.5).setDepth(204));
      const btnRew = this._add(this.add.text(bx, by + 10, rewStr, {
        fontSize: '12px', fontFamily: 'Arial', fontStyle: 'bold', color: rewColor
      }).setOrigin(0.5).setDepth(204));

      const onClaim = () => {
        const reward = this.missions.claim(m.id);
        if (!reward) return;
        this._applyReward(reward, bx, by);
        // Rebuild after a short delay so the animation plays first
        this.time.delayedCall(800, () => {
          this._clearItems();
          this._buildMissions();
        });
      };

      btnBg.on('pointerover',  () => btnBg.setFillStyle(0x225500));
      btnBg.on('pointerout',   () => btnBg.setFillStyle(0x114400));
      [btnBg, btnTop, btnRew].forEach(o => o.on('pointerdown', onClaim));
    } else {
      // Not yet complete — show reward label grayed
      this._add(this.add.rectangle(bx, by, btnW, btnH, 0x0c1028)
        .setDepth(202).setStrokeStyle(1, 0x1e2f66));
      this._add(this.add.text(bx, by, rewStr, {
        fontSize: '13px', fontFamily: 'Arial', color: '#445566'
      }).setOrigin(0.5).setDepth(203));
    }
  }

  _applyReward(reward, bx, by) {
    // Apply to localStorage
    if (reward.type === 'coin')  this.economy.addCoins(reward.amount);
    if (reward.type === 'gem')   this.economy.addGems(reward.amount);
    if (reward.type === 'balls') this.economy.setBalls(this.economy.getBalls() + reward.amount);

    // Sync registry so UIScene refreshes immediately
    this.registry.set('coins', this.economy.getCoins());
    this.registry.set('gems',  this.economy.getGems());
    this.registry.set('balls', this.economy.getBalls());

    // Reward burst animation
    const rewStr = reward.type === 'coin'  ? `+${reward.amount} \uD83E\uDE99`
                 : reward.type === 'gem'   ? `+${reward.amount} \u25C6`
                 : `+${reward.amount} top`;
    const col    = reward.type === 'coin' ? '#ffcc44' : reward.type === 'gem' ? '#cc88ff' : '#88bbff';

    const pop = this.add.text(bx, by, rewStr, {
      fontSize: '22px', fontFamily: 'Arial', fontStyle: 'bold',
      color: col, stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(220);

    this.tweens.add({
      targets: pop, y: by - 80, alpha: 0, scaleX: 1.5, scaleY: 1.5,
      duration: 1000, ease: 'Power2.easeOut',
      onComplete: () => pop.destroy()
    });
  }

  _add(obj) { this._items.push(obj); return obj; }

  _clearItems() {
    this._items.forEach(o => o.destroy());
    this._items = [];
  }

  _close() {
    this.scene.stop('MissionScene');
    this.scene.wake('GameScene');
  }
}
