# CupBounce — Devir Teslim Dökümanı v3
**Tarih:** 2026-04-07  
**Durum:** Geliştirme tamamlandı → Play Store yükleme aşaması

---

## 1. PROJE NEDİR

**Cup Bounce**, yay (bow) ile top atarak bardaklara (cup) gol yapılan, portré modunda oynanan bir mobil beceri oyunudur.

- Platform: Android (öncelikli) + iOS (sonraki aşama)
- Motor: Phaser 3.60 (canvas tabanlı, bundler yok)
- Wrapper: Capacitor 6 (WebView → native APK)
- Hedef kitle: Casual / Hyper-casual
- Dil: Türkçe (UI) — İngilizce (store metadata)
- Canvas boyutu: 390 × 844 px (iPhone 14 Pro viewport, FIT scale ile her ekrana uyar)
- Ekonomi modeli: Freemium — top (can), ödüllü reklam, gem, coin
- GitHub: https://github.com/GmzGnc/cup-bounce
- Bilgisayar: Windows 10, kullanıcı adı `GAMZE`
- Java (JAVA_HOME): `C:\Program Files\Android\Android Studio\jbr`

---

## 2. TEKNİK STACK

| Bileşen | Versiyon / Detay |
|---|---|
| Phaser | 3.60.0 — `www/lib/phaser.min.js` (local, CDN yok) |
| Capacitor | 6.2.1 (`@capacitor/cli`) |
| @capacitor/core | ^6.0.0 |
| @capacitor/android | ^6.0.0 |
| @capacitor/app | ^6.0.3 (arka plan/ön plan yönetimi) |
| @capacitor/local-notifications | ^6.1.3 (push bildirim) |
| Node.js | v24.13.0 |
| npm | 11.6.2 |
| Android Gradle Plugin | Capacitor 6 default |
| Min SDK | 22 (Android 5.1+) |
| Target SDK | 34 (Android 14) |
| Fizik motoru | Phaser Arcade Physics (gravity per-body) |
| Ses | Web Audio API — procedural (oscillator/gain, bundler yok) |
| Veri kalıcılığı | localStorage (tüm ekonomi, ayarlar, ilerleme) |
| Bundler | YOK — native ES modules (`type="module"`) |
| Test sunucusu | `npx serve . -p 8080` veya `python -m http.server 8080` |

---

## 3. KLASÖR YAPISI

```
CupBounce/                          ← proje kökü
├── package.json                    ← Capacitor bağımlılıkları
├── capacitor.config.json           ← appId, webDir, plugin ayarları
├── gen_icons.py                    ← Python/Pillow ile ikon üretici
├── CupBounce_GDD_v1.0.docx        ← Oyun tasarım dökümanı
│
├── www/                            ← web kaynak (Capacitor'ın webDir'i)
│   ├── index.html                  ← giriş noktası
│   ├── manifest.json               ← PWA manifest
│   ├── lib/
│   │   └── phaser.min.js           ← Phaser 3.60.0 (1.2 MB, local)
│   │
│   ├── src/
│   │   ├── main.js                 ← Phaser config + AppLifecycleManager
│   │   │
│   │   ├── data/
│   │   │   └── levels.js           ← 50 level tanımı (cups, speed, bonus)
│   │   │
│   │   ├── objects/
│   │   │   ├── Ball.js             ← top fiziği, trail efekti
│   │   │   ├── Bow.js              ← yay, drag/release mekaniği
│   │   │   └── Cup.js              ← bardak, hareket, skor algılama
│   │   │
│   │   ├── managers/
│   │   │   ├── AdManager.js        ← mock ödüllü/araya giren reklam
│   │   │   ├── AppLifecycleManager.js ← arka plan/ön plan donma çözümü
│   │   │   ├── BoosterManager.js   ← güçlendirici sistemi
│   │   │   ├── EconomyManager.js   ← top/coin/gem, localStorage
│   │   │   ├── LeaderboardManager.js ← skor kaydetme, mock global/haftalık/arkadaş
│   │   │   ├── LevelManager.js     ← level ilerleme, kaydetme
│   │   │   ├── MissionManager.js   ← günlük/haftalık görev sistemi
│   │   │   ├── NotificationManager.js ← Capacitor LocalNotifications wrapper
│   │   │   └── SoundManager.js     ← 6 SFX + arkaplan müziği (Web Audio API)
│   │   │
│   │   └── scenes/
│   │       ├── BootScene.js        ← splash (1.5s), localStorage önbellek
│   │       ├── AuthScene.js        ← mock Google giriş + Misafir seçeneği
│   │       ├── TutorialScene.js    ← 5 adımlı ilk oyuncu rehberi
│   │       ├── GameScene.js        ← ana oyun döngüsü
│   │       ├── UIScene.js          ← HUD (skor/top/timer/butonlar)
│   │       ├── ShopScene.js        ← mağaza (top, booster, reklam sekmesi)
│   │       ├── MissionScene.js     ← görevler paneli
│   │       ├── BuildScene.js       ← inşa/meta harita (6 alan)
│   │       └── LeaderboardScene.js ← skor tablosu (3 sekme)
│   │
│   └── store/                      ← Google Play metadata
│       ├── description_tr.txt      ← TR açıklama (2860/4000 karakter)
│       ├── description_en.txt      ← EN açıklama (3036/4000 karakter)
│       ├── release_notes_tr.txt    ← Sürüm notları TR
│       ├── release_notes_en.txt    ← Sürüm notları EN
│       └── keywords.txt            ← ASO anahtar kelimeler
│
└── android/                        ← Capacitor Android projesi
    └── app/src/main/
        ├── AndroidManifest.xml     ← izinler, receiver
        ├── java/com/cupbounce/game/
        │   └── MainActivity.java   ← onResume/onPause WebView yönetimi
        └── res/
            ├── mipmap-mdpi/        ← 48×48
            ├── mipmap-hdpi/        ← 72×72
            ├── mipmap-xhdpi/       ← 96×96
            ├── mipmap-xxhdpi/      ← 144×144
            └── mipmap-xxxhdpi/     ← 192×192
                (ic_launcher.png + ic_launcher_round.png her boyutta)
```

