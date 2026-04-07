// ─── SoundManager ─────────────────────────────────────────────────────────────
// All audio is procedurally generated via Web Audio API — no external files.
//
// Architecture:
//   • SFX   — one-shot oscillator chains, created and auto-destroyed per call
//   • Music — lookahead scheduler (setInterval + Web Audio clock) so playback
//             continues even when Phaser scenes sleep (e.g. ShopScene overlay)

const PREFS_KEY = 'cupbounce_sound';

// ── Music constants ────────────────────────────────────────────────────────────
// D minor pentatonic: D3 F3 G3 A3 C4 D4 F4 G4 (Hz)
const SCALE   = [146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23, 392.00];
const PATTERN = [0, 2, 4, 5, 4, 2, 0, 3, 1, 3, 5, 4, 3, 2, 1, 0]; // index into SCALE
const BEAT_S  = 60 / 88 * 0.5;   // 8th-note duration at 88 BPM
const SCHED_AHEAD = 0.12;         // seconds scheduled ahead (look-ahead window)
const SCHED_TICK  = 28;           // scheduler interval in ms

export class SoundManager {
  /**
   * @param {Phaser.Scene} scene  A live Phaser scene (used for ctx resolution).
   *                              Can be updated via setScene() if the scene sleeps.
   */
  constructor(scene) {
    this._scene = scene;
    this._ctx   = null;

    const p = this._loadPrefs();
    this._sfxOn   = p.sfx;
    this._musicOn = p.music;

    // Music scheduler state
    this._musicRunning  = false;
    this._noteIndex     = 0;
    this._nextNoteTime  = 0;
    this._schedInterval = null;
    this._masterGain    = null;
    this._droneOscs     = [];

    this._initCtx();
  }

  // ── Context initialisation ───────────────────────────────────────────────────

