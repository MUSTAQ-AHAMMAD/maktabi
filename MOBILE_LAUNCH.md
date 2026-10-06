# 📱 Maktabi Mobile — Launch Guide (Android & iOS)

Maktabi ships as a native mobile app via **Capacitor** — the same Next.js UI you see
on the web, wrapped in a native shell. This guide takes you from zero to an installable
app and a store submission.

> **Why "live-wrap"?** The app has data-driven detail screens (`/litigation/[id]`,
> `/invoices`, …). The most reliable way to ship these is to point the native shell at
> your **deployed web app** (`CAP_SERVER_URL`). Every module then works identically to
> the web, with no export refactor. An offline static bundle is possible later (see the
> last section).

---

## 1. One-time toolchain install (your machine)

Capacitor can't compile a native app without the platform SDKs. Install:

**Android**
- **JDK 17** — https://adoptium.net (Temurin 17). Confirm: `java -version` → `17.x`.
- **Android Studio** — https://developer.android.com/studio (includes the Android SDK).
  - On first run, let it install: *Android SDK Platform 34*, *SDK Build-Tools*, *Platform-Tools*.
  - Set env vars (Windows → "Edit the system environment variables"):
    - `ANDROID_HOME = C:\Users\<you>\AppData\Local\Android\Sdk`
    - Add to `PATH`: `%ANDROID_HOME%\platform-tools`

**iOS** (optional, requires a **Mac**)
- Xcode from the Mac App Store + CocoaPods (`sudo gem install cocoapods`).
- iOS cannot be built on Windows.

---

## 2. Point the app at your backend

The native shell loads your **deployed** web app. Pick the URL:

| Scenario | `CAP_SERVER_URL` |
|---|---|
| Production | `https://app.yourdomain.com` |
| Test on a real device (same Wi‑Fi as your PC) | `http://<your-PC-LAN-IP>:9000` |

Find your LAN IP on Windows: `ipconfig` → *IPv4 Address* (e.g. `192.168.1.20`).
Make sure the frontend (`:9000`) **and** backend (`:9001`) are reachable from the phone —
for LAN testing also set the frontend's `NEXT_PUBLIC_API_URL` to `http://<PC-LAN-IP>:9001`.

---

## 3. Add the native projects

From `frontend/`:

```bash
cd frontend
npm install

# Android
CAP_SERVER_URL=https://app.yourdomain.com npx cap add android
CAP_SERVER_URL=https://app.yourdomain.com npx cap sync android

# iOS (on a Mac only)
CAP_SERVER_URL=https://app.yourdomain.com npx cap add ios
CAP_SERVER_URL=https://app.yourdomain.com npx cap sync ios
```

> Re-run `npx cap sync` (with the same `CAP_SERVER_URL`) any time you change the config
> or update Capacitor plugins.

---

## 4. App icon & splash screen

A source icon is provided at `frontend/assets/icon.svg`. Generate all platform sizes:

```bash
cd frontend
# Export the SVG to a 1024×1024 PNG named assets/icon.png (any tool, e.g. Inkscape:)
#   inkscape assets/icon.svg -w 1024 -h 1024 -o assets/icon.png
# Optionally add assets/splash.png (2732×2732, logo centered on #1e3a5f).

npx @capacitor/assets generate --iconBackgroundColor '#1e3a5f' --splashBackgroundColor '#1e3a5f'
npx cap sync
```

This writes launcher icons and splash images into the `android/` (and `ios/`) projects.

---

## 5. Run & build

**Android (Android Studio):**
```bash
cd frontend
npx cap open android
```
- Press **Run ▶** to launch on an emulator or a connected device (enable *USB debugging*).
- Build a shareable APK: **Build → Build Bundle(s)/APK(s) → Build APK(s)**.
- The debug APK lands in `android/app/build/outputs/apk/debug/app-debug.apk`.

**Command line (after the SDK is installed):**
```bash
cd frontend/android
./gradlew assembleDebug     # debug APK
./gradlew bundleRelease      # release AAB for the Play Store (needs signing, below)
```

---

## 6. Sign & submit to Google Play

1. **Create a keystore** (once, keep it safe — losing it blocks future updates):
   ```bash
   keytool -genkey -v -keystore maktabi-release.keystore -alias maktabi -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Reference it in `android/app/build.gradle` (`signingConfigs`) or via `android/keystore.properties`.
3. `./gradlew bundleRelease` → upload `app-release.aab` to the **Play Console**
   (https://play.google.com/console — requires a Google Play developer account, one‑time $25).
4. Fill store listing, content rating, data-safety form → submit for review.

**iOS / App Store:** open `ios/App/App.xcworkspace` in Xcode, set your Apple Developer
team & bundle id (`com.maktabi.app`), Archive → distribute via App Store Connect
(requires an Apple Developer account, $99/yr).

> ⚠️ Account creation, signing keys, and store submission must be done by you — they
> require your credentials and legal identity.

---

## 7. (Optional) Fully offline static bundle

To bundle the UI inside the app (works without a server for the shell), the data-driven
detail routes must be reachable without server-side dynamic params. Convert the six
`app/**/[id]/page.tsx` routes to query-string pages (e.g. `/litigation/view?id=…`) or add
`generateStaticParams` via server wrappers, then:

```bash
cd frontend
NEXT_STATIC_EXPORT=true npx next build   # produces out/
npx cap sync                              # bundles out/ into the native app
```

Until then, the **live-wrap** approach above is the recommended, fully-working path.

---

### Quick reference

| Task | Command (run in `frontend/`) |
|---|---|
| Add Android | `CAP_SERVER_URL=<url> npx cap add android` |
| Sync changes | `CAP_SERVER_URL=<url> npx cap sync` |
| Open in Studio | `npx cap open android` |
| Generate icons | `npx @capacitor/assets generate` |
| Debug APK | `cd android && ./gradlew assembleDebug` |
| Release AAB | `cd android && ./gradlew bundleRelease` |

App id: **`com.maktabi.app`** · App name: **Maktabi**