---

## 4. TAMAMLANAN AŞAMALAR

### 4.1 Temel Oyun Mekaniği
- Yay ile sürükle-bırak atış sistemi (Bow.js)
- Arcade Physics tabanlı top fiziği, duvar sekme (Ball.js)
- Bardak gol algılama, hareketli bardaklar (Cup.js)
- 10 saniyelik hedefleme zamanlayıcısı
- Oyun durumları: IDLE → FLYING → SCORING/RESETTING → TRANSITION → OVER

### 4.2 50 Level Sistemi
- `www/src/data/levels.js` içinde 50 level tanımı
- Her level: bardak sayısı, hız çarpanı, bonus koşulları
- Bardak hızı %45 düşürüldü (oynanabilirlik dengesi)
- Level geçişinde animasyonlu ekran + ses
- LevelManager localStorage'a kaydeder

### 4.3 Meta / İnşa Sistemi (BuildScene)
- 6 adet kilidli alan — coin ile açılır
- Her alan görsel olarak haritada belirir
- Açılışta `playBuildUnlock()` ses efekti
- Açılan alanlar EconomyManager'a kaydedilir

### 4.4 Auth Sistemi (AuthScene)
- Mock Google Giriş butonu (rastgele isim atar)
- Misafir olarak devam seçeneği
- Kullanıcı bilgisi `cupbounce_user` key'i ile localStorage'a yazılır
- `AuthScene.getUser()` / `AuthScene.clearUser()` statik yardımcılar
- Giriş sonrası: ilk oyunculara TutorialScene, dönen oyunculara GameScene

### 4.5 Reklam Sistemi — Mock (AdManager)
- `showRewardedAd(onReward)` — 3 saniyelik geri sayımlı overlay
- `showInterstitialAd(onComplete)` — 2 saniyelik overlay
- Her 5 levelde bir araya giren reklam otomatik tetiklenir
- ShopScene'de "REKLAM" sekmesi: izle → gem kazan
- UIScene'de hızlı reklam butonu
- GameScene Game Over ekranında reklam butonu

### 4.6 Ses Sistemi (SoundManager)
- **6 SFX** — hepsi Web Audio API oscillator ile procedural üretilir:
  - `playShoot()` — sawtooth + bandpass sweep
  - `playHit()` — üç katmanlı sine tonu
  - `playMiss()` — triangle dalga düşüş
  - `playLevelUp()` — C4-E4-G4-C5 arpej
  - `playGem()` — LFO vibratosu ile parlak ses
  - `playBuildUnlock()` — 6 notlu C majör yay
