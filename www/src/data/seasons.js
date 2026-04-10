// ─── Season definitions ───────────────────────────────────────────────────────
// Her sezon için: id, name, icon, tarih aralığı, tema renkleri, bonus ödül
// Ramazan tarihleri dinamik olduğu için yıl bazlı tanımlanmıştır.

export const SEASONS = [
  {
    id:          'yilbasi',
    name:        'Yılbaşı',
    icon:        '\uD83C\uDF84',  // 🎄
    startMonth:  12, startDay: 1,
    endMonth:    1,  endDay:   7,
    theme: {
      bg:           0x040d1a,
      starColor:    0xaaddff,
      accentColor:  0x44aaff,
      gridColor:    0x0e1e3a,
      cupColors:    [0x2255aa, 0x3388ff, 0x88ccff, 0x0044cc, 0x66aaff],
      particleColor: 0xffffff,   // kar tanesi
    },
    bonus:       { type: 'gems',  amount: 5 },
    description: 'Karlı kış büyüsü!\nÖzel ödüller seni bekliyor.',
  },
  {
    id:          'sevgililer',
    name:        'Sevgililer G\u00FCn\u00FC',  // Sevgililer Günü
    icon:        '\u2764\uFE0F',               // ❤️
    startMonth:  2, startDay: 1,
    endMonth:    2, endDay:   21,
    theme: {
      bg:           0x1a040d,
      starColor:    0xff88aa,
      accentColor:  0xff4477,
      gridColor:    0x3a0e18,
      cupColors:    [0xff2255, 0xff66aa, 0xcc1144, 0xff4488, 0xaa0033],
      particleColor: 0xff4477,   // kalp kırmızısı
    },
    bonus:       { type: 'coins', amount: 200 },
    description: 'A\u015fk\u0131n rengi pembe!\nKalpler seninle.',  // Aşkın rengi pembe!
  },
  {
    id:           'ramazan',
    name:         'Ramazan',
    icon:         '\uD83C\uDF19',  // 🌙
    dynamicDates: [
      { year: 2025, startMonth: 3, startDay: 1,  endMonth: 3, endDay: 30 },
      { year: 2026, startMonth: 2, startDay: 18, endMonth: 3, endDay: 19 },
      { year: 2027, startMonth: 2, startDay: 7,  endMonth: 3, endDay: 8  },
    ],
    theme: {
      bg:           0x06060e,
      starColor:    0xffd700,
      accentColor:  0xffd700,
      gridColor:    0x1a1400,
      cupColors:    [0x4a3000, 0x7a5500, 0xaa8800, 0x886600, 0x553300],
      particleColor: 0xffd700,   // altın parıltısı
    },
    bonus:       { type: 'gems', amount: 3 },
    description: 'M\u00FCbarek Ramazan ay\u0131nda\n\u00F6zel \u00F6d\u00FCller!',  // Mübarek Ramazan...
  },
  {
    id:          'yaz',
    name:        'Yaz',
    icon:        '\uD83C\uDF0A',  // 🌊
    startMonth:  6, startDay: 1,
    endMonth:    8, endDay:   31,
    theme: {
      bg:           0x001525,
      starColor:    0x00eeff,
      accentColor:  0x00ccff,
      gridColor:    0x001e30,
      cupColors:    [0x0088cc, 0x00bbff, 0x0055aa, 0x00aaee, 0x0066cc],
      particleColor: 0x00ccff,   // su damlası
    },
    bonus:       { type: 'balls', amount: 10 },
    description: 'Yaz geldi!\nSu balonlar\u0131yla serin kal.',  // Su balonlarıyla...
  },
];
