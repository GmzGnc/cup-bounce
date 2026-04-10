// ─── FirebaseManager ──────────────────────────────────────────────────────────
// @capacitor-firebase/authentication ile Google Sign-In ve anonim (misafir) giriş.
//
// Native (Android/iOS): window.Capacitor.Plugins.FirebaseAuthentication
// Tarayıcı: Capacitor mevcut değilse → null döner, AuthScene mock'a düşer.
//
// Google Sign-In için Firebase Console'da yapılması gerekenler (tek seferlik):
//   1. Firebase Console → Authentication → Sign-in method → Google → Etkinleştir
//   2. Firebase Console → Project settings → Android app → SHA-1 parmak izini ekle
//      (keytool -list -v -keystore cupbounce.keystore → SHA1 satırı)
//   3. google-services.json'u yeniden indir → android/app/ altına koy
//   4. npx cap sync && gradlew assembleRelease
// ─────────────────────────────────────────────────────────────────────────────

export class FirebaseManager {

  // ── Dahili ──────────────────────────────────────────────────────────────────

  _plugin() {
    return window.Capacitor?.Plugins?.FirebaseAuthentication ?? null;
  }

  _isNative() {
    return window.Capacitor?.isNativePlatform?.() ?? false;
  }

  /** Firebase kullanıcısını uygulama user nesnesine dönüştürür. */
  _mapUser(fbUser, forceGuest = false) {
    if (!fbUser) return null;
    return {
      uid:         fbUser.uid,
      displayName: fbUser.displayName || (fbUser.isAnonymous ? 'Misafir' : 'Oyuncu'),
      email:       fbUser.email       || null,
      photoUrl:    fbUser.photoUrl    || null,
      isGuest:     forceGuest || fbUser.isAnonymous || false,
      loginTime:   Date.now(),
    };
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  /**
   * Google ile giriş yapar.
   * @returns {Promise<{uid, displayName, email, photoUrl, isGuest, loginTime}>}
   * @throws Firebase veya Google yapılandırması eksikse hata fırlatır.
   */
  async signInWithGoogle() {
    const plugin = this._plugin();
    if (!plugin) throw new Error('native_unavailable');

    const result = await plugin.signInWithGoogle();
    if (!result?.user) throw new Error('no_user_returned');

    return this._mapUser(result.user, false);
  }

  /**
   * Anonim (misafir) giriş yapar.
   * @returns {Promise<{uid, displayName, isGuest:true, loginTime}>}
   */
  async signInAnonymously() {
    const plugin = this._plugin();
    if (!plugin) throw new Error('native_unavailable');

    const result = await plugin.signInAnonymously();
    if (!result?.user) throw new Error('no_user_returned');

    return this._mapUser(result.user, true);
  }

  /**
   * Oturumu kapatır (Firebase + Capacitor plugin).
   */
  async signOut() {
    const plugin = this._plugin();
    if (!plugin) return;
    try { await plugin.signOut(); } catch {}
  }

  /**
   * Mevcut Firebase oturumunu döner ya da null.
   * Uygulama açılışında otomatik oturum kontrolü için kullanılır.
   */
  async getCurrentUser() {
    const plugin = this._plugin();
    if (!plugin) return null;
    try {
      const result = await plugin.getCurrentUser();
      if (!result?.user) return null;
      return this._mapUser(result.user, result.user.isAnonymous);
    } catch {
      return null;
    }
  }

  /** Native platform'da Firebase kullanılabilir mi? */
  isAvailable() {
    return this._isNative() && this._plugin() !== null;
  }
}