- **Arkaplan müziği** — D minör pentatonik, lookahead scheduler (`setInterval` + `AudioContext.currentTime`)
- Müzik GameScene uyurken (ShopScene/BuildScene overlay'i) kesintisiz devam eder
- SFX ve müzik ayrı ayrı açılıp kapatılabilir (UIScene toggle)
- Ayarlar `cupbounce_sound` key'i ile localStorage'a kaydedilir

### 4.7 Tutorial / Onboarding (TutorialScene)
- 5 adımlı interaktif rehber (ilk oyunda otomatik gösterilir)
- Her adım: balon panel + ok animasyonu + eylem bekleme (`drag`/`tap`/`hit`)
- `TutorialScene.isDone()` statik kontrol — diğer scene'lerden erişilebilir
- Tamamlandıktan sonra `cupbounce_tutorial_done = true` kaydedilir
- UIScene'de ❓ butonu ile tekrar oynatılabilir

### 4.8 Skor Tablosu (LeaderboardScene + LeaderboardManager)
- 3 sekme: GENEL | HAFTALIK | ARKADAŞLAR
- Animasyonlu satır giriş efekti (Back.easeOut, 55ms stagger)
- Kendi satırı altın rengi + "SEN" etiketi + sabitlenmiş sıra bilgisi
- Mock verisi 10 global/haftalık + 4 arkadaş oyuncu
- Skor `cupbounce_scores` (top-10), level `cupbounce_player_level` kaydedilir

### 4.9 Uygulama İkonları
- `gen_icons.py` (Python + Pillow) — 5 mipmap boyutunda üretir
- mdpi(48), hdpi(72), xhdpi(96), xxhdpi(144), xxxhdpi(192)
- Kare + yuvarlak (`ic_launcher.png` + `ic_launcher_round.png`) her boyutta
- Koyu lacivert → mor gradient arka plan, "CB" harfleri

### 4.10 Store Metinleri (`www/store/`)
- TR + EN açıklama (4000 karakter limitinin altında)
- Sürüm notları TR + EN (500 karakter limitinin altında)
- ASO anahtar kelimeler + rakip analizi (`keywords.txt`)

### 4.11 Bildirim Sistemi (NotificationManager)
- Capacitor `@capacitor/local-notifications` wrapper
- ID 1: Günlük hatırlatma — her gün 10:00 (tekrarlı)
- ID 2: Top yenileme — toplar bitince +4 saat sonra
- ID 3: Hareketsizlik — son oyundan 48 saat sonra
- Tarayıcıda sessizce devre dışı (`isNativePlatform()` kontrolü)
- AndroidManifest: `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`

### 4.12 Arka Plan Donma Sorunu Çözümü
**Sorun:** Uygulama arka plana geçip dönünce Phaser loop ve AudioContext donuyordu.

**Uygulanan çözümler (katmanlı):**

| Katman | Dosya | Çözüm |
|---|---|---|
| JS — çift listener | AppLifecycleManager.js | `visibilitychange` + Capacitor `appStateChange` + `window focus/blur` |
| JS — kademeli wake | AppLifecycleManager.js | 100ms + 400ms `setTimeout` ile `resume()` + `loop.wake()` |
| JS — AudioContext | AppLifecycleManager.js | `game.sound.context.resume()` |
| JS — loop motoru | main.js | `fps.forceSetTimeOut: true` (RAF yerine setTimeout) |
| Java — WebView | MainActivity.java | `onResume()` → `wv.resumeTimers()` + `evaluateJavascript focus` |
| Java — erişim | MainActivity.java | `protected` → `public` override |

### 4.13 Performans Optimizasyonları
- Phaser CDN → local (`www/lib/phaser.min.js`) — internet bağlantısı gerektirmez
- `antialias: false` — mobilde subpixel blending devre dışı
- `powerPreference: 'high-performance'` — GPU renderer isteği
- `roundPixels: true` — AA olmadan keskin kenarlar
- `disableContextMenu: true` — uzun basış menüsü engellendi
- BootScene `preload()` — tüm localStorage anahtarları tek seferde `window.CupBounceCache`'e okunur
- Splash süresi 2200ms → 1500ms

### 4.14 GitHub'a Yükleme
- Repo: https://github.com/GmzGnc/cup-bounce
- Son commit hash: `7423525`
- `.gitignore` oluşturuldu (`node_modules/`, `android/build/`, `*.keystore`, `*.jks`, `local.properties`, `android/.gradle/`)

---

## 5. SIRADAKI GÖREVLER

### Acil (APK için)
- [x] ~~**GitHub'a yükle**~~ — TAMAMLANDI (https://github.com/GmzGnc/cup-bounce, commit: 7423525)
- [ ] **Release APK al** — imzalı keystore ile (`gradlew.bat assembleRelease` veya Android Studio → Generate Signed APK) — **ACIL**
- [ ] **APK cihazda test** — `adb install` ile yükle, arka plan testi yap

### Play Store
- [ ] **Google Play Console hesabı aç** — tek seferlik $25 kayıt ücreti (play.google.com/console)
- [ ] **Uygulama oluştur** — `com.cupbounce.game`, Türkiye + Global pazar
- [ ] **Store listeleme doldur** — `www/store/` içindeki metinleri yapıştır
- [ ] **Ekran görüntüleri** — en az 2 telefon ekranı (1080×1920 veya 1080×2340)
- [ ] **Uygulama ikonu yükle** — 512×512 px PNG (şeffaf olmayan arka plan)
- [ ] **Internal Test → Closed Beta → Production**

### Teknik Borç
- [ ] **Bildirim sistemi gerçek entegrasyonu** — `@capacitor/local-notifications` gerçek izin akışı
- [ ] **Firebase Auth gerçek entegrasyonu** — `firebase-app` + `firebase-auth` SDK, Google Sign-In gerçek akışı
- [ ] **AdMob gerçek entegrasyonu** — `@capacitor-community/admob` paketi, gerçek reklam ID'leri
- [ ] **iOS build** — MacinCloud veya EAS Build (Mac gerekmez), `npx cap open ios` ile XCode
- [ ] **Çökme raporlama** — Firebase Crashlytics veya Sentry

---

## 6. ÖNEMLİ KOMUTLAR

```bash
# Geliştirme sunucusu başlat (www/ klasöründe)
cd www && npx serve . -p 8080
# veya
python -m http.server 8080

# Web asset'leri Android'e kopyala + plugin güncelle
npx cap sync

# Android Studio'yu aç
npx cap open android

# Debug APK doğrudan yükle (USB bağlı cihaz veya emülatör)
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Release APK yükle (imzalandıktan sonra)
adb install android/app/build/outputs/apk/release/app-release.apk

# Cihaz loglarını filtrele (hata ayıklama)
adb logcat | grep -i "cupbounce\|chromium\|phaser"

# Keystore oluştur (bir kez yapılır, güvende sakla)
keytool -genkey -v -keystore cupbounce.keystore \
  -alias cupbounce -keyalg RSA -keysize 2048 -validity 10000

# Python ile ikon üret (Pillow gerekli: pip install Pillow)
python gen_icons.py

# GitHub
git add . && git commit -m "mesaj" && git push

# APK yükleme — adb PATH ayarı (CMD'de)
set PATH=%PATH%;C:\Users\GAMZE\AppData\Local\Android\Sdk\platform-tools
adb install -r android\app\build\outputs\apk\debug\app-debug.apk

# Build — CMD'de android klasöründe
cd C:\Users\GAMZE\Desktop\CupBounce\android
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
gradlew.bat assembleDebug
```

### Android Studio'da Release Build
1. `Build` → `Generate Signed Bundle / APK`
2. `APK` seç → Next
3. Keystore dosyasını seç, şifreyi gir
4. `release` build variant seç
5. `app/build/outputs/apk/release/app-release.apk` oluşur

---

## 7. KEYSTORE BİLGİSİ

> **UYARI:** Keystore henüz oluşturulmamıştır.

Keystore Play Store'a ilk yüklemeden önce oluşturulmalıdır. Bir kez belirlenen keystore **sonsuza dek kullanılmak zorundadır** — kaybedilirse uygulama güncellenemez (yeni paket adıyla sıfırdan başlamak gerekir).

**Yapılacaklar:**
1. Yukarıdaki `keytool` komutunu çalıştır
2. `cupbounce.keystore` dosyasını proje dışında güvenli bir yere kaydet (USB bellek, şifreli bulut)
3. Şifreyi şifre yöneticisine kaydet
4. `android/app/build.gradle` içine signing config ekle:

```groovy
android {
    signingConfigs {
        release {
            storeFile file('../../cupbounce.keystore')
            storePassword 'ŞİFRENİZ'
            keyAlias 'cupbounce'
            keyPassword 'ŞİFRENİZ'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
        }
    }
}
```

**Saklanmaması gerekenler (`.gitignore`'a ekle):**
```
*.keystore
*.jks
local.properties
android/.gradle/
android/app/build/
node_modules/
```

---

## localStorage Anahtar Referansı

| Anahtar | İçerik | Varsayılan |
|---|---|---|
| `cupbounce_user` | Kullanıcı objesi (uid, name, isGuest) | null |
| `cupbounce_economy` | — (EconomyManager ayrı key kullanır) | — |
| `cupbounce_balls` | Top sayısı | 100 |
| `cupbounce_coins` | Coin | 0 |
| `cupbounce_gems` | Gem | 0 |
| `cupbounce_build` | Açılan alan ID'leri (JSON array) | [] |
| `cupbounce_level` | Mevcut level | 1 |
| `cupbounce_scores` | Top-10 skor listesi (JSON) | [] |
| `cupbounce_player_level` | Leaderboard için level | 1 |
| `cupbounce_sound` | `{ sfx: bool, music: bool }` | her ikisi true |
| `cupbounce_tutorial_done` | "true" / null | null |
| `cupbounce_ad_watches` | Reklam izleme sayacı | 0 |
| `cupbounce_last_play` | Son oturum timestamp (ms) | 0 |
| `cupbounce_missions` | Görev durumu (JSON) | {} |
| `cupbounce_v` | Schema versiyonu | 2 |

---

*CupBounce_Handoff_v3.md — Son güncelleme: 2026-04-07*
