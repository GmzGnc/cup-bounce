// ─── NotificationManager ──────────────────────────────────────────────────────
// Wraps @capacitor/local-notifications with graceful browser fallback.
//
// Plugin is accessed via the Capacitor bridge (window.Capacitor.Plugins)
// because the project uses plain ES modules without a bundler.
// When running in a desktop browser the plugin is absent and all calls
// are silently skipped — no errors thrown.
//
// Notification IDs
//   1 → daily reminder (repeating, 10:00 every day)
//   2 → ball-refill   (one-shot, fires 4 h after balls run out)
//   3 → inactivity    (one-shot, fires 48 h after last session)

const LAST_PLAY_KEY = 'cupbounce_last_play';

export class NotificationManager {
  constructor() {
    // Cache the plugin reference (may be null in browser)
    this._plugin = this._resolvePlugin();
    // Update last-play timestamp immediately on construction (= app open)
    this._touchLastPlay();
  }

  // ── Plugin resolution ──────────────────────────────────────────────────────

  _resolvePlugin() {
    try {
      // Capacitor bridge injects plugins after cap sync
      const cap = window.Capacitor;
      if (cap && cap.isNativePlatform && cap.isNativePlatform()) {
        return cap.Plugins?.LocalNotifications ?? null;
      }
    } catch {}
    return null;
  }

  _available() {
    return this._plugin !== null;
  }

  // ── Permission ─────────────────────────────────────────────────────────────

  /**
   * Ask the OS for notification permission.
   * Safe to call on every app start — OS shows dialog only once.
   */
  async requestPermission() {
    if (!this._available()) return;
    try {
      const result = await this._plugin.requestPermissions();
      console.log('[Notifications] permission:', result.display);
    } catch (e) {
      console.warn('[Notifications] requestPermission failed:', e);
    }
  }

  // ── Schedule helpers ────────────────────────────────────────────────────────

  /**
   * Daily reminder at 10:00 — repeating.
   * Safe to call multiple times; cancels the old one first.
   */
  async scheduleDaily() {
    if (!this._available()) return;
    try {
      await this._cancel([1]);
      await this._plugin.schedule({
        notifications: [{
          id:    1,
          title: 'Cup Bounce 🎯',
          body:  'Günlük görevlerin seni bekliyor! Topların yenilendi.',
          schedule: {
            on: { hour: 10, minute: 0 },
            repeats: true,
          },
          smallIcon:   'ic_stat_icon_config_sample',
          channelId:   'cup_bounce_default',
          sound:       null,
        }],
      });
    } catch (e) {
      console.warn('[Notifications] scheduleDaily failed:', e);
    }
  }

  /**
   * One-shot notification sent 4 hours after the player runs out of balls.
   * Tells them their "lives" are ready.
   */
  async scheduleBallRefill() {
    if (!this._available()) return;
    try {
      await this._cancel([2]);
      const fireAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // +4 h
      await this._plugin.schedule({
        notifications: [{
          id:    2,
          title: 'Cup Bounce 🏆',
          body:  '100 topun hazır! Oynamaya devam et.',
          schedule: { at: fireAt },
          smallIcon: 'ic_stat_icon_config_sample',
          channelId: 'cup_bounce_default',
          sound:     null,
        }],
      });
    } catch (e) {
      console.warn('[Notifications] scheduleBallRefill failed:', e);
    }
  }

  /**
   * One-shot notification 48 h from now.
   * Should be re-scheduled on every session (cancelled on app open via
   * cancelInactivity), so it only fires when the player truly goes quiet.
   */
  async scheduleInactivity() {
    if (!this._available()) return;
    try {
      await this._cancel([3]);
      const fireAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // +48 h
      await this._plugin.schedule({
        notifications: [{
          id:    3,
          title: 'Cup Bounce 😢',
          body:  'Seni özledik! Yeni görevler ve ödüller seni bekliyor.',
          schedule: { at: fireAt },
          smallIcon: 'ic_stat_icon_config_sample',
          channelId: 'cup_bounce_default',
          sound:     null,
        }],
      });
    } catch (e) {
      console.warn('[Notifications] scheduleInactivity failed:', e);
    }
  }

  /**
   * Cancel the inactivity notification — called when the player opens the app
   * so the 48-h clock resets.
   */
  async cancelInactivity() {
    if (!this._available()) return;
    try { await this._cancel([3]); } catch {}
  }

  /** Cancel ALL scheduled notifications. */
  async cancelAll() {
    if (!this._available()) return;
    try {
      await this._cancel([1, 2, 3]);
    } catch (e) {
      console.warn('[Notifications] cancelAll failed:', e);
    }
  }

  // ── Last-play tracking (localStorage) ────────────────────────────────────────

  _touchLastPlay() {
    localStorage.setItem(LAST_PLAY_KEY, String(Date.now()));
  }

  /** Returns hours since last play session (0 if unknown). */
  hoursSinceLastPlay() {
    const ts = parseInt(localStorage.getItem(LAST_PLAY_KEY) || '0', 10);
    if (!ts) return 0;
    return (Date.now() - ts) / (1000 * 60 * 60);
  }

  // ── Internal ──────────────────────────────────────────────────────────────────

  async _cancel(ids) {
    if (!this._plugin) return;
    await this._plugin.cancel({
      notifications: ids.map(id => ({ id })),
    });
  }
}
