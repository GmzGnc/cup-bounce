// ─── Level definitions — PORTRAIT MODE ───────────────────────────────────────
// Canvas: 390 × 844  |  Bow: bottom-centre (195, 730)
// Cup play zone: x [60, 330], y [160, 450]
//
// Safety rules (normal cup cupW=64, hw=32):
//   x-move:  originX ± range + hw ≤ 330   and   originX ± range − hw ≥ 60
//   y-move:  originY ± range − cupH/2 ≥ 155  and  originY ± range + cupH/2 ≤ 460
// Safety rules (small cup cupW=48, hw=24):
//   same as above with hw=24, cupH/2=20
//
// move: { axis:'x'|'y', speed, range, phaseOffset? }
// small: true   →  smaller cup (harder to hit, level 9+)
// isGem: true   →  gem cup (boss levels)

export const LEVELS = [

  // ════════════════════════════════════════════════════════
  // BÖLÜM 1 (1-10): Temel Atış — Öğrenme
  // ════════════════════════════════════════════════════════

  // ── Level 1: 1 cup, centre ───────────────────────────────────────────────
  {
    id: 1,
    cups: [
      { x: 195, y: 280, color: 0x00ee55, points: 100 }
    ]
  },

  // ── Level 2: 2 cups side-by-side ─────────────────────────────────────────
  {
    id: 2,
    cups: [
      { x: 118, y: 230, color: 0x00ee55, points: 100 },
      { x: 272, y: 230, color: 0xff3333, points: 200 }
    ]
  },

  // ── Level 3: triangle ─────────────────────────────────────────────────────
  {
    id: 3,
    cups: [
      { x: 195, y: 190, color: 0xffcc00, points: 300 },
      { x: 112, y: 360, color: 0x00ee55, points: 100 },
      { x: 278, y: 360, color: 0xff3333, points: 200 }
    ]
  },

  // ── Level 4: 2 cups, horizontal movement ──────────────────────────────────
  {
    id: 4,
    cups: [
      { x: 195, y: 215, color: 0x00ee55, points: 150,
        move: { axis: 'x', speed: 30, range: 60 } },
      { x: 195, y: 385, color: 0xff3333, points: 200,
        move: { axis: 'x', speed: 25, range: 55 } }
    ]
  },

  // ── Level 5: 3 cups, one moving ───────────────────────────────────────────
  {
    id: 5,
    cups: [
      { x: 195, y: 185, color: 0xffcc00, points: 300 },
      { x: 175, y: 320, color: 0x00ee55, points: 150,
        move: { axis: 'x', speed: 33, range: 60 } },
      { x: 265, y: 420, color: 0xff3333, points: 200 }
    ]
  },

  // ── Level 6: 4 cups, 2 moving ────────────────────────────────────────────
  {
    id: 6,
    cups: [
      { x: 118, y: 210, color: 0x00ee55, points: 150,
        move: { axis: 'x', speed: 28, range: 38 } },
      { x: 272, y: 210, color: 0xff3333, points: 200 },
      { x: 118, y: 375, color: 0xffcc00, points: 250 },
      { x: 272, y: 375, color: 0x44aaff, points: 300,
        move: { axis: 'x', speed: 32, range: 36 } }
    ]
  },

  // ── Level 7: 3 cups, vertical movement ───────────────────────────────────
  {
    id: 7,
    cups: [
      { x: 152, y: 245, color: 0x00ee55, points: 200,
        move: { axis: 'y', speed: 30, range: 50 } },
      { x: 238, y: 240, color: 0xff3333, points: 250,
        move: { axis: 'y', speed: 25, range: 50, phaseOffset: 1.5 } },
      { x: 195, y: 370, color: 0xffcc00, points: 300,
        move: { axis: 'y', speed: 36, range: 60 } }
    ]
  },

  // ── Level 8: 4 cups, mixed movement ──────────────────────────────────────
  {
    id: 8,
    cups: [
      { x: 148, y: 205, color: 0x00ee55, points: 200,
        move: { axis: 'x', speed: 33, range: 50 } },
      { x: 242, y: 235, color: 0xff3333, points: 250,
        move: { axis: 'y', speed: 28, range: 45 } },
      { x: 148, y: 365, color: 0xffcc00, points: 300,
        move: { axis: 'y', speed: 37, range: 55, phaseOffset: 1.0 } },
      { x: 242, y: 365, color: 0x44aaff, points: 350,
        move: { axis: 'x', speed: 30, range: 48 } }
    ]
  },

  // ── Level 9: 5 small cups ────────────────────────────────────────────────
  {
    id: 9,
    cups: [
      { x: 135, y: 190, color: 0x00ee55, points: 200, small: true,
        move: { axis: 'x', speed: 30, range: 38 } },
      { x: 258, y: 190, color: 0xff3333, points: 250, small: true },
      { x: 195, y: 300, color: 0xffcc00, points: 350, small: true,
        move: { axis: 'y', speed: 36, range: 50 } },
      { x: 135, y: 405, color: 0x44aaff, points: 250, small: true,
        move: { axis: 'x', speed: 28, range: 32 } },
      { x: 258, y: 405, color: 0xff88ff, points: 300, small: true }
    ]
  },

  // ── Level 10: BOSS — 5 cups all moving, 1 gem ────────────────────────────
  {
    id: 10,
    cups: [
      { x: 195, y: 185, color: 0xff6600, points: 400,
        move: { axis: 'x', speed: 43, range: 62 } },
      { x: 118, y: 290, color: 0xff3333, points: 350,
        move: { axis: 'y', speed: 38, range: 60 } },
      { x: 272, y: 290, color: 0x00ee55, points: 350,
        move: { axis: 'y', speed: 33, range: 55, phaseOffset: 1.2 } },
      { x: 152, y: 395, color: 0xffcc00, points: 400,
        move: { axis: 'x', speed: 40, range: 58, phaseOffset: 0.8 } },
      { x: 238, y: 395, color: 0xcc44ff, points: 500, isGem: true,
        move: { axis: 'x', speed: 34, range: 50, phaseOffset: 1.5 } }
    ]
  },

  // ════════════════════════════════════════════════════════
  // BÖLÜM 2 (11-20): Risk ve Seçim — Yüksek/Düşük Puan
  // ════════════════════════════════════════════════════════

  // ── Level 11: Büyük fark — 1 kolay 1 değerli ────────────────────────────
  {
    id: 11,
    cups: [
      { x: 150, y: 260, color: 0x00ee55, points: 100 },
      { x: 255, y: 200, color: 0xffcc00, points: 400 }
    ]
  },

  // ── Level 12: 3 cup, arka sıra değerli ──────────────────────────────────
  {
    id: 12,
    cups: [
      { x: 130, y: 390, color: 0x00ee55, points: 100 },
      { x: 260, y: 390, color: 0x00ee55, points: 100 },
      { x: 195, y: 195, color: 0xff6600, points: 500 }
    ]
  },

  // ── Level 13: Elmas düzeni — 4 cup ──────────────────────────────────────
  {
    id: 13,
    cups: [
      { x: 195, y: 175, color: 0xffcc00, points: 350 },
      { x: 100, y: 295, color: 0x00ee55, points: 150 },
      { x: 290, y: 295, color: 0xff3333, points: 200 },
      { x: 195, y: 415, color: 0x44aaff, points: 300 }
    ]
  },

  // ── Level 14: 2 hareketli, 1 sabit değerli ──────────────────────────────
  // Cup1: x=120 ±40 → left=48→ use range=28: left=60, right=180 ✓
  // Cup2: x=270 ±38 → left=200, right=340→ range=28: left=210, right=330 ✓
  {
    id: 14,
    cups: [
      { x: 120, y: 240, color: 0x00ee55, points: 150,
        move: { axis: 'x', speed: 29, range: 28 } },
      { x: 270, y: 240, color: 0xff3333, points: 200,
        move: { axis: 'x', speed: 26, range: 28 } },
      { x: 195, y: 185, color: 0xffcc00, points: 450 }
    ]
  },

  // ── Level 15: L şekli ───────────────────────────────────────────────────
  {
    id: 15,
    cups: [
      { x: 100, y: 200, color: 0x00ee55, points: 150 },
      { x: 100, y: 310, color: 0x00ee55, points: 150 },
      { x: 100, y: 420, color: 0x00ee55, points: 150 },
      { x: 195, y: 420, color: 0xff3333, points: 250 },
      { x: 290, y: 420, color: 0xffcc00, points: 350 }
    ]
  },

  // ── Level 16: Zigzag düzeni ──────────────────────────────────────────────
  {
    id: 16,
    cups: [
      { x: 110, y: 195, color: 0x00ee55, points: 200 },
      { x: 280, y: 265, color: 0xff3333, points: 250 },
      { x: 110, y: 335, color: 0xffcc00, points: 300 },
      { x: 280, y: 405, color: 0x44aaff, points: 350 }
    ]
  },

  // ── Level 17: 3 hareketli, farklı eksler ────────────────────────────────
  // Cup1: x=195 ±58 → left=105, right=285 ✓
  // Cup2: y=280 ±55 → top=225−26=199 ✓ bot=335+26=361 ✓
  // Cup3: x=195 ±58 → left=105, right=285 ✓
  {
    id: 17,
    cups: [
      { x: 195, y: 195, color: 0xff6600, points: 350,
        move: { axis: 'x', speed: 36, range: 58 } },
      { x: 130, y: 310, color: 0x00ee55, points: 200,
        move: { axis: 'y', speed: 30, range: 55 } },
      { x: 270, y: 310, color: 0xff3333, points: 250,
        move: { axis: 'y', speed: 33, range: 55, phaseOffset: 1.0 } }
    ]
  },

  // ── Level 18: 5 cup, W şekli ────────────────────────────────────────────
  {
    id: 18,
    cups: [
      { x: 90,  y: 200, color: 0x00ee55, points: 150 },
      { x: 155, y: 360, color: 0xff3333, points: 200 },
      { x: 195, y: 210, color: 0xffcc00, points: 400 },
      { x: 240, y: 360, color: 0xff3333, points: 200 },
      { x: 305, y: 200, color: 0x00ee55, points: 150 }
    ]
  },

  // ── Level 19: Küçük + hareketli karışık ─────────────────────────────────
  // Cup1 small: x=115 ±32 → left=59→ range=27: left=64 ✓ right=174 ✓
  // Cup3 small: x=278 ±28 → left=230, right=326→ range=20: left=234, right=322 ✓
  {
    id: 19,
    cups: [
      { x: 115, y: 210, color: 0x00ee55, points: 250, small: true,
        move: { axis: 'x', speed: 29, range: 27 } },
      { x: 195, y: 300, color: 0xffcc00, points: 350 },
      { x: 278, y: 400, color: 0xff3333, points: 300, small: true,
        move: { axis: 'x', speed: 26, range: 20 } }
    ]
  },

  // ── Level 20: BOSS — 4 hareketli + 1 gem sabit ──────────────────────────
  // Cup1: x=115 ±35 → left=48→ range=23: left=60, right=170 ✓
  // Cup2: x=275 ±35 → right=342→ range=23: left=220, right=330 ✓
  // Cup3: y=310 ±55 → top=255−26=229 ✓ bot=365+26=391 ✓
  // Cup4: y=310 ±55 → same ✓
  {
    id: 20,
    cups: [
      { x: 115, y: 215, color: 0x00ee55, points: 300,
        move: { axis: 'x', speed: 37, range: 23 } },
      { x: 275, y: 215, color: 0xff3333, points: 300,
        move: { axis: 'x', speed: 40, range: 23 } },
      { x: 140, y: 365, color: 0xffcc00, points: 400,
        move: { axis: 'y', speed: 34, range: 55 } },
      { x: 250, y: 365, color: 0x44aaff, points: 400,
        move: { axis: 'y', speed: 32, range: 55, phaseOffset: 1.3 } },
      { x: 195, y: 185, color: 0xcc44ff, points: 600, isGem: true }
    ]
  },

  // ════════════════════════════════════════════════════════
  // BÖLÜM 3 (21-30): Sekme Mekaniği — Açısal Atışlar
  // ════════════════════════════════════════════════════════

  // ── Level 21: Kenara yakın — sekme teşviki ───────────────────────────────
  {
    id: 21,
    cups: [
      { x: 90,  y: 300, color: 0x00ee55, points: 200 },
      { x: 310, y: 300, color: 0xff3333, points: 200 }
    ]
  },

  // ── Level 22: 3 cup köşelerde ───────────────────────────────────────────
  {
    id: 22,
    cups: [
      { x: 92,  y: 195, color: 0xffcc00, points: 300 },
      { x: 300, y: 195, color: 0xffcc00, points: 300 },
      { x: 195, y: 430, color: 0xff6600, points: 450 }
    ]
  },

  // ── Level 23: 4 köşe ────────────────────────────────────────────────────
  {
    id: 23,
    cups: [
      { x: 92,  y: 195, color: 0x00ee55, points: 200 },
      { x: 300, y: 195, color: 0xff3333, points: 250 },
      { x: 92,  y: 415, color: 0x44aaff, points: 300 },
      { x: 300, y: 415, color: 0xffcc00, points: 350 }
    ]
  },

  // ── Level 24: 2 hareketli kenara yakın ──────────────────────────────────
  // Cup1: x=92 ±20 → left=40→ range=0 fixed / use static positions
  // safer: x=105, range=13 → left=60, right=150 ✓
  // Cup2: x=288, range=10 → left=246, right=330 ✓
  {
    id: 24,
    cups: [
      { x: 105, y: 240, color: 0x00ee55, points: 250,
        move: { axis: 'y', speed: 30, range: 50 } },
      { x: 288, y: 240, color: 0xff3333, points: 300,
        move: { axis: 'y', speed: 33, range: 50, phaseOffset: 1.0 } },
      { x: 195, y: 400, color: 0xffcc00, points: 400 }
    ]
  },

  // ── Level 25: Altı bardak, iki sıra ─────────────────────────────────────
  {
    id: 25,
    cups: [
      { x: 110, y: 210, color: 0x00ee55, points: 150 },
      { x: 195, y: 210, color: 0xff3333, points: 200 },
      { x: 280, y: 210, color: 0xffcc00, points: 250 },
      { x: 110, y: 380, color: 0x44aaff, points: 300 },
      { x: 195, y: 380, color: 0xff6600, points: 350 },
      { x: 280, y: 380, color: 0xcc44ff, points: 400 }
    ]
  },

  // ── Level 26: Yatay + dikey karışık hız ─────────────────────────────────
  // Cup1: x=150 ±60 → left=58→ range=58 risky, use range=50: left=68 ✓ right=232 ✓
  // Cup2: x=240 ±55 → right=327→ range=45: left=163, right=317 ✓
  // Cup3: y=300 ±65 → top=235−26=209 ✓ bot=365+26=391 ✓
  {
    id: 26,
    cups: [
      { x: 150, y: 200, color: 0x00ee55, points: 250,
        move: { axis: 'x', speed: 40, range: 50 } },
      { x: 240, y: 400, color: 0xff3333, points: 300,
        move: { axis: 'x', speed: 36, range: 45 } },
      { x: 195, y: 300, color: 0xffcc00, points: 500,
        move: { axis: 'y', speed: 44, range: 65 } }
    ]
  },

  // ── Level 27: 4 small cup, 2 sıra ───────────────────────────────────────
  {
    id: 27,
    cups: [
      { x: 130, y: 210, color: 0x00ee55, points: 250, small: true },
      { x: 260, y: 210, color: 0xff3333, points: 300, small: true },
      { x: 130, y: 390, color: 0x44aaff, points: 300, small: true },
      { x: 260, y: 390, color: 0xffcc00, points: 350, small: true }
    ]
  },

  // ── Level 28: Hareketli small cup'lar ───────────────────────────────────
  // Cup1 small: x=130 ±42 → left=64, right=196 ✓
  // Cup2 small: x=260 ±42 → left=194, right=326 ✓
  {
    id: 28,
    cups: [
      { x: 130, y: 215, color: 0x00ee55, points: 300, small: true,
        move: { axis: 'x', speed: 34, range: 42 } },
      { x: 260, y: 215, color: 0xff3333, points: 350, small: true,
        move: { axis: 'x', speed: 30, range: 42, phaseOffset: 1.2 } },
      { x: 195, y: 390, color: 0xffcc00, points: 450 }
    ]
  },

  // ── Level 29: 5 cup zigzag hareketli ────────────────────────────────────
  {
    id: 29,
    cups: [
      { x: 110, y: 185, color: 0x00ee55, points: 200,
        move: { axis: 'x', speed: 30, range: 30 } },
      { x: 280, y: 255, color: 0xff3333, points: 250,
        move: { axis: 'x', speed: 33, range: 30 } },
      { x: 110, y: 325, color: 0xffcc00, points: 350,
        move: { axis: 'y', speed: 36, range: 45 } },
      { x: 280, y: 325, color: 0x44aaff, points: 300,
        move: { axis: 'y', speed: 32, range: 45, phaseOffset: 0.8 } },
      { x: 195, y: 420, color: 0xff6600, points: 450 }
    ]
  },

  // ── Level 30: BOSS — 6 cup, 2 gem ───────────────────────────────────────
  {
    id: 30,
    cups: [
      { x: 195, y: 175, color: 0xff6600, points: 400,
        move: { axis: 'x', speed: 44, range: 62 } },
      { x: 110, y: 265, color: 0x00ee55, points: 300,
        move: { axis: 'y', speed: 38, range: 55 } },
      { x: 280, y: 265, color: 0xff3333, points: 350,
        move: { axis: 'y', speed: 36, range: 55, phaseOffset: 1.1 } },
      { x: 110, y: 390, color: 0xffcc00, points: 400,
        move: { axis: 'x', speed: 41, range: 30 } },
      { x: 280, y: 390, color: 0xcc44ff, points: 600, isGem: true,
        move: { axis: 'x', speed: 37, range: 30, phaseOffset: 1.4 } },
      { x: 195, y: 430, color: 0xcc44ff, points: 600, isGem: true }
    ]
  },

  // ════════════════════════════════════════════════════════
  // BÖLÜM 4 (31-40): Hareketli Hedefler — Zamanlama
  // ════════════════════════════════════════════════════════

  // ── Level 31: Hızlı tek bardak ──────────────────────────────────────────
  {
    id: 31,
    cups: [
      { x: 195, y: 280, color: 0xff6600, points: 400,
        move: { axis: 'x', speed: 50, range: 100 } }
    ]
  },

  // ── Level 32: İki hızlı, ters yön ───────────────────────────────────────
  // Cup1: x=195 ±85 → left=78, right=312 ✓
  // Cup2: x=195 ±80 → left=83, right=307 ✓
  {
    id: 32,
    cups: [
      { x: 195, y: 220, color: 0x00ee55, points: 300,
        move: { axis: 'x', speed: 47, range: 85 } },
      { x: 195, y: 390, color: 0xff3333, points: 350,
        move: { axis: 'x', speed: 44, range: 80, phaseOffset: Math.PI } }
    ]
  },

  // ── Level 33: Dikey hız testi ────────────────────────────────────────────
  // Cup1: y=310 ±100 → top=210−26=184 ✓ bot=410+26=436 ✓
  // Cup2: y=280 ±80  → top=200−26=174 ✓ bot=360+26=386 ✓
  {
    id: 33,
    cups: [
      { x: 130, y: 310, color: 0x00ee55, points: 300,
        move: { axis: 'y', speed: 50, range: 100 } },
      { x: 265, y: 280, color: 0xff3333, points: 350,
        move: { axis: 'y', speed: 47, range: 80, phaseOffset: 1.6 } }
    ]
  },

  // ── Level 34: 3 cup, dairesel his ───────────────────────────────────────
  {
    id: 34,
    cups: [
      { x: 195, y: 195, color: 0xffcc00, points: 350,
        move: { axis: 'x', speed: 38, range: 65 } },
      { x: 118, y: 360, color: 0x00ee55, points: 250,
        move: { axis: 'y', speed: 36, range: 55 } },
      { x: 272, y: 360, color: 0xff3333, points: 300,
        move: { axis: 'y', speed: 40, range: 55, phaseOffset: 1.0 } }
    ]
  },

  // ── Level 35: 5 cup hızlı hareket ───────────────────────────────────────
  {
    id: 35,
    cups: [
      { x: 195, y: 185, color: 0xff6600, points: 400,
        move: { axis: 'x', speed: 48, range: 62 } },
      { x: 110, y: 275, color: 0x00ee55, points: 250,
        move: { axis: 'x', speed: 41, range: 28 } },
      { x: 280, y: 275, color: 0xff3333, points: 300,
        move: { axis: 'x', speed: 44, range: 28, phaseOffset: 0.7 } },
      { x: 150, y: 395, color: 0xffcc00, points: 350,
        move: { axis: 'y', speed: 38, range: 55 } },
      { x: 250, y: 395, color: 0x44aaff, points: 350,
        move: { axis: 'y', speed: 43, range: 55, phaseOffset: 1.2 } }
    ]
  },

  // ── Level 36: Small + hızlı yatay ───────────────────────────────────────
  // Cup1 small: x=130 ±42 → left=64, right=196 ✓
  // Cup2 small: x=265 ±41 → left=200, right=330 ✓
  {
    id: 36,
    cups: [
      { x: 130, y: 250, color: 0x00ee55, points: 350, small: true,
        move: { axis: 'x', speed: 47, range: 42 } },
      { x: 265, y: 250, color: 0xff3333, points: 400, small: true,
        move: { axis: 'x', speed: 50, range: 41, phaseOffset: 1.0 } },
      { x: 195, y: 410, color: 0xffcc00, points: 300 }
    ]
  },

  // ── Level 37: Dört small hareketli ──────────────────────────────────────
  {
    id: 37,
    cups: [
      { x: 130, y: 220, color: 0x00ee55, points: 300, small: true,
        move: { axis: 'x', speed: 43, range: 35 } },
      { x: 265, y: 220, color: 0xff3333, points: 350, small: true,
        move: { axis: 'y', speed: 45, range: 42 } },
      { x: 130, y: 390, color: 0xffcc00, points: 400, small: true,
        move: { axis: 'y', speed: 38, range: 45, phaseOffset: 1.3 } },
      { x: 265, y: 390, color: 0x44aaff, points: 350, small: true,
        move: { axis: 'x', speed: 47, range: 35, phaseOffset: 0.9 } }
    ]
  },

  // ── Level 38: Sarmal his — 5 cup farklı hız ─────────────────────────────
  {
    id: 38,
    cups: [
      { x: 195, y: 185, color: 0xff6600, points: 450,
        move: { axis: 'x', speed: 52, range: 60 } },
      { x: 108, y: 280, color: 0x00ee55, points: 300,
        move: { axis: 'y', speed: 40, range: 55 } },
      { x: 282, y: 280, color: 0xff3333, points: 350,
        move: { axis: 'y', speed: 44, range: 55, phaseOffset: 1.1 } },
      { x: 150, y: 400, color: 0xffcc00, points: 400,
        move: { axis: 'x', speed: 37, range: 52 } },
      { x: 245, y: 400, color: 0x44aaff, points: 400,
        move: { axis: 'x', speed: 42, range: 45, phaseOffset: 0.6 } }
    ]
  },

  // ── Level 39: Neredeyse tüm small, hızlı ────────────────────────────────
  {
    id: 39,
    cups: [
      { x: 195, y: 190, color: 0xffcc00, points: 500, small: true,
        move: { axis: 'x', speed: 51, range: 58 } },
      { x: 110, y: 300, color: 0x00ee55, points: 350, small: true,
        move: { axis: 'y', speed: 47, range: 50 } },
      { x: 280, y: 300, color: 0xff3333, points: 400, small: true,
        move: { axis: 'y', speed: 43, range: 50, phaseOffset: 1.5 } },
      { x: 155, y: 415, color: 0x44aaff, points: 350, small: true,
        move: { axis: 'x', speed: 48, range: 55 } },
      { x: 250, y: 415, color: 0xff88ff, points: 350, small: true,
        move: { axis: 'x', speed: 45, range: 42, phaseOffset: 1.8 } }
    ]
  },

  // ── Level 40: BOSS — 6 hızlı cup, 2 gem small ───────────────────────────
  {
    id: 40,
    cups: [
      { x: 195, y: 175, color: 0xff6600, points: 500,
        move: { axis: 'x', speed: 55, range: 62 } },
      { x: 108, y: 265, color: 0x00ee55, points: 350,
        move: { axis: 'y', speed: 48, range: 55 } },
      { x: 282, y: 265, color: 0xff3333, points: 400,
        move: { axis: 'y', speed: 51, range: 55, phaseOffset: 1.2 } },
      { x: 118, y: 395, color: 0xffcc00, points: 450,
        move: { axis: 'x', speed: 44, range: 26 } },
      { x: 272, y: 395, color: 0xcc44ff, points: 700, isGem: true, small: true,
        move: { axis: 'x', speed: 52, range: 30, phaseOffset: 1.0 } },
      { x: 195, y: 435, color: 0xcc44ff, points: 700, isGem: true, small: true,
        move: { axis: 'y', speed: 38, range: 20 } }
    ]
  },

  // ════════════════════════════════════════════════════════
  // BÖLÜM 5 (41-50): İleri Challenge — Hassas & Kombine
  // ════════════════════════════════════════════════════════

  // ── Level 41: Tek small, süper hızlı ────────────────────────────────────
  {
    id: 41,
    cups: [
      { x: 195, y: 280, color: 0xff6600, points: 600, small: true,
        move: { axis: 'x', speed: 61, range: 80 } }
    ]
  },

  // ── Level 42: 2 small ters yön ──────────────────────────────────────────
  {
    id: 42,
    cups: [
      { x: 150, y: 230, color: 0x00ee55, points: 400, small: true,
        move: { axis: 'x', speed: 55, range: 52 } },
      { x: 245, y: 390, color: 0xff3333, points: 450, small: true,
        move: { axis: 'x', speed: 58, range: 47, phaseOffset: Math.PI } }
    ]
  },

  // ── Level 43: 3 small dikey ─────────────────────────────────────────────
  // Cup1: y=290 ±90 → top=200−20=180 ✓ bot=380+20=400 ✓
  // Cup2: y=300 ±80 → top=220−20=200 ✓ bot=380+20=400 ✓
  // Cup3: y=280 ±85 → top=195−20=175 ✓ bot=365+20=385 ✓
  {
    id: 43,
    cups: [
      { x: 110, y: 290, color: 0x00ee55, points: 400, small: true,
        move: { axis: 'y', speed: 55, range: 90 } },
      { x: 195, y: 300, color: 0xffcc00, points: 550, small: true,
        move: { axis: 'y', speed: 52, range: 80, phaseOffset: 1.0 } },
      { x: 280, y: 280, color: 0xff3333, points: 450, small: true,
        move: { axis: 'y', speed: 58, range: 85, phaseOffset: 0.5 } }
    ]
  },

  // ── Level 44: 4 cup, karma hız + faz ────────────────────────────────────
  {
    id: 44,
    cups: [
      { x: 130, y: 210, color: 0x00ee55, points: 350,
        move: { axis: 'x', speed: 50, range: 42 } },
      { x: 265, y: 210, color: 0xff3333, points: 400,
        move: { axis: 'y', speed: 52, range: 52 } },
      { x: 130, y: 410, color: 0xffcc00, points: 450, small: true,
        move: { axis: 'y', speed: 48, range: 55, phaseOffset: 1.7 } },
      { x: 265, y: 410, color: 0x44aaff, points: 400, small: true,
        move: { axis: 'x', speed: 51, range: 37, phaseOffset: 2.1 } }
    ]
  },

  // ── Level 45: Orta boss hazırlık — 5 cup karma ──────────────────────────
  {
    id: 45,
    cups: [
      { x: 195, y: 185, color: 0xff6600, points: 500,
        move: { axis: 'x', speed: 58, range: 60 } },
      { x: 110, y: 295, color: 0x00ee55, points: 350, small: true,
        move: { axis: 'y', speed: 52, range: 55 } },
      { x: 280, y: 295, color: 0xff3333, points: 400, small: true,
        move: { axis: 'y', speed: 55, range: 55, phaseOffset: 1.3 } },
      { x: 150, y: 415, color: 0xffcc00, points: 450,
        move: { axis: 'x', speed: 47, range: 52 } },
      { x: 245, y: 415, color: 0x44aaff, points: 450,
        move: { axis: 'x', speed: 50, range: 43, phaseOffset: 0.9 } }
    ]
  },

  // ── Level 46: 6 cup, 2 sıra hızlı ───────────────────────────────────────
  {
    id: 46,
    cups: [
      { x: 100, y: 210, color: 0x00ee55, points: 300,
        move: { axis: 'x', speed: 44, range: 20 } },
      { x: 195, y: 210, color: 0xff3333, points: 350,
        move: { axis: 'x', speed: 48, range: 60 } },
      { x: 290, y: 210, color: 0xffcc00, points: 400,
        move: { axis: 'x', speed: 41, range: 20 } },
      { x: 100, y: 400, color: 0x44aaff, points: 350,
        move: { axis: 'y', speed: 51, range: 50 } },
      { x: 195, y: 400, color: 0xff6600, points: 500, small: true,
        move: { axis: 'y', speed: 54, range: 50, phaseOffset: 1.2 } },
      { x: 290, y: 400, color: 0xff88ff, points: 350,
        move: { axis: 'y', speed: 47, range: 50, phaseOffset: 0.6 } }
    ]
  },

  // ── Level 47: Saatten bağımsız — tam kaos ───────────────────────────────
  {
    id: 47,
    cups: [
      { x: 130, y: 195, color: 0xff6600, points: 500, small: true,
        move: { axis: 'x', speed: 61, range: 42 } },
      { x: 265, y: 195, color: 0xffcc00, points: 500, small: true,
        move: { axis: 'x', speed: 63, range: 33, phaseOffset: 1.4 } },
      { x: 195, y: 310, color: 0xcc44ff, points: 700, isGem: true, small: true,
        move: { axis: 'y', speed: 55, range: 80 } },
      { x: 130, y: 420, color: 0x00ee55, points: 400,
        move: { axis: 'y', speed: 48, range: 40 } },
      { x: 265, y: 420, color: 0xff3333, points: 450,
        move: { axis: 'y', speed: 51, range: 40, phaseOffset: 2.0 } }
    ]
  },

  // ── Level 48: Neredeyse hepsi small, çılgın faz ─────────────────────────
  {
    id: 48,
    cups: [
      { x: 110, y: 210, color: 0x00ee55, points: 450, small: true,
        move: { axis: 'x', speed: 58, range: 32 } },
      { x: 280, y: 210, color: 0xff3333, points: 500, small: true,
        move: { axis: 'x', speed: 62, range: 28, phaseOffset: Math.PI } },
      { x: 130, y: 320, color: 0xffcc00, points: 550, small: true,
        move: { axis: 'y', speed: 54, range: 75 } },
      { x: 265, y: 320, color: 0x44aaff, points: 500, small: true,
        move: { axis: 'y', speed: 58, range: 70, phaseOffset: 1.6 } },
      { x: 195, y: 430, color: 0xff6600, points: 600, small: true,
        move: { axis: 'x', speed: 65, range: 58 } }
    ]
  },

  // ── Level 49: Finale hazırlık — 6 small karma ───────────────────────────
  {
    id: 49,
    cups: [
      { x: 195, y: 180, color: 0xff6600, points: 600, small: true,
        move: { axis: 'x', speed: 66, range: 58 } },
      { x: 108, y: 270, color: 0x00ee55, points: 450, small: true,
        move: { axis: 'y', speed: 59, range: 55 } },
      { x: 282, y: 270, color: 0xff3333, points: 500, small: true,
        move: { axis: 'y', speed: 63, range: 55, phaseOffset: 1.3 } },
      { x: 130, y: 390, color: 0xffcc00, points: 550, small: true,
        move: { axis: 'x', speed: 55, range: 42 } },
      { x: 265, y: 390, color: 0x44aaff, points: 550, small: true,
        move: { axis: 'x', speed: 61, range: 33, phaseOffset: 0.8 } },
      { x: 195, y: 440, color: 0xff88ff, points: 500, small: true,
        move: { axis: 'y', speed: 52, range: 18 } }
    ]
  },

  // ── Level 50: GRAND BOSS — 7 cup, 3 gem, max kaos ───────────────────────
  {
    id: 50,
    cups: [
      { x: 195, y: 175, color: 0xff6600, points: 700,
        move: { axis: 'x', speed: 69, range: 62 } },
      { x: 108, y: 260, color: 0x00ee55, points: 500,
        move: { axis: 'y', speed: 61, range: 55 } },
      { x: 282, y: 260, color: 0xff3333, points: 550,
        move: { axis: 'y', speed: 65, range: 55, phaseOffset: 1.2 } },
      { x: 130, y: 370, color: 0xffcc00, points: 600, small: true,
        move: { axis: 'x', speed: 58, range: 42 } },
      { x: 265, y: 370, color: 0x44aaff, points: 600, small: true,
        move: { axis: 'x', speed: 62, range: 33, phaseOffset: 1.7 } },
      { x: 150, y: 440, color: 0xcc44ff, points: 800, isGem: true, small: true,
        move: { axis: 'x', speed: 66, range: 52 } },
      { x: 255, y: 440, color: 0xcc44ff, points: 800, isGem: true, small: true,
        move: { axis: 'y', speed: 55, range: 18, phaseOffset: 0.5 } }
    ]
  },

  // ════════════════════════════════════════════════════════
  // BÖLÜM 6 (51-60): Karma Formasyon — Sekme + Hareket
  // ════════════════════════════════════════════════════════

  // ── Level 51: Üçgen + hareketli tepe ────────────────────────────────────
  { id: 51, cups: [
    { x: 195, y: 185, color: 0xff6600, points: 450, move: { axis: 'x', speed: 45, range: 65 } },
    { x: 120, y: 370, color: 0x00ee55, points: 250 },
    { x: 270, y: 370, color: 0xff3333, points: 300 }
  ]},

  // ── Level 52: 4 cup çarpraz ──────────────────────────────────────────────
  { id: 52, cups: [
    { x: 110, y: 200, color: 0x00ee55, points: 250 },
    { x: 280, y: 200, color: 0xff3333, points: 300 },
    { x: 110, y: 400, color: 0xffcc00, points: 350, move: { axis: 'x', speed: 38, range: 30 } },
    { x: 280, y: 400, color: 0x44aaff, points: 350, move: { axis: 'x', speed: 34, range: 30, phaseOffset: 1.0 } }
  ]},

  // ── Level 53: 5 cup X şekli ──────────────────────────────────────────────
  { id: 53, cups: [
    { x: 100, y: 195, color: 0x00ee55, points: 250 },
    { x: 290, y: 195, color: 0xff3333, points: 250 },
    { x: 195, y: 300, color: 0xffcc00, points: 500, move: { axis: 'y', speed: 40, range: 55 } },
    { x: 100, y: 415, color: 0x44aaff, points: 300 },
    { x: 290, y: 415, color: 0xff6600, points: 300 }
  ]},

  // ── Level 54: 3 small hareketli ──────────────────────────────────────────
  { id: 54, cups: [
    { x: 140, y: 215, color: 0x00ee55, points: 350, small: true, move: { axis: 'x', speed: 36, range: 45 } },
    { x: 250, y: 330, color: 0xff3333, points: 400, small: true, move: { axis: 'y', speed: 40, range: 50 } },
    { x: 140, y: 415, color: 0xffcc00, points: 350, small: true, move: { axis: 'x', speed: 33, range: 40, phaseOffset: 1.2 } }
  ]},

  // ── Level 55: 6 cup iki sıra hareketli ───────────────────────────────────
  { id: 55, cups: [
    { x: 100, y: 205, color: 0x00ee55, points: 200, move: { axis: 'x', speed: 30, range: 22 } },
    { x: 195, y: 205, color: 0xff3333, points: 250 },
    { x: 290, y: 205, color: 0xffcc00, points: 300, move: { axis: 'x', speed: 28, range: 22, phaseOffset: 0.8 } },
    { x: 100, y: 390, color: 0x44aaff, points: 300 },
    { x: 195, y: 390, color: 0xff6600, points: 400, move: { axis: 'y', speed: 35, range: 45 } },
    { x: 290, y: 390, color: 0xcc44ff, points: 350 }
  ]},

  // ── Level 56: Yıldız formasyon ───────────────────────────────────────────
  { id: 56, cups: [
    { x: 195, y: 175, color: 0xffcc00, points: 500 },
    { x: 95,  y: 270, color: 0x00ee55, points: 250, move: { axis: 'y', speed: 32, range: 45 } },
    { x: 295, y: 270, color: 0xff3333, points: 300, move: { axis: 'y', speed: 35, range: 45, phaseOffset: 1.0 } },
    { x: 140, y: 415, color: 0x44aaff, points: 350 },
    { x: 250, y: 415, color: 0xff6600, points: 350 }
  ]},

  // ── Level 57: 4 small köşe + merkez gem ──────────────────────────────────
  { id: 57, cups: [
    { x: 100, y: 200, color: 0x00ee55, points: 300, small: true },
    { x: 290, y: 200, color: 0xff3333, points: 300, small: true },
    { x: 195, y: 305, color: 0xcc44ff, points: 700, isGem: true },
    { x: 100, y: 420, color: 0x44aaff, points: 300, small: true },
    { x: 290, y: 420, color: 0xffcc00, points: 300, small: true }
  ]},

  // ── Level 58: Hızlı 3 hareketli ─────────────────────────────────────────
  { id: 58, cups: [
    { x: 195, y: 195, color: 0xff6600, points: 450, move: { axis: 'x', speed: 55, range: 70 } },
    { x: 120, y: 320, color: 0x00ee55, points: 300, move: { axis: 'y', speed: 48, range: 55 } },
    { x: 270, y: 410, color: 0xff3333, points: 400, move: { axis: 'x', speed: 50, range: 55 } }
  ]},

  // ── Level 59: 5 small zikzak ─────────────────────────────────────────────
  { id: 59, cups: [
    { x: 100, y: 195, color: 0x00ee55, points: 300, small: true, move: { axis: 'x', speed: 38, range: 22 } },
    { x: 290, y: 255, color: 0xff3333, points: 350, small: true, move: { axis: 'y', speed: 42, range: 45 } },
    { x: 100, y: 320, color: 0xffcc00, points: 400, small: true, move: { axis: 'x', speed: 35, range: 22, phaseOffset: 0.6 } },
    { x: 290, y: 385, color: 0x44aaff, points: 350, small: true, move: { axis: 'y', speed: 38, range: 40, phaseOffset: 1.0 } },
    { x: 195, y: 435, color: 0xff6600, points: 300, small: true }
  ]},

  // ── Level 60: BOSS — 7 cup, 2 gem, karma hareket ─────────────────────────
  { id: 60, cups: [
    { x: 195, y: 175, color: 0xff6600, points: 500, move: { axis: 'x', speed: 58, range: 65 } },
    { x: 100, y: 255, color: 0x00ee55, points: 350, move: { axis: 'y', speed: 50, range: 50 } },
    { x: 290, y: 255, color: 0xff3333, points: 400, move: { axis: 'y', speed: 53, range: 50, phaseOffset: 1.1 } },
    { x: 100, y: 375, color: 0xffcc00, points: 400, small: true, move: { axis: 'x', speed: 46, range: 22 } },
    { x: 290, y: 375, color: 0x44aaff, points: 400, small: true, move: { axis: 'x', speed: 43, range: 22, phaseOffset: 0.9 } },
    { x: 145, y: 440, color: 0xcc44ff, points: 800, isGem: true, small: true, move: { axis: 'x', speed: 48, range: 40 } },
    { x: 250, y: 440, color: 0xcc44ff, points: 800, isGem: true, small: true, move: { axis: 'y', speed: 44, range: 18, phaseOffset: 0.5 } }
  ]},

  // ════════════════════════════════════════════════════════
  // BÖLÜM 7 (61-70): Özel Kurallar — Combo & Seri
  // ════════════════════════════════════════════════════════

  // ── Level 61: Tek büyük puan ─────────────────────────────────────────────
  { id: 61, cups: [
    { x: 195, y: 300, color: 0xffcc00, points: 800 }
  ]},

  // ── Level 62: 2 small hızlı ──────────────────────────────────────────────
  { id: 62, cups: [
    { x: 130, y: 250, color: 0x00ee55, points: 350, small: true, move: { axis: 'x', speed: 55, range: 40 } },
    { x: 260, y: 370, color: 0xff3333, points: 450, small: true, move: { axis: 'y', speed: 58, range: 55 } }
  ]},

  // ── Level 63: 4 cup simetrik ─────────────────────────────────────────────
  { id: 63, cups: [
    { x: 120, y: 215, color: 0x00ee55, points: 300, move: { axis: 'y', speed: 40, range: 45 } },
    { x: 270, y: 215, color: 0xff3333, points: 350, move: { axis: 'y', speed: 43, range: 45, phaseOffset: 1.0 } },
    { x: 120, y: 395, color: 0xffcc00, points: 400, move: { axis: 'y', speed: 38, range: 45, phaseOffset: 0.5 } },
    { x: 270, y: 395, color: 0x44aaff, points: 400, move: { axis: 'y', speed: 45, range: 45, phaseOffset: 1.5 } }
  ]},

  // ── Level 64: 3 cup üst küme ─────────────────────────────────────────────
  { id: 64, cups: [
    { x: 130, y: 195, color: 0x00ee55, points: 300 },
    { x: 195, y: 195, color: 0xffcc00, points: 500 },
    { x: 260, y: 195, color: 0xff3333, points: 350 },
    { x: 195, y: 415, color: 0xff6600, points: 450, move: { axis: 'x', speed: 50, range: 65 } }
  ]},

  // ── Level 65: 5 cup çember ───────────────────────────────────────────────
  { id: 65, cups: [
    { x: 195, y: 180, color: 0xffcc00, points: 400 },
    { x: 310, y: 295, color: 0xff3333, points: 350 },
    { x: 270, y: 420, color: 0xff6600, points: 300 },
    { x: 120, y: 420, color: 0x44aaff, points: 300 },
    { x:  80, y: 295, color: 0x00ee55, points: 350 }
  ]},

  // ── Level 66: Çember hareketli ───────────────────────────────────────────
  { id: 66, cups: [
    { x: 195, y: 185, color: 0xffcc00, points: 450, move: { axis: 'x', speed: 45, range: 60 } },
    { x: 100, y: 300, color: 0x00ee55, points: 350, move: { axis: 'y', speed: 40, range: 50 } },
    { x: 290, y: 300, color: 0xff3333, points: 400, move: { axis: 'y', speed: 43, range: 50, phaseOffset: 1.2 } },
    { x: 195, y: 420, color: 0x44aaff, points: 350, move: { axis: 'x', speed: 42, range: 60, phaseOffset: 0.8 } }
  ]},

  // ── Level 67: 6 small sabit ──────────────────────────────────────────────
  { id: 67, cups: [
    { x: 100, y: 200, color: 0x00ee55, points: 300, small: true },
    { x: 195, y: 200, color: 0xff3333, points: 350, small: true },
    { x: 290, y: 200, color: 0xffcc00, points: 400, small: true },
    { x: 100, y: 395, color: 0x44aaff, points: 350, small: true },
    { x: 195, y: 395, color: 0xff6600, points: 400, small: true },
    { x: 290, y: 395, color: 0xcc44ff, points: 500, isGem: true, small: true }
  ]},

  // ── Level 68: Üç hızlı small ─────────────────────────────────────────────
  { id: 68, cups: [
    { x: 195, y: 190, color: 0xff6600, points: 500, small: true, move: { axis: 'x', speed: 62, range: 68 } },
    { x: 115, y: 340, color: 0x00ee55, points: 380, small: true, move: { axis: 'y', speed: 55, range: 55 } },
    { x: 275, y: 420, color: 0xff3333, points: 420, small: true, move: { axis: 'x', speed: 58, range: 52 } }
  ]},

  // ── Level 69: 5 hareketli farklı hız ────────────────────────────────────
  { id: 69, cups: [
    { x: 195, y: 185, color: 0xff6600, points: 450, move: { axis: 'x', speed: 65, range: 65 } },
    { x: 100, y: 270, color: 0x00ee55, points: 300, move: { axis: 'y', speed: 42, range: 45 } },
    { x: 290, y: 270, color: 0xff3333, points: 350, move: { axis: 'y', speed: 38, range: 45, phaseOffset: 0.7 } },
    { x: 130, y: 410, color: 0xffcc00, points: 400, move: { axis: 'x', speed: 52, range: 40 } },
    { x: 260, y: 410, color: 0x44aaff, points: 400, move: { axis: 'x', speed: 48, range: 40, phaseOffset: 1.3 } }
  ]},

  // ── Level 70: BOSS — 8 cup, 2 gem, max formasyon ─────────────────────────
  { id: 70, cups: [
    { x: 195, y: 175, color: 0xff6600, points: 600, move: { axis: 'x', speed: 68, range: 65 } },
    { x: 100, y: 245, color: 0x00ee55, points: 400, move: { axis: 'y', speed: 55, range: 48 } },
    { x: 290, y: 245, color: 0xff3333, points: 450, move: { axis: 'y', speed: 60, range: 48, phaseOffset: 1.0 } },
    { x: 100, y: 345, color: 0xffcc00, points: 400, small: true, move: { axis: 'x', speed: 50, range: 22 } },
    { x: 290, y: 345, color: 0x44aaff, points: 400, small: true, move: { axis: 'x', speed: 47, range: 22, phaseOffset: 0.8 } },
    { x: 150, y: 415, color: 0xff88ff, points: 500, small: true, move: { axis: 'y', speed: 53, range: 18 } },
    { x: 240, y: 440, color: 0xcc44ff, points: 900, isGem: true, small: true, move: { axis: 'x', speed: 60, range: 45 } },
    { x: 195, y: 440, color: 0xcc44ff, points: 900, isGem: true, small: true, move: { axis: 'y', speed: 50, range: 18, phaseOffset: 1.5 } }
  ]},

  // ════════════════════════════════════════════════════════
  // BÖLÜM 8 (71-80): İleri Challenge — Hassasiyet
  // ════════════════════════════════════════════════════════

  // ── Level 71: Tek small hızlı ────────────────────────────────────────────
  { id: 71, cups: [
    { x: 195, y: 300, color: 0xff6600, points: 600, small: true, move: { axis: 'x', speed: 70, range: 95 } }
  ]},

  // ── Level 72: 2 small zıt yön ────────────────────────────────────────────
  { id: 72, cups: [
    { x: 195, y: 220, color: 0x00ee55, points: 450, small: true, move: { axis: 'x', speed: 65, range: 80 } },
    { x: 195, y: 390, color: 0xff3333, points: 500, small: true, move: { axis: 'x', speed: 68, range: 80, phaseOffset: Math.PI } }
  ]},

  // ── Level 73: 3 small üçgen ──────────────────────────────────────────────
  { id: 73, cups: [
    { x: 195, y: 185, color: 0xffcc00, points: 550, small: true, move: { axis: 'x', speed: 60, range: 65 } },
    { x: 115, y: 385, color: 0x00ee55, points: 420, small: true, move: { axis: 'y', speed: 55, range: 50 } },
    { x: 275, y: 385, color: 0xff3333, points: 480, small: true, move: { axis: 'y', speed: 58, range: 50, phaseOffset: 1.0 } }
  ]},

  // ── Level 74: 4 small karma ───────────────────────────────────────────────
  { id: 74, cups: [
    { x: 120, y: 205, color: 0x00ee55, points: 400, small: true, move: { axis: 'x', speed: 55, range: 32 } },
    { x: 270, y: 205, color: 0xff3333, points: 450, small: true, move: { axis: 'x', speed: 58, range: 28, phaseOffset: 0.8 } },
    { x: 120, y: 415, color: 0xffcc00, points: 430, small: true, move: { axis: 'y', speed: 52, range: 48 } },
    { x: 270, y: 415, color: 0x44aaff, points: 480, small: true, move: { axis: 'y', speed: 56, range: 48, phaseOffset: 1.2 } }
  ]},

  // ── Level 75: 5 sabit farklı boyut ───────────────────────────────────────
  { id: 75, cups: [
    { x: 195, y: 185, color: 0xff6600, points: 600 },
    { x: 100, y: 295, color: 0x00ee55, points: 350, small: true },
    { x: 290, y: 295, color: 0xff3333, points: 400, small: true },
    { x: 140, y: 420, color: 0xffcc00, points: 450, small: true },
    { x: 250, y: 420, color: 0x44aaff, points: 450, small: true }
  ]},

  // ── Level 76: 6 hareketli yoğun ──────────────────────────────────────────
  { id: 76, cups: [
    { x: 100, y: 195, color: 0x00ee55, points: 350, move: { axis: 'x', speed: 48, range: 22 } },
    { x: 195, y: 195, color: 0xff3333, points: 400, move: { axis: 'y', speed: 52, range: 45 } },
    { x: 290, y: 195, color: 0xffcc00, points: 450, move: { axis: 'x', speed: 45, range: 22, phaseOffset: 1.0 } },
    { x: 100, y: 415, color: 0x44aaff, points: 400, move: { axis: 'x', speed: 50, range: 22, phaseOffset: 0.5 } },
    { x: 195, y: 415, color: 0xff6600, points: 500, move: { axis: 'y', speed: 55, range: 45, phaseOffset: 1.2 } },
    { x: 290, y: 415, color: 0xcc44ff, points: 450, move: { axis: 'x', speed: 47, range: 22, phaseOffset: 1.8 } }
  ]},

  // ── Level 77: 3 gem sabit ────────────────────────────────────────────────
  { id: 77, cups: [
    { x: 120, y: 250, color: 0xcc44ff, points: 900, isGem: true },
    { x: 270, y: 250, color: 0xcc44ff, points: 900, isGem: true },
    { x: 195, y: 415, color: 0xcc44ff, points: 900, isGem: true }
  ]},

  // ── Level 78: 5 small tüm hareketli ──────────────────────────────────────
  { id: 78, cups: [
    { x: 195, y: 185, color: 0xff6600, points: 550, small: true, move: { axis: 'x', speed: 62, range: 65 } },
    { x: 100, y: 290, color: 0x00ee55, points: 420, small: true, move: { axis: 'y', speed: 55, range: 48 } },
    { x: 290, y: 290, color: 0xff3333, points: 470, small: true, move: { axis: 'y', speed: 58, range: 48, phaseOffset: 1.0 } },
    { x: 130, y: 415, color: 0xffcc00, points: 440, small: true, move: { axis: 'x', speed: 52, range: 38 } },
    { x: 260, y: 415, color: 0x44aaff, points: 440, small: true, move: { axis: 'x', speed: 56, range: 38, phaseOffset: 1.4 } }
  ]},

  // ── Level 79: 4 cup yüksek hız ───────────────────────────────────────────
  { id: 79, cups: [
    { x: 195, y: 190, color: 0xff6600, points: 600, move: { axis: 'x', speed: 72, range: 70 } },
    { x: 100, y: 310, color: 0x00ee55, points: 450, small: true, move: { axis: 'y', speed: 65, range: 52 } },
    { x: 290, y: 310, color: 0xff3333, points: 500, small: true, move: { axis: 'y', speed: 68, range: 52, phaseOffset: 0.9 } },
    { x: 195, y: 430, color: 0xcc44ff, points: 1000, isGem: true, small: true, move: { axis: 'x', speed: 60, range: 55 } }
  ]},

  // ── Level 80: MEGA BOSS — 8 cup, 3 gem, ultra hız ────────────────────────
  { id: 80, cups: [
    { x: 195, y: 175, color: 0xff6600, points: 700, move: { axis: 'x', speed: 75, range: 65 } },
    { x: 100, y: 245, color: 0x00ee55, points: 500, small: true, move: { axis: 'y', speed: 65, range: 48 } },
    { x: 290, y: 245, color: 0xff3333, points: 550, small: true, move: { axis: 'y', speed: 70, range: 48, phaseOffset: 1.0 } },
    { x: 100, y: 340, color: 0xffcc00, points: 500, small: true, move: { axis: 'x', speed: 60, range: 22 } },
    { x: 290, y: 340, color: 0x44aaff, points: 500, small: true, move: { axis: 'x', speed: 63, range: 22, phaseOffset: 0.8 } },
    { x: 145, y: 420, color: 0xcc44ff, points: 1000, isGem: true, small: true, move: { axis: 'x', speed: 68, range: 42 } },
    { x: 245, y: 420, color: 0xcc44ff, points: 1000, isGem: true, small: true, move: { axis: 'x', speed: 64, range: 38, phaseOffset: 1.3 } },
    { x: 195, y: 445, color: 0xcc44ff, points: 1000, isGem: true, small: true, move: { axis: 'y', speed: 58, range: 16, phaseOffset: 0.5 } }
  ]},

  // ════════════════════════════════════════════════════════
  // BÖLÜM 9 (81-90): Seri Atış — Çok Hedef
  // ════════════════════════════════════════════════════════

  // ── Level 81: 7 sabit grid ───────────────────────────────────────────────
  { id: 81, cups: [
    { x: 100, y: 200, color: 0x00ee55, points: 250 },
    { x: 195, y: 200, color: 0xff3333, points: 300 },
    { x: 290, y: 200, color: 0xffcc00, points: 350 },
    { x: 100, y: 310, color: 0x44aaff, points: 300 },
    { x: 290, y: 310, color: 0xff6600, points: 350 },
    { x: 100, y: 420, color: 0xff88ff, points: 350 },
    { x: 290, y: 420, color: 0xcc44ff, points: 450, isGem: true }
  ]},

  // ── Level 82: 4 small + 2 normal ─────────────────────────────────────────
  { id: 82, cups: [
    { x: 195, y: 185, color: 0xff6600, points: 500 },
    { x: 110, y: 285, color: 0x00ee55, points: 350, small: true, move: { axis: 'x', speed: 45, range: 28 } },
    { x: 280, y: 285, color: 0xff3333, points: 400, small: true, move: { axis: 'x', speed: 42, range: 28, phaseOffset: 1.0 } },
    { x: 110, y: 390, color: 0xffcc00, points: 380, small: true },
    { x: 280, y: 390, color: 0x44aaff, points: 380, small: true },
    { x: 195, y: 430, color: 0xcc44ff, points: 850, isGem: true }
  ]},

  // ── Level 83: 5 hareketli spiral ─────────────────────────────────────────
  { id: 83, cups: [
    { x: 195, y: 185, color: 0xff6600, points: 500, move: { axis: 'x', speed: 55, range: 65 } },
    { x: 105, y: 260, color: 0x00ee55, points: 380, move: { axis: 'y', speed: 48, range: 42 } },
    { x: 285, y: 330, color: 0xff3333, points: 420, move: { axis: 'y', speed: 52, range: 42, phaseOffset: 0.8 } },
    { x: 130, y: 400, color: 0xffcc00, points: 450, move: { axis: 'x', speed: 50, range: 38 } },
    { x: 270, y: 435, color: 0x44aaff, points: 430, move: { axis: 'x', speed: 47, range: 35, phaseOffset: 1.2 } }
  ]},

  // ── Level 84: 8 sabit yoğun ──────────────────────────────────────────────
  { id: 84, cups: [
    { x: 100, y: 195, color: 0x00ee55, points: 250, small: true },
    { x: 195, y: 195, color: 0xff3333, points: 300, small: true },
    { x: 290, y: 195, color: 0xffcc00, points: 350, small: true },
    { x: 100, y: 300, color: 0x44aaff, points: 300, small: true },
    { x: 290, y: 300, color: 0xff6600, points: 350, small: true },
    { x: 100, y: 415, color: 0xff88ff, points: 350, small: true },
    { x: 195, y: 415, color: 0xcc44ff, points: 850, isGem: true, small: true },
    { x: 290, y: 415, color: 0xff88ff, points: 350, small: true }
  ]},

  // ── Level 85: 3 hızlı büyük puan ─────────────────────────────────────────
  { id: 85, cups: [
    { x: 195, y: 200, color: 0xffcc00, points: 700, move: { axis: 'x', speed: 70, range: 70 } },
    { x: 120, y: 370, color: 0xff6600, points: 600, move: { axis: 'y', speed: 63, range: 55 } },
    { x: 270, y: 370, color: 0xff3333, points: 650, move: { axis: 'x', speed: 67, range: 55 } }
  ]},

  // ── Level 86: 6 cup karma boyut ──────────────────────────────────────────
  { id: 86, cups: [
    { x: 100, y: 200, color: 0x00ee55, points: 300 },
    { x: 290, y: 200, color: 0xff3333, points: 350 },
    { x: 150, y: 305, color: 0xffcc00, points: 450, small: true, move: { axis: 'x', speed: 50, range: 38 } },
    { x: 240, y: 305, color: 0x44aaff, points: 450, small: true, move: { axis: 'x', speed: 47, range: 38, phaseOffset: 1.0 } },
    { x: 100, y: 415, color: 0xff6600, points: 400, small: true },
    { x: 290, y: 415, color: 0xcc44ff, points: 900, isGem: true, small: true }
  ]},

  // ── Level 87: 4 diagonal hareketli ───────────────────────────────────────
  { id: 87, cups: [
    { x: 120, y: 205, color: 0x00ee55, points: 400, move: { axis: 'y', speed: 55, range: 50 } },
    { x: 270, y: 205, color: 0xff3333, points: 450, move: { axis: 'y', speed: 58, range: 50, phaseOffset: Math.PI } },
    { x: 120, y: 415, color: 0xffcc00, points: 430, move: { axis: 'x', speed: 52, range: 30 } },
    { x: 270, y: 415, color: 0x44aaff, points: 430, move: { axis: 'x', speed: 55, range: 30, phaseOffset: Math.PI } }
  ]},

  // ── Level 88: 7 small karma ───────────────────────────────────────────────
  { id: 88, cups: [
    { x: 100, y: 195, color: 0x00ee55, points: 350, small: true, move: { axis: 'x', speed: 48, range: 22 } },
    { x: 195, y: 195, color: 0xff3333, points: 400, small: true },
    { x: 290, y: 195, color: 0xffcc00, points: 420, small: true, move: { axis: 'x', speed: 45, range: 22, phaseOffset: 0.8 } },
    { x: 100, y: 310, color: 0x44aaff, points: 380, small: true },
    { x: 290, y: 310, color: 0xff6600, points: 400, small: true },
    { x: 145, y: 425, color: 0xff88ff, points: 430, small: true, move: { axis: 'y', speed: 50, range: 18 } },
    { x: 250, y: 425, color: 0xcc44ff, points: 950, isGem: true, small: true }
  ]},

  // ── Level 89: 5 cup zigzag hızlı ─────────────────────────────────────────
  { id: 89, cups: [
    { x: 100, y: 195, color: 0x00ee55, points: 400, small: true, move: { axis: 'x', speed: 58, range: 22 } },
    { x: 290, y: 255, color: 0xff3333, points: 450, small: true, move: { axis: 'y', speed: 62, range: 48 } },
    { x: 100, y: 315, color: 0xffcc00, points: 480, small: true, move: { axis: 'x', speed: 55, range: 22, phaseOffset: 0.6 } },
    { x: 290, y: 380, color: 0x44aaff, points: 450, small: true, move: { axis: 'y', speed: 60, range: 45, phaseOffset: 1.0 } },
    { x: 195, y: 435, color: 0xcc44ff, points: 1000, isGem: true, small: true }
  ]},

  // ── Level 90: MEGA BOSS — 9 cup, 3 gem ───────────────────────────────────
  { id: 90, cups: [
    { x: 195, y: 175, color: 0xff6600, points: 700, move: { axis: 'x', speed: 78, range: 65 } },
    { x: 100, y: 240, color: 0x00ee55, points: 500, small: true, move: { axis: 'y', speed: 68, range: 48 } },
    { x: 290, y: 240, color: 0xff3333, points: 550, small: true, move: { axis: 'y', speed: 72, range: 48, phaseOffset: 1.0 } },
    { x: 100, y: 320, color: 0xffcc00, points: 500, small: true, move: { axis: 'x', speed: 63, range: 22 } },
    { x: 290, y: 320, color: 0x44aaff, points: 500, small: true, move: { axis: 'x', speed: 66, range: 22, phaseOffset: 0.8 } },
    { x: 100, y: 415, color: 0xff88ff, points: 480, small: true, move: { axis: 'y', speed: 60, range: 42 } },
    { x: 290, y: 415, color: 0xff88ff, points: 480, small: true, move: { axis: 'y', speed: 58, range: 42, phaseOffset: 1.5 } },
    { x: 145, y: 445, color: 0xcc44ff, points: 1100, isGem: true, small: true, move: { axis: 'x', speed: 70, range: 38 } },
    { x: 250, y: 445, color: 0xcc44ff, points: 1100, isGem: true, small: true, move: { axis: 'x', speed: 65, range: 35, phaseOffset: 1.2 } }
  ]},

  // ════════════════════════════════════════════════════════
  // BÖLÜM 10 (91-100): MASTER — En Yüksek Zorluk
  // ════════════════════════════════════════════════════════

  // ── Level 91: Tek small ultra hızlı ──────────────────────────────────────
  { id: 91, cups: [
    { x: 195, y: 305, color: 0xff6600, points: 800, small: true, move: { axis: 'x', speed: 88, range: 100 } }
  ]},

  // ── Level 92: 2 small zıt ultra ──────────────────────────────────────────
  { id: 92, cups: [
    { x: 195, y: 215, color: 0x00ee55, points: 600, small: true, move: { axis: 'x', speed: 82, range: 88 } },
    { x: 195, y: 395, color: 0xff3333, points: 650, small: true, move: { axis: 'x', speed: 85, range: 88, phaseOffset: Math.PI } }
  ]},

  // ── Level 93: 3 small ultra ───────────────────────────────────────────────
  { id: 93, cups: [
    { x: 195, y: 185, color: 0xffcc00, points: 700, small: true, move: { axis: 'x', speed: 75, range: 68 } },
    { x: 108, y: 385, color: 0x00ee55, points: 550, small: true, move: { axis: 'y', speed: 70, range: 55 } },
    { x: 282, y: 385, color: 0xff3333, points: 600, small: true, move: { axis: 'y', speed: 73, range: 55, phaseOffset: 1.0 } }
  ]},

  // ── Level 94: 4 small çapraz ultra ────────────────────────────────────────
  { id: 94, cups: [
    { x: 115, y: 205, color: 0x00ee55, points: 550, small: true, move: { axis: 'x', speed: 68, range: 28 } },
    { x: 275, y: 205, color: 0xff3333, points: 600, small: true, move: { axis: 'x', speed: 72, range: 26, phaseOffset: 0.8 } },
    { x: 115, y: 415, color: 0xffcc00, points: 580, small: true, move: { axis: 'y', speed: 65, range: 50 } },
    { x: 275, y: 415, color: 0x44aaff, points: 580, small: true, move: { axis: 'y', speed: 68, range: 50, phaseOffset: 1.2 } }
  ]},

  // ── Level 95: 5 hep small, yüksek hız ────────────────────────────────────
  { id: 95, cups: [
    { x: 195, y: 185, color: 0xff6600, points: 700, small: true, move: { axis: 'x', speed: 80, range: 68 } },
    { x: 100, y: 280, color: 0x00ee55, points: 550, small: true, move: { axis: 'y', speed: 72, range: 50 } },
    { x: 290, y: 280, color: 0xff3333, points: 600, small: true, move: { axis: 'y', speed: 75, range: 50, phaseOffset: 1.0 } },
    { x: 130, y: 415, color: 0xffcc00, points: 580, small: true, move: { axis: 'x', speed: 68, range: 38 } },
    { x: 260, y: 415, color: 0x44aaff, points: 580, small: true, move: { axis: 'x', speed: 70, range: 35, phaseOffset: 1.3 } }
  ]},

  // ── Level 96: 6 cup, 2 gem, tüm hareketli ────────────────────────────────
  { id: 96, cups: [
    { x: 195, y: 185, color: 0xff6600, points: 700, move: { axis: 'x', speed: 78, range: 68 } },
    { x: 100, y: 270, color: 0x00ee55, points: 500, small: true, move: { axis: 'y', speed: 68, range: 48 } },
    { x: 290, y: 270, color: 0xff3333, points: 550, small: true, move: { axis: 'y', speed: 72, range: 48, phaseOffset: 0.9 } },
    { x: 130, y: 385, color: 0xffcc00, points: 520, small: true, move: { axis: 'x', speed: 65, range: 38 } },
    { x: 165, y: 445, color: 0xcc44ff, points: 1200, isGem: true, small: true, move: { axis: 'x', speed: 74, range: 48 } },
    { x: 240, y: 445, color: 0xcc44ff, points: 1200, isGem: true, small: true, move: { axis: 'y', speed: 62, range: 18, phaseOffset: 0.5 } }
  ]},

  // ── Level 97: 7 small tüm hareketli ──────────────────────────────────────
  { id: 97, cups: [
    { x: 195, y: 180, color: 0xff6600, points: 700, small: true, move: { axis: 'x', speed: 82, range: 65 } },
    { x: 100, y: 245, color: 0x00ee55, points: 520, small: true, move: { axis: 'y', speed: 72, range: 46 } },
    { x: 290, y: 245, color: 0xff3333, points: 570, small: true, move: { axis: 'y', speed: 76, range: 46, phaseOffset: 1.0 } },
    { x: 100, y: 330, color: 0xffcc00, points: 520, small: true, move: { axis: 'x', speed: 67, range: 22 } },
    { x: 290, y: 330, color: 0x44aaff, points: 520, small: true, move: { axis: 'x', speed: 70, range: 22, phaseOffset: 0.7 } },
    { x: 145, y: 420, color: 0xff88ff, points: 550, small: true, move: { axis: 'y', speed: 64, range: 18 } },
    { x: 250, y: 420, color: 0xcc44ff, points: 1300, isGem: true, small: true, move: { axis: 'x', speed: 78, range: 42 } }
  ]},

  // ── Level 98: 8 small ultra yoğun ────────────────────────────────────────
  { id: 98, cups: [
    { x: 100, y: 195, color: 0x00ee55, points: 500, small: true, move: { axis: 'x', speed: 65, range: 22 } },
    { x: 195, y: 195, color: 0xff3333, points: 550, small: true, move: { axis: 'y', speed: 70, range: 48 } },
    { x: 290, y: 195, color: 0xffcc00, points: 520, small: true, move: { axis: 'x', speed: 63, range: 22, phaseOffset: 0.8 } },
    { x: 100, y: 310, color: 0x44aaff, points: 520, small: true, move: { axis: 'y', speed: 68, range: 45, phaseOffset: 0.6 } },
    { x: 290, y: 310, color: 0xff6600, points: 560, small: true, move: { axis: 'y', speed: 72, range: 45, phaseOffset: 1.3 } },
    { x: 100, y: 430, color: 0xff88ff, points: 520, small: true, move: { axis: 'x', speed: 67, range: 22, phaseOffset: 1.0 } },
    { x: 250, y: 430, color: 0xcc44ff, points: 1300, isGem: true, small: true, move: { axis: 'x', speed: 76, range: 38 } },
    { x: 195, y: 445, color: 0xff88ff, points: 540, small: true, move: { axis: 'y', speed: 62, range: 16, phaseOffset: 1.7 } }
  ]},

  // ── Level 99: 9 cup kaos ─────────────────────────────────────────────────
  { id: 99, cups: [
    { x: 195, y: 175, color: 0xff6600, points: 750, small: true, move: { axis: 'x', speed: 85, range: 65 } },
    { x: 100, y: 240, color: 0x00ee55, points: 550, small: true, move: { axis: 'y', speed: 75, range: 46 } },
    { x: 290, y: 240, color: 0xff3333, points: 600, small: true, move: { axis: 'y', speed: 78, range: 46, phaseOffset: 1.1 } },
    { x: 100, y: 318, color: 0xffcc00, points: 550, small: true, move: { axis: 'x', speed: 70, range: 22 } },
    { x: 290, y: 318, color: 0x44aaff, points: 550, small: true, move: { axis: 'x', speed: 73, range: 22, phaseOffset: 0.7 } },
    { x: 100, y: 405, color: 0xff88ff, points: 530, small: true, move: { axis: 'y', speed: 67, range: 40 } },
    { x: 290, y: 405, color: 0xff88ff, points: 530, small: true, move: { axis: 'y', speed: 65, range: 40, phaseOffset: 1.4 } },
    { x: 148, y: 445, color: 0xcc44ff, points: 1400, isGem: true, small: true, move: { axis: 'x', speed: 80, range: 38 } },
    { x: 248, y: 445, color: 0xcc44ff, points: 1400, isGem: true, small: true, move: { axis: 'y', speed: 68, range: 16, phaseOffset: 0.5 } }
  ]},

  // ── Level 100: ULTIMATE BOSS — 10 cup, 3 gem, max kaos ───────────────────
  { id: 100, cups: [
    { x: 195, y: 175, color: 0xff6600, points: 800, move: { axis: 'x', speed: 90, range: 68 } },
    { x: 100, y: 238, color: 0x00ee55, points: 600, small: true, move: { axis: 'y', speed: 78, range: 46 } },
    { x: 290, y: 238, color: 0xff3333, points: 650, small: true, move: { axis: 'y', speed: 82, range: 46, phaseOffset: 1.0 } },
    { x: 100, y: 308, color: 0xffcc00, points: 600, small: true, move: { axis: 'x', speed: 73, range: 22 } },
    { x: 290, y: 308, color: 0x44aaff, points: 600, small: true, move: { axis: 'x', speed: 76, range: 22, phaseOffset: 0.8 } },
    { x: 100, y: 385, color: 0xff88ff, points: 580, small: true, move: { axis: 'y', speed: 70, range: 40 } },
    { x: 290, y: 385, color: 0xff88ff, points: 580, small: true, move: { axis: 'y', speed: 68, range: 40, phaseOffset: 1.5 } },
    { x: 145, y: 440, color: 0xcc44ff, points: 1500, isGem: true, small: true, move: { axis: 'x', speed: 84, range: 38 } },
    { x: 245, y: 440, color: 0xcc44ff, points: 1500, isGem: true, small: true, move: { axis: 'x', speed: 80, range: 35, phaseOffset: 1.2 } },
    { x: 195, y: 448, color: 0xcc44ff, points: 1500, isGem: true, small: true, move: { axis: 'y', speed: 72, range: 14, phaseOffset: 0.5 } }
  ]}
];
