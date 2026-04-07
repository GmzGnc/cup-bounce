import { LeaderboardManager } from '../managers/LeaderboardManager.js';

// ─── Layout constants ─────────────────────────────────────────────────────────
const PANEL_W  = 362;
const PANEL_H  = 640;
const ROW_H    = 46;
const ROW_GAP  = 2;
const LIST_TOP = 192;   // y of first row (relative to scene, not panel)

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
  bg:         0x07071e,
  panel:      0x08082a,
  border:     0x2244aa,
  rowDark:    0x0c0c28,
  rowLight:   0x0f1030,
  gold:       0xffd700,
  goldDark:   0xb8860b,
  silver:     0xc0c0c0,
  bronze:     0xcd7f32,
  meRow:      0x1a1400,
  meBorder:   0xffcc00,
  tabActive:  0x142060,
  tabIdle:    0x0d1035,
  text:       0xccd4f0,
  subtext:    0x55667a,
  accent:     0x4477ff,
};

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = [C.gold, C.silver, C.bronze];

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  create() {
    this.lb   = new LeaderboardManager();
    this._tab = 'global';
    this._rowObjs = [];   // animated row objects for current tab

    const W = this.scale.width;
    const H = this.scale.height;
    this._cx = W / 2;
    this._cy = H / 2;

    // ── Dim backdrop ──────────────────────────────────────────────────────────
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.80)
      .setDepth(200).setInteractive();

    // ── Panel ─────────────────────────────────────────────────────────────────
    this.add.rectangle(this._cx, this._cy, PANEL_W, PANEL_H, C.panel, 0.98)
      .setDepth(201).setStrokeStyle(2, C.border);
    // Inner glow line
    this.add.rectangle(this._cx, this._cy, PANEL_W - 6, PANEL_H - 6, 0, 0)
      .setDepth(201).setStrokeStyle(1, C.accent, 0.25);

    // ── Header ────────────────────────────────────────────────────────────────
    const headerY = this._cy - PANEL_H / 2 + 36;

    // Trophy icon
    this.add.text(this._cx - 78, headerY, '🏆', {
      fontSize: '28px', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(202);

    this.add.text(this._cx + 14, headerY - 10, 'SKOR TABLOSU', {
      fontSize: '18px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffd700', stroke: '#000033', strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(202);

    this.add.text(this._cx + 14, headerY + 14, 'En iyi oyuncular', {
      fontSize: '11px', fontFamily: 'Arial', color: '#334477',
    }).setOrigin(0.5, 0).setDepth(202);

    // Close button (top-left of panel)
    const closeX   = this._cx - PANEL_W / 2 + 28;
    const closeBtn = this.add.text(closeX, headerY, '←', {
      fontSize: '22px', fontFamily: 'Arial', fontStyle: 'bold', color: '#445566',
    }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerover', () => closeBtn.setStyle({ color: '#7799cc' }));
    closeBtn.on('pointerout',  () => closeBtn.setStyle({ color: '#445566' }));
    closeBtn.on('pointerdown', () => this._close());

    // Separator under header
    const sep = this.add.graphics().setDepth(202);
    sep.lineStyle(1, C.border, 0.5)
      .beginPath()
      .moveTo(this._cx - PANEL_W / 2 + 14, headerY + 34)
      .lineTo(this._cx + PANEL_W / 2 - 14, headerY + 34)
      .strokePath();

    // ── Tabs ──────────────────────────────────────────────────────────────────
    this._buildTabs(headerY + 50);

    // ── Column headers ────────────────────────────────────────────────────────
    const colY = LIST_TOP - 16;
    const hdr  = { fontSize: '9px', fontFamily: 'Arial', color: '#334466', letterSpacing: 1 };
    this.add.text(this._cx - PANEL_W / 2 + 18, colY, '#',      hdr).setOrigin(0, 0.5).setDepth(202);
    this.add.text(this._cx - PANEL_W / 2 + 46, colY, 'OYUNCU', hdr).setOrigin(0, 0.5).setDepth(202);
    this.add.text(this._cx + PANEL_W / 2 - 90, colY, 'SKOR',   hdr).setOrigin(0, 0.5).setDepth(202);
    this.add.text(this._cx + PANEL_W / 2 - 30, colY, 'LVL',    hdr).setOrigin(0, 0.5).setDepth(202);

    // ── Initial tab content ───────────────────────────────────────────────────
    this._loadTab('global');
  }

  // ── Tabs ─────────────────────────────────────────────────────────────────────

  _buildTabs(y) {
    const tabs    = [
      { key: 'global',  label: 'GENEL'     },
      { key: 'weekly',  label: 'HAFTALIK'  },
      { key: 'friends', label: 'ARKADAŞLAR' },
    ];
    const tabW = 106;
    const tabH = 28;
    const gap  = 4;
    const startX = this._cx - (tabs.length * tabW + (tabs.length - 1) * gap) / 2 + tabW / 2;

    this._tabBtns = {};
    tabs.forEach((t, i) => {
      const tx  = startX + i * (tabW + gap);
      const bg  = this.add.rectangle(tx, y, tabW, tabH, C.tabIdle)
        .setDepth(202).setStrokeStyle(1, 0x334477).setInteractive({ useHandCursor: true });
      const txt = this.add.text(tx, y, t.label, {
        fontSize: '10px', fontFamily: 'Arial', fontStyle: 'bold', color: '#7788bb',
      }).setOrigin(0.5).setDepth(203).setInteractive({ useHandCursor: true });

      bg .on('pointerdown', () => this._loadTab(t.key));
      txt.on('pointerdown', () => this._loadTab(t.key));
      this._tabBtns[t.key] = { bg, txt };
    });
  }

  _activateTab(key) {
    Object.entries(this._tabBtns).forEach(([k, { bg, txt }]) => {
      if (k === key) {
        bg.setFillStyle(C.tabActive).setStrokeStyle(2, C.accent);
        txt.setStyle({ color: '#ffffff' });
      } else {
        bg.setFillStyle(C.tabIdle).setStrokeStyle(1, 0x334477);
        txt.setStyle({ color: '#7788bb' });
      }
    });
  }

  // ── Tab data & row rendering ──────────────────────────────────────────────────

  _loadTab(key) {
    this._tab = key;
    this._activateTab(key);
    this._clearRows();

    const entries = this.lb.getMockScores(key);
    const top10   = entries.slice(0, 10);
    const meEntry = entries.find(e => e.isMe);
    const meInTop = top10.some(e => e.isMe);

    // Animate rows in with staggered slide
    top10.forEach((entry, i) => {
      this.time.delayedCall(i * 55, () => {
        this._buildRow(entry, i, LIST_TOP + i * (ROW_H + ROW_GAP));
      });
    });

    // Own row pinned at bottom (only if not already in top 10)
    if (!meInTop && meEntry) {
      this._buildOwnRowPinned(meEntry);
    } else if (meInTop) {
      this._buildOwnRowPinned(meEntry, true);  // show pin row even when in list
    }
  }

  _clearRows() {
    this._rowObjs.forEach(o => { try { o.destroy(); } catch {} });
    this._rowObjs = [];
  }

  _reg(o) { this._rowObjs.push(o); return o; }

  // ── Single leaderboard row ────────────────────────────────────────────────────

  _buildRow(entry, index, y) {
    const cx  = this._cx;
    const lx  = cx - PANEL_W / 2 + 8;   // left edge of row
    const rx  = cx + PANEL_W / 2 - 8;   // right edge
    const rowW = PANEL_W - 16;

    const isTop3 = entry.rank <= 3;
    const isMe   = entry.isMe;

    // Row background
    const bgColor = isMe   ? C.meRow
                  : index % 2 === 0 ? C.rowDark : C.rowLight;
    const bgBorder = isMe  ? C.meBorder : (isTop3 ? MEDAL_COLORS[entry.rank - 1] : C.border);
    const bgBW     = isMe  ? 1 : (isTop3 ? 1 : 0);

    const rowBg = this._reg(
      this.add.rectangle(cx, y + ROW_H / 2, rowW, ROW_H - 2, bgColor)
        .setDepth(203)
    );
    if (bgBW > 0) rowBg.setStrokeStyle(bgBW, bgBorder);

    // Slide in from above
    rowBg.setY(y + ROW_H / 2 - 60).setAlpha(0);
    this.tweens.add({ targets: rowBg, y: y + ROW_H / 2, alpha: 1, duration: 280, ease: 'Back.easeOut' });

    // ── Rank badge ────────────────────────────────────────────────────────────
    const rankX = lx + 18;
    if (isTop3) {
      const medal = this._reg(this.add.text(rankX, y + ROW_H / 2, MEDALS[entry.rank - 1], {
        fontSize: '18px', fontFamily: 'Arial',
      }).setOrigin(0.5).setDepth(205));
      this._slideIn(medal, y);
    } else {
      const numColor = isMe ? '#ffdd66' : '#445577';
      const rankTxt  = this._reg(this.add.text(rankX, y + ROW_H / 2, String(entry.rank), {
        fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', color: numColor,
      }).setOrigin(0.5).setDepth(205));
      this._slideIn(rankTxt, y);
    }

    // ── Avatar circle ─────────────────────────────────────────────────────────
    const avX  = lx + 44;
    const avCol = isMe   ? C.gold
                : isTop3 ? MEDAL_COLORS[entry.rank - 1]
                :           0x1a2055;

    const av = this._reg(this.add.circle(avX, y + ROW_H / 2, 13, avCol).setDepth(204));
    this._slideIn(av, y);

    // Avatar letter
    const avLetter = (entry.name || '?')[0].toUpperCase();
    const avTxt    = this._reg(this.add.text(avX, y + ROW_H / 2, avLetter, {
      fontSize: '11px', fontFamily: 'Arial', fontStyle: 'bold',
      color: isMe ? '#1a1000' : '#ccd4f0',
    }).setOrigin(0.5).setDepth(205));
    this._slideIn(avTxt, y);

    // "YOU" tag for own row
    if (isMe) {
      const youTag = this._reg(this.add.text(avX + 17, y + ROW_H / 2 - 9, 'SEN', {
        fontSize: '7px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffcc00',
        backgroundColor: '#1a1000',
      }).setOrigin(0, 0).setDepth(206));
      this._slideIn(youTag, y);
    }

    // ── Player name ───────────────────────────────────────────────────────────
    const nameX   = lx + 64;
    const nameCol = isMe   ? '#ffd700'
                  : isTop3 ? '#' + MEDAL_COLORS[entry.rank - 1].toString(16).padStart(6, '0')
                  :           '#ccd4f0';
    const truncName = entry.name.length > 12 ? entry.name.slice(0, 11) + '…' : entry.name;

    const nameTxt = this._reg(this.add.text(nameX, y + ROW_H / 2, truncName, {
      fontSize: '14px', fontFamily: 'Arial', fontStyle: isMe ? 'bold' : 'normal',
      color: nameCol,
    }).setOrigin(0, 0.5).setDepth(205));
    this._slideIn(nameTxt, y);

    // ── Score ─────────────────────────────────────────────────────────────────
    const scoreX   = rx - 54;
    const scoreCol = isMe ? '#ffdd66' : '#99aabb';
    const scoreTxt = this._reg(this.add.text(scoreX, y + ROW_H / 2, this._fmt(entry.score), {
      fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', color: scoreCol,
    }).setOrigin(1, 0.5).setDepth(205));
    this._slideIn(scoreTxt, y);

    // ── Level badge ───────────────────────────────────────────────────────────
    const lvlX  = rx - 6;
    const lvlBg = this._reg(this.add.rectangle(lvlX - 14, y + ROW_H / 2, 32, 18, 0x0d1840)
      .setDepth(204).setStrokeStyle(1, 0x2244aa));
    const lvlTxt = this._reg(this.add.text(lvlX - 14, y + ROW_H / 2, `L${entry.level}`, {
      fontSize: '10px', fontFamily: 'Arial', fontStyle: 'bold', color: '#5588cc',
    }).setOrigin(0.5).setDepth(205));
    this._slideIn(lvlBg, y);
    this._slideIn(lvlTxt, y);
  }

  // ── Pinned "own score" row at bottom of panel ─────────────────────────────────

  _buildOwnRowPinned(entry, alreadyInList = false) {
    const cx  = this._cx;
    const panBottom = this._cy + PANEL_H / 2;
    const y   = panBottom - 52;
    const lx  = cx - PANEL_W / 2 + 8;
    const rx  = cx + PANEL_W / 2 - 8;
    const rowW = PANEL_W - 16;

    // Separator above pinned row
    const divG = this._reg(this.add.graphics().setDepth(204));
    divG.lineStyle(1, C.meBorder, 0.3)
      .beginPath()
      .moveTo(cx - PANEL_W / 2 + 12, y - 6)
      .lineTo(cx + PANEL_W / 2 - 12, y - 6)
      .strokePath();

    // "Sıran" label
    const rankText = alreadyInList
      ? `🏅 Sıran: #${entry.rank}`
      : `📍 Sıran: #${entry.rank} (ilk 10 dışında)`;

    this._reg(this.add.text(cx, y - ROW_H / 2 + 4, rankText, {
      fontSize: '10px', fontFamily: 'Arial', color: '#554400',
    }).setOrigin(0.5).setDepth(204));

    // Gold highlight row
    this._reg(
      this.add.rectangle(cx, y + ROW_H / 2 - 2, rowW, ROW_H - 4, C.meRow)
        .setDepth(203).setStrokeStyle(1, C.meBorder)
    );

    // Medal / rank number
    const rank3 = entry.rank <= 3;
    this._reg(this.add.text(lx + 18, y + ROW_H / 2, rank3 ? MEDALS[entry.rank - 1] : String(entry.rank), {
      fontSize: rank3 ? '18px' : '13px', fontFamily: 'Arial',
      fontStyle: 'bold', color: '#ffdd66',
    }).setOrigin(0.5).setDepth(205));

    // Avatar
    this._reg(this.add.circle(lx + 44, y + ROW_H / 2, 13, C.gold).setDepth(204));
    this._reg(this.add.text(lx + 44, y + ROW_H / 2, (entry.name || 'S')[0].toUpperCase(), {
      fontSize: '11px', fontFamily: 'Arial', fontStyle: 'bold', color: '#1a1000',
    }).setOrigin(0.5).setDepth(205));

    // Name
    const truncName = entry.name.length > 12 ? entry.name.slice(0, 11) + '…' : entry.name;
    this._reg(this.add.text(lx + 64, y + ROW_H / 2, truncName, {
      fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffd700',
    }).setOrigin(0, 0.5).setDepth(205));

    // Score
    this._reg(this.add.text(rx - 54, y + ROW_H / 2, this._fmt(entry.score), {
      fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffdd66',
    }).setOrigin(1, 0.5).setDepth(205));

    // Level
    this._reg(this.add.rectangle(rx - 20, y + ROW_H / 2, 32, 18, 0x1a1000)
      .setDepth(204).setStrokeStyle(1, C.meBorder));
    this._reg(this.add.text(rx - 20, y + ROW_H / 2, `L${entry.level}`, {
      fontSize: '10px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffcc00',
    }).setOrigin(0.5).setDepth(205));
  }

  // ── Helpers ────────────────────────────────────────────────────────────────────

  _slideIn(obj, targetY) {
    obj.setY(targetY - 50).setAlpha(0);
    this.tweens.add({ targets: obj, y: obj.y + 50, alpha: 1, duration: 260, ease: 'Back.easeOut' });
  }

  _fmt(n) {
    return n.toLocaleString('tr-TR');
  }

  _close() {
    this.scene.stop('LeaderboardScene');
    this.scene.wake('GameScene');
  }
}
