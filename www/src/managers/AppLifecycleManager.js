// ─── AppLifecycleManager ─────────────────────────────────────────────────────
// Pauses the Phaser game loop when the app goes to background and resumes it
// when the app returns to foreground.
//
// Listens on two channels:
//   1. document.visibilitychange  — works in all browsers + Android WebView
//   2. Capacitor App.appStateChange — native-only; fires slightly earlier than
//      visibilitychange on some OEM builds where the WebView is throttled
//      before the DOM event fires.
//
// On resume:
//   - game.resume() resets the Phaser RAF loop so delta-time does NOT
//     accumulate during the sleep, preventing a single huge update frame.
//   - SoundManager.startIfEnabled() is called so the AudioContext is unlocked
//     (browsers / Android suspend it on background).

export class AppLifecycleManager {
  constructor(game) {
    this._game    = game;
    this._paused  = false;   // our own flag — avoids double-pause/resume

    this._onVis   = this._onVisibility.bind(this);
    document.addEventListener('visibilitychange', this._onVis);

    // 'focus' is dispatched by MainActivity.onResume() via evaluateJavascript
    // on OEM builds where visibilitychange fires late.
    this._onFocus = () => this._onShow();
    this._onBlur  = () => this._onHide();
    window.addEventListener('focus', this._onFocus);
    window.addEventListener('blur',  this._onBlur);

    this._capListener = null;
    this._attachCapacitor();
  }

  // ── Capacitor native listener ──────────────────────────────────────────────

  _attachCapacitor() {
    try {
      const cap = window.Capacitor;
      if (cap && cap.isNativePlatform && cap.isNativePlatform()) {
        const App = cap.Plugins?.App;
        if (App) {
          App.addListener('appStateChange', (state) => {
            if (state.isActive) this._onShow();
            else                this._onHide();
          })
          .then(h  => { this._capListener = h; })
          .catch(() => {});
        }
      }
    } catch {}
  }

  // ── Visibility API listener ────────────────────────────────────────────────

  _onVisibility() {
    if (document.visibilityState === 'hidden') this._onHide();
    else                                        this._onShow();
  }

  // ── Pause / Resume ─────────────────────────────────────────────────────────

  _onHide() {
    if (this._paused) return;
    this._paused = true;
    try { this._game.pause(); } catch {}
  }

  _onShow() {
    if (!this._paused) return;
    this._paused = false;

    // Önce kısa bekle, sonra resume
    setTimeout(() => {
      try {
        this._game.resume();
        this._game.loop.wake();
      } catch(e) {}
    }, 100);

    setTimeout(() => {
      try {
        this._game.resume();
        this._game.loop.wake();
        // AudioContext unlock
        if (this._game.sound && this._game.sound.context &&
            this._game.sound.context.state === 'suspended') {
          this._game.sound.context.resume();
        }
      } catch(e) {}
      // HUD yenile
      this._game.registry.set('forceRefresh', Date.now());
    }, 400);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  _resumeSounds() {
    try {
      const gs = this._game.scene.getScene('GameScene');
      if (gs && gs.sounds) gs.sounds.startIfEnabled();
    } catch {}
  }

  _syncEconomy() {
    try {
      const gs = this._game.scene.getScene('GameScene');
      if (gs && typeof gs._syncRegistry === 'function') {
        gs._syncRegistry();
      }
    } catch {}
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────

  destroy() {
    document.removeEventListener('visibilitychange', this._onVis);
    window.removeEventListener('focus', this._onFocus);
    window.removeEventListener('blur',  this._onBlur);
    if (this._capListener) {
      try { this._capListener.remove(); } catch {}
      this._capListener = null;
    }
  }
}