  _initCtx() {
    try {
      // Prefer Phaser's shared context so it benefits from Phaser's resume logic
      const ps = this._scene.sound;
      if (ps && ps.context) {
        this._ctx = ps.context;
      } else {
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    } catch (e) {
      console.warn('[SoundManager] Web Audio unavailable:', e);
    }
  }

  /** Resume AudioContext after the first user gesture (browser autoplay policy). */
  _resume() {
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => {});
    }
  }

  // ── Preference persistence ────────────────────────────────────────────────────

  _loadPrefs() {
    try {
      const s = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
      return { sfx: s.sfx !== false, music: s.music !== false };
    } catch { return { sfx: true, music: true }; }
  }

  _savePrefs() {
    localStorage.setItem(PREFS_KEY, JSON.stringify({
      sfx:   this._sfxOn,
      music: this._musicOn,
    }));
  }

  isSFXOn()   { return this._sfxOn; }
  isMusicOn() { return this._musicOn; }

  /** Toggle SFX on/off. Returns new state. */
  toggleSFX() {
    this._sfxOn = !this._sfxOn;
    this._savePrefs();
    return this._sfxOn;
  }

  /** Toggle background music on/off. Returns new state. */
  toggleMusic() {
    this._musicOn = !this._musicOn;
    this._savePrefs();
    if (this._musicOn) { this._startMusic(); }
    else               { this._stopMusic();  }
    return this._musicOn;
  }

  /**
   * Call once on the first user interaction.
   * Starts music if the player has it enabled.
   */
  startIfEnabled() {
    this._resume();
    if (this._musicOn && !this._musicRunning) {
      this._startMusic();
    }
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────────

  destroy() {
    this._stopMusic();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // SFX
  // ═══════════════════════════════════════════════════════════════════════════════

  /** Yay sesi — sibilant downward whoosh. */
  playShoot() {
    if (!this._sfxOn || !this._ctx) return;
    this._resume();
    const ctx = this._ctx;
    const t   = ctx.currentTime;

    // Sawtooth filtered downward sweep
    const osc  = ctx.createOscillator();
    const filt = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.17);

    filt.type = 'bandpass';
    filt.frequency.setValueAtTime(700, t);
    filt.frequency.exponentialRampToValueAtTime(160, t + 0.17);
    filt.Q.value = 0.9;

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.19);

    osc.connect(filt);
    filt.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.21);
  }

  /** İsabet sesi — bright ding with harmonic. */
  playHit() {
    if (!this._sfxOn || !this._ctx) return;
    this._resume();
    const ctx = this._ctx;
    const t   = ctx.currentTime;

    const _tone = (freq, vol, dur, startDt = 0) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + startDt);

      gain.gain.setValueAtTime(0, t + startDt);
      gain.gain.linearRampToValueAtTime(vol, t + startDt + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + startDt + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + startDt);
      osc.stop(t + startDt + dur + 0.02);
    };

    _tone(880,  0.40, 0.32, 0);       // fundamental
    _tone(1760, 0.14, 0.14, 0);       // 2nd harmonic — brightness
    _tone(520,  0.18, 0.12, 0.02);    // slight low body
  }

  /** Kaçırma sesi — dull low thud. */
  playMiss() {
    if (!this._sfxOn || !this._ctx) return;
    this._resume();
    const ctx = this._ctx;
    const t   = ctx.currentTime;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(170, t);
    osc.frequency.exponentialRampToValueAtTime(52, t + 0.24);

    gain.gain.setValueAtTime(0.42, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.30);
  }

  /** Level geçiş fanfarı — ascending C major arpeggio. */
  playLevelUp() {
    if (!this._sfxOn || !this._ctx) return;
    this._resume();
    const ctx = this._ctx;
    const t   = ctx.currentTime;

    // C4 E4 G4 C5 — staggered
    [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      const st  = t + i * 0.14;
      const dur = 0.55 - i * 0.03;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0, st);
      gain.gain.linearRampToValueAtTime(0.30, st + 0.012);
      gain.gain.setValueAtTime(0.30, st + dur * 0.55);
      gain.gain.exponentialRampToValueAtTime(0.0001, st + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(st);
      osc.stop(st + dur + 0.02);
    });
  }

  /** Gem toplama sesi — shimmering sparkle. */
  playGem() {
    if (!this._sfxOn || !this._ctx) return;
    this._resume();
    const ctx = this._ctx;
    const t   = ctx.currentTime;

    [1046.50, 1318.51, 1567.98].forEach((freq, i) => { // C6 E6 G6
      const osc    = ctx.createOscillator();
      const lfo    = ctx.createOscillator();
      const lfoAmt = ctx.createGain();
      const gain   = ctx.createGain();

      lfo.frequency.value  = 14;
      lfoAmt.gain.value    = 18;
      lfo.connect(lfoAmt);
      lfoAmt.connect(osc.frequency);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const st  = t + i * 0.08;
      const dur = 0.55;

      gain.gain.setValueAtTime(0, st);
      gain.gain.linearRampToValueAtTime(0.20, st + 0.009);
      gain.gain.exponentialRampToValueAtTime(0.0001, st + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      lfo.start(st);
      osc.start(st);
      osc.stop(st + dur + 0.02);
      lfo.stop(st + dur + 0.02);
    });
  }

  /** İnşa alanı açılış sesi — triumphant spread chord. */
  playBuildUnlock() {
    if (!this._sfxOn || !this._ctx) return;
    this._resume();
    const ctx = this._ctx;
    const t   = ctx.currentTime;

    // C major chord spreads then resolves to high C
    [
      { freq: 261.63, dt: 0.00, dur: 1.20, vol: 0.22, type: 'triangle' },
      { freq: 329.63, dt: 0.07, dur: 1.10, vol: 0.20, type: 'triangle' },
      { freq: 392.00, dt: 0.14, dur: 1.00, vol: 0.18, type: 'triangle' },
      { freq: 523.25, dt: 0.30, dur: 0.90, vol: 0.22, type: 'sine'     },
      { freq: 659.25, dt: 0.46, dur: 0.75, vol: 0.18, type: 'sine'     },
      { freq: 783.99, dt: 0.60, dur: 0.65, vol: 0.14, type: 'sine'     },
    ].forEach(({ freq, dt, dur, vol, type }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      const st = t + dt;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0, st);
      gain.gain.linearRampToValueAtTime(vol, st + 0.018);
      gain.gain.setValueAtTime(vol, st + dur * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, st + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(st);
      osc.stop(st + dur + 0.02);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // Background music — lookahead scheduler (Web Audio API clock, not Phaser timer)
  // Works correctly even when GameScene is put to sleep by overlay scenes.
  // ═══════════════════════════════════════════════════════════════════════════════

  _startMusic() {
    if (!this._ctx || this._musicRunning) return;
    this._resume();
    this._musicRunning = true;
    this._noteIndex    = 0;
    this._nextNoteTime = this._ctx.currentTime + 0.15;

    // ── Master gain (music sits below SFX) ──────────────────────────────────────
    this._masterGain = this._ctx.createGain();
    this._masterGain.gain.setValueAtTime(0, this._ctx.currentTime);
    this._masterGain.gain.linearRampToValueAtTime(0.055, this._ctx.currentTime + 1.5);
    this._masterGain.connect(this._ctx.destination);

    // ── Ambient drone: two detuned low oscillators ────────────────────────────
    this._droneOscs = [];
    [73.42, 73.88].forEach(freq => {   // D2 ± tiny detune
      const osc  = this._ctx.createOscillator();
      const gain = this._ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 1.0;
      osc.connect(gain);
      gain.connect(this._masterGain);
      osc.start();
      this._droneOscs.push({ osc, gain });
    });

    // ── Slow amplitude LFO on drone (breathing effect) ────────────────────────
    const lfo    = this._ctx.createOscillator();
    const lfoAmt = this._ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.10;   // one "breath" every ~10 seconds
    lfoAmt.gain.value   = 0.35;
    lfo.connect(lfoAmt);
    lfoAmt.connect(this._masterGain.gain);
    lfo.start();
    this._droneLFO = { osc: lfo, gain: lfoAmt };

    // ── Lookahead note scheduler (native setInterval, survives scene sleep) ────
    this._schedInterval = setInterval(() => this._tick(), SCHED_TICK);
  }

  _stopMusic() {
    if (!this._musicRunning) return;
    this._musicRunning = false;

    clearInterval(this._schedInterval);
    this._schedInterval = null;

    if (!this._ctx || !this._masterGain) return;

    // Fade out master gain before disconnecting
    const t = this._ctx.currentTime;
    try {
      this._masterGain.gain.cancelScheduledValues(t);
      this._masterGain.gain.setValueAtTime(this._masterGain.gain.value, t);
      this._masterGain.gain.linearRampToValueAtTime(0, t + 0.6);
    } catch {}

    setTimeout(() => {
      this._droneOscs.forEach(({ osc }) => { try { osc.stop(); } catch {} });
      if (this._droneLFO) { try { this._droneLFO.osc.stop(); } catch {} }
      try { this._masterGain.disconnect(); } catch {}
      this._droneOscs  = [];
      this._droneLFO   = null;
      this._masterGain = null;
    }, 700);
  }

  /** Called every SCHED_TICK ms; schedules notes inside the look-ahead window. */
  _tick() {
    if (!this._musicRunning || !this._ctx || !this._masterGain) return;

    while (this._nextNoteTime < this._ctx.currentTime + SCHED_AHEAD) {
      this._scheduleNote(this._nextNoteTime);
      this._nextNoteTime += BEAT_S;
      this._noteIndex = (this._noteIndex + 1) % PATTERN.length;
    }
  }

  _scheduleNote(time) {
    const freq = SCALE[PATTERN[this._noteIndex]] * 2;   // one octave up for melody
    const dur  = BEAT_S * 0.75;

    const osc  = this._ctx.createOscillator();
    const gain = this._ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.55, time + 0.010);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }
}
