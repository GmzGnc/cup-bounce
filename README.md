# Cup Bounce

Phaser 3 tabanlı mobil oyun. Yaydan top at, bardağa sok!

---

## Tarayıcıda Çalıştırma

```bash
cd CupBounce
py -m http.server 8080
```

Tarayıcıda aç: `http://localhost:8080`

---

## Capacitor ile Mobil Uygulama

### Gereksinimler

| Araç | Minimum Sürüm |
|------|---------------|
| Node.js | 18+ |
| npm | 9+ |
| Android Studio | Hedgehog+ (Android için) |
| Xcode | 15+ (iOS için, sadece macOS) |
| JDK | 17+ (Android için) |

---

### 1. Bağımlılıkları Yükle

```bash
cd CupBounce
npm install
```

---

### 2. Android Platformu Ekle

```bash
npx cap add android
```

> Bu komut `android/` klasörünü oluşturur.

---

### 3. iOS Platformu Ekle *(sadece macOS)*

```bash
npx cap add ios
```

> Bu komut `ios/` klasörünü oluşturur.

---

### 4. Web Dosyalarını Platforma Kopyala

Oyunda değişiklik yaptıktan sonra her zaman çalıştır:

```bash
npx cap sync
```

---

### 5. Android Studio ile Aç

```bash
npx cap open android
```

Android Studio açıldıktan sonra:
1. **Build → Make Project** ile derle
2. Emülatör veya gerçek cihaz seç
3. **Run** düğmesine bas (▶)

#### İlk Kurulumda Yapılacaklar (Android Studio)

- `File → Project Structure → SDK Location` → JDK ve Android SDK yolunu kontrol et
- `Tools → SDK Manager` → Android 13 (API 33) veya üstünü yükle
- Gerçek cihaz için: Telefonda **Geliştirici Seçenekleri → USB Hata Ayıklama**'yı aç

---

### 6. Xcode ile Aç *(sadece macOS)*

```bash
npx cap open ios
```

Xcode açıldıktan sonra:
1. **Signing & Capabilities** sekmesinde Team seç (Apple Developer hesabı gerekli)
2. Simülatör veya gerçek cihaz seç
3. **Run** düğmesine bas (▶)

---

### Geliştirme Döngüsü

```
oyunu düzenle → npx cap sync → Android Studio/Xcode'da run
```

---

### APK Oluşturma (Android)

Android Studio'da:
```
Build → Generate Signed Bundle / APK → APK → keystore oluştur → Release
```

Çıktı: `android/app/build/outputs/apk/release/app-release.apk`

---

### Proje Yapısı

```
CupBounce/
├── index.html              # Oyun giriş noktası
├── manifest.json           # PWA manifest
├── capacitor.config.json   # Capacitor ayarları
├── package.json            # npm bağımlılıkları
├── src/
│   ├── main.js             # Phaser oyun konfigürasyonu
│   ├── scenes/
│   │   ├── BootScene.js    # Giriş ekranı
│   │   ├── GameScene.js    # Ana oyun mantığı
│   │   ├── UIScene.js      # HUD (skor, top, gem, coin)
│   │   ├── ShopScene.js    # Mağaza ekranı
│   │   └── MissionScene.js # Günlük görevler
│   ├── objects/
│   │   ├── Bow.js          # Yay çizimi ve kontrol
│   │   ├── Ball.js         # Top fiziği
│   │   └── Cup.js          # Bardak çizimi ve çarpışma
│   ├── managers/
│   │   ├── EconomyManager.js  # Top / Coin / Gem
│   │   ├── LevelManager.js    # Level ilerlemesi
│   │   ├── BoosterManager.js  # Booster şarjları
│   │   └── MissionManager.js  # Günlük görevler
│   └── data/
│       └── levels.js       # 10 level tanımları
├── android/                # (npx cap add android sonrası)
└── ios/                    # (npx cap add ios sonrası, macOS)
```

---

### Sorun Giderme

**`npx cap sync` hatası — "webDir does not exist"**
> `capacitor.config.json` içindeki `"webDir": "."` değerinin doğru olduğundan emin ol.

**Android build hatası — SDK bulunamadı**
> Android Studio → `SDK Manager` → Android SDK yükle; `ANDROID_HOME` ortam değişkenini ayarla.

**iOS — "No profiles for ... were found"**
> Xcode → Preferences → Accounts → Apple ID ekle ve Manage Certificates.

**Beyaz ekran açılıyor**
> `android/app/src/main/res/xml/network_security_config.xml` dosyasını kontrol et; `allowMixedContent: true` capacitor.config.json'da olmalı.
