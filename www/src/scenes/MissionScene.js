import { EconomyManager } from '../managers/EconomyManager.js';
import { MissionManager  } from '../managers/MissionManager.js';

// ─── MissionScene ─────────────────────────────────────────────────────────────
// 8 günlük görevi 3-kolon kart listesiyle gösterir:
//   SOL  — ikon + etiket + progress bar
//   ORTA — "X/Y" progress metni
//   SAĞ  — ödül kutusu veya yeşil "AL!" butonu
//
// İçerik (8 × 74px = 592px) görüntü alanını (468px) aştığından
// maskelenmiş scroll container kullanılır.
// ─────────────────────────────────────────────────────────────────────────────

export class MissionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MissionScene' });
  }

  create() {
    this.economy  = new EconomyManager();
    this.missions = new MissionManager();

    const W = this.scale.width;   // 390
    const H = this.scale.height;  // 844

    this._cx   = W / 2;   // 195
    this._cy   = H / 2;   // 422
    this._PW   = 350;
    this._PH   = 560;
    this._RW   = 322;
    this._RH   = 70;
    this._STEP = this._RH + 4;  // 74 px per card (4 px gap)

    // ── Layout measurements ─────────────────────────────────────────────────
    const panelTopY      = this._cy - this._PH / 2;          // 142  world-y
    const HEADER_H       = 76;
    this._baseY          = panelTopY + HEADER_H;              // 218  content start (world)
    this._visibleH       = this._PH - HEADER_H - 16;         // 468  px visible
    this._totalContentH  = this._STEP * 8;                    // 592  px content
    this._maxScroll      = Math.max(0, this._totalContentH - this._visibleH); // 124

    // ── Dim backdrop ────────────────────────────────────────────────────────
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.72)
      .setDepth(200).setInteractive();
    dim.on('pointerdown', () => this._close());

    // ── Panel ───────────────────────────────────────────────────────────────
    this.add.rectangle(this._cx, this._cy, this._PW, this._PH, 0x080820, 0.98)
      .setDepth(201).setStrokeStyle(2, 0x2244aa).setInteractive();

    // ── Title ───────────────────────────────────────────────────────────────
    this.add.text(this._cx, panelTopY + 28, 'GÜNLÜK GÖREVLER', {
      fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#e0e8ff', stroke: '#000033', strokeThickness: 3
    }).setOrigin(0.5).setDepth(202);

    const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    this.add.text(this._cx, panelTopY + 52, today, {
      fontSize: '12px', fontFamily: 'Arial', color: '#445566'
    }).setOrigin(0.5).setDepth(202);

    // Separator
    this.add.rectangle(this._cx, panelTopY + 68, this._PW - 20, 1, 0x1a2a66)
      .setDepth(202);

    // ── Close button ────────────────────────────────────────────────────────
    const closeBtn = this.add.text(
      this._cx + this._PW / 2 - 22, panelTopY + 22, '✕', {
        fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold', color: '#778899'
      }
    ).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerover', () => closeBtn.setStyle({ color: '#ffffff' }));
    closeBtn.on('pointerout',  () => closeBtn.setStyle({ color: '#778899' }));
    closeBtn.on('pointerdown', () => this._close());

    // ── Scroll mask (clips container to panel content area) ─────────────────
    const maskGfx = this.add.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(
      this._cx - this._PW / 2,
      this._baseY,
      this._PW,
      this._visibleH
    );
    this._mask = maskGfx.createGeometryMask();
    maskGfx.setVisible(false);  // shape only — don't render visually

    // ── Scroll container ────────────────────────────────────────────────────
    this._container = this.add.container(this._cx, this._baseY)
      .setDepth(202)
      .setMask(this._mask);

    this._buildCards();
    this._setupScroll();
  }

  // ── Card list ─────────────────────────────────────────────────────────────

  _buildCards() {
    this._container.removeAll(true);
    this.missions.getAll().forEach((m, i) => this._buildCard(m, i));
  }

  _buildCard(m, i) {
    // Helper: creates obj and adds it to the scroll container
    const reg = (o) => { this._container.add(o); return o; };

    const RW   = this._RW;
    const RH   = this._RH;
    const cy   = i * this._STEP + RH / 2;  // card center y (container-relative)
    const top  = cy - RH / 2;              // card top y  (container-relative)
    const L    = -RW / 2;                  // left  edge  (container-relative)
    const R    = RW / 2;                   // right edge

    // ── Card background ─────────────────────────────────────────────────────
    const bgColor  = m.claimed   ? 0x071a07 : m.completed ? 0x0a1e0d : 0x0b0f22;
    const bordCol  = m.claimed   ? 0x225522 : m.completed ? 0x33aa44 : 0x1e2860;
    const bordW    = (m.completed && !m.claimed) ? 2 : 1;

    reg(this.add.rectangle(0, cy, RW, RH, bgColor)
      .setOrigin(0.5).setDepth(203).setStrokeStyle(bordW, bordCol));

    // ── SOL: ikon ──────────────────────────────────────────────────────────
    reg(this.add.text(L + 10, top + 10, m.icon, {
      fontSize: '20px',
      fontFamily: '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",Arial'
    }).setOrigin(0, 0).setDepth(204));

    // ── SOL: etiket ────────────────────────────────────────────────────────
    const labelCol = m.claimed ? '#449944' : '#ccd4f0';
    reg(this.add.text(L + 38, top + 10, m.label, {
      fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', color: labelCol
    }).setOrigin(0, 0).setDepth(204));

    // ── SOL: progress bar (bar spans label zone) ────────────────────────────
    const barL = L + 38;
    const barW = 138;
    const barY = top + 48;
    const barH = 5;

    reg(this.add.rectangle(barL + barW / 2, barY, barW, barH, 0x101120)
      .setOrigin(0.5).setDepth(203));

    const pct = m.target > 0 ? Math.min(m.progress / m.target, 1) : 1;
    if (pct > 0) {
      const fillCol = m.claimed ? 0x33aa33 : m.completed ? 0x44dd44 : 0x2255cc;
      reg(this.add.rectangle(barL + (barW * pct) / 2, barY, barW * pct, barH, fillCol)
        .setOrigin(0.5).setDepth(204));
    }

    // ── ORTA: progress metni "X/Y" ─────────────────────────────────────────
    // Middle zone: roughly x=+20..+80 — centre at +38
    const fracTxt   = m.claimed ? '✔' : `${m.progress}/${m.target}`;
    const fracColor = m.claimed ? '#33aa33' : m.completed ? '#88ff88' : '#4d6688';
    const fracSize  = m.claimed ? '17px' : '13px';

    reg(this.add.text(38, cy - 4, fracTxt, {
      fontSize: fracSize, fontFamily: 'Arial', fontStyle: 'bold', color: fracColor
    }).setOrigin(0.5).setDepth(204));

    // ── SAĞ: ödül kutusu veya "AL!" butonu ────────────────────────────────
    // Right zone: x = +80..+161 — box centre at +119
    const bx       = R - 42;   // +119
    const boxW     = 76;
    const boxH     = RH - 10;  // 60

    const rewIcon  = m.reward.type === 'coin'  ? '🪙'
                   : m.reward.type === 'gem'   ? '💎' : '⚽';
    const rewAmt   = `+${m.reward.amount}`;
    const rewColor = m.reward.type === 'coin'  ? '#ffcc44'
                   : m.reward.type === 'gem'   ? '#cc88ff' : '#88bbff';

    if (m.claimed) {
      // ── Zaten alındı: gri kutu ──────────────────────────────────────────
      reg(this.add.rectangle(bx, cy, boxW, boxH, 0x090d1a)
        .setOrigin(0.5).setDepth(202).setStrokeStyle(1, 0x151d33));
      reg(this.add.text(bx, cy - 9, rewIcon, {
        fontSize: '15px',
        fontFamily: '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",Arial'
      }).setOrigin(0.5).setDepth(203));
      reg(this.add.text(bx, cy + 9, rewAmt, {
        fontSize: '11px', fontFamily: 'Arial', color: '#2a3d44'
      }).setOrigin(0.5).setDepth(203));

    } else if (m.completed) {
      // ── Talep edilebilir: yeşil "AL!" butonu ────────────────────────────
      const btnBg = reg(this.add.rectangle(bx, cy, boxW, boxH, 0x0f5520)
        .setOrigin(0.5).setDepth(203)
        .setStrokeStyle(2, 0x33cc66)
        .setInteractive({ useHandCursor: true }));

      const icoTxt = reg(this.add.text(bx, cy - 18, rewIcon, {
        fontSize: '16px',
        fontFamily: '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",Arial'
      }).setOrigin(0.5).setDepth(204).setInteractive({ useHandCursor: true }));

      const amtTxt = reg(this.add.text(bx, cy - 1, rewAmt, {
        fontSize: '11px', fontFamily: 'Arial', fontStyle: 'bold', color: rewColor
      }).setOrigin(0.5).setDepth(204).setInteractive({ useHandCursor: true }));

      const lblTxt = reg(this.add.text(bx, cy + 16, 'AL!', {
        fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', color: '#66ffaa'
      }).setOrigin(0.5).setDepth(204).setInteractive({ useHandCursor: true }));

      btnBg.on('pointerover',  () => btnBg.setFillStyle(0x187733));
      btnBg.on('pointerout',   () => btnBg.setFillStyle(0x0f5520));

      const onClaim = () => {
        const reward = this.missions.claim(m.id);
        if (!reward) return;
        // World coordinates of the button for burst animation
        const worldX = this._cx + bx;
        const worldY = this._container.y + cy;
        this._applyReward(reward, worldX, worldY);
        this.time.delayedCall(800, () => this._buildCards());
      };
      [btnBg, icoTxt, amtTxt, lblTxt].forEach(o => o.on('pointerdown', onClaim));

    } else {
      // ── Henüz tamamlanmadı: pasif kutu ─────────────────────────────────
      reg(this.add.rectangle(bx, cy, boxW, boxH, 0x0b0f22)
        .setOrigin(0.5).setDepth(202).setStrokeStyle(1, 0x1a2255));
      reg(this.add.text(bx, cy - 9, rewIcon, {
        fontSize: '15px',
        fontFamily: '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",Arial'
      }).setOrigin(0.5).setDepth(203));
      reg(this.add.text(bx, cy + 9, rewAmt, {
        fontSize: '11px', fontFamily: 'Arial', color: '#3d4e66'
      }).setOrigin(0.5).setDepth(203));
    }
  }

  // ── Scroll ────────────────────────────────────────────────────────────────

  _setupScroll() {
    let dragging  = false;
    let startPtrY = 0;
    let startConY = 0;

    const panelL  = this._cx - this._PW / 2;
    const panelR  = this._cx + this._PW / 2;
    const panelT  = this._baseY;
    const panelB  = this._baseY + this._visibleH;
    const baseY   = this._baseY;
    const minY    = baseY - this._maxScroll;

    const inPanel = (ptr) =>
      ptr.x >= panelL && ptr.x <= panelR &&
      ptr.y >= panelT && ptr.y <= panelB;

    this._pDown = (ptr) => {
      if (!inPanel(ptr)) return;
      dragging  = true;
      startPtrY = ptr.y;
      startConY = this._container.y;
    };
    this._pMove = (ptr) => {
      if (!dragging || this._maxScroll === 0) return;
      this._container.y = Phaser.Math.Clamp(
        startConY + (ptr.y - startPtrY), minY, baseY
      );
    };
    this._pUp = () => { dragging = false; };

    this.input.on('pointerdown', this._pDown);
    this.input.on('pointermove', this._pMove);
    this.input.on('pointerup',   this._pUp);
  }

  // ── Ödül uygula ──────────────────────────────────────────────────────────

  _applyReward(reward, worldX, worldY) {
    if (reward.type === 'coin')  this.economy.addCoins(reward.amount);
    if (reward.type === 'gem')   this.economy.addGems(reward.amount);
    if (reward.type === 'balls') {
      this.economy.setBalls(
        Math.min(this.economy.getBalls() + reward.amount, this.economy.getMaxBalls())
      );
    }
    this.registry.set('coins', this.economy.getCoins());
    this.registry.set('gems',  this.economy.getGems());
    this.registry.set('balls', this.economy.getBalls());

    const icon = reward.type === 'coin'  ? '🪙'
               : reward.type === 'gem'   ? '💎' : '⚽';
    const col  = reward.type === 'coin'  ? '#ffcc44'
               : reward.type === 'gem'   ? '#cc88ff' : '#88bbff';

    const pop = this.add.text(worldX, worldY, `+${reward.amount} ${icon}`, {
      fontSize: '22px', fontFamily: 'Arial', fontStyle: 'bold',
      color: col, stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(220);

    this.tweens.add({
      targets: pop, y: worldY - 70, alpha: 0, scale: 1.4,
      duration: 900, ease: 'Power2.easeOut',
      onComplete: () => { if (pop && pop.active) pop.destroy(); }
    });
  }

  // ── Kapat ─────────────────────────────────────────────────────────────────

  _close() {
    this.scene.stop('MissionScene');
    this.scene.wake('GameScene');
  }

  shutdown() {
    if (this._pDown) this.input.off('pointerdown', this._pDown);
    if (this._pMove) this.input.off('pointermove', this._pMove);
    if (this._pUp)   this.input.off('pointerup',   this._pUp);
    try { if (this._mask) this._mask.destroy(); } catch {}
  }
}
