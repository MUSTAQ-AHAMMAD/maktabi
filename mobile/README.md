# Maktabi Mobile Apps

This directory documents how to build and run the Maktabi application as native
**Android** and **iOS** apps using [Capacitor](https://capacitorjs.com/).

Capacitor wraps the existing Next.js web application into native shells, giving
you access to native device APIs while sharing 100% of the web codebase.

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 22+ | Required by Capacitor CLI |
| npm | 10+ | |
| Java (JDK) | 17 | For Android builds |
| Android Studio | Latest | Includes Android SDK |
| Xcode | 15+ | macOS only — for iOS builds |
| CocoaPods | Latest | `sudo gem install cocoapods` |

---

## Building the static web bundle

Capacitor loads the app from a **static export** produced by Next.js.

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Export the app as static HTML/JS/CSS, then sync to native projects
NEXT_STATIC_EXPORT=true npm run build:static
```

This runs `next build` (with static export enabled) followed by
`npx cap sync`, which copies the `out/` directory into the native
Android and iOS project folders.

---

## Android

### 1. Add the Android platform (first time only)

```bash
cd frontend
npx cap add android
```

This creates the `android/` native project inside `frontend/`.

### 2. Open in Android Studio

```bash
npm run cap:android
```

Android Studio opens the project at `frontend/android/`. From here you can:

- Run the app on an emulator or physical device with the **Run** button.
- Generate a signed APK/AAB via **Build → Generate Signed Bundle / APK**.

### 3. Or run directly from the CLI

```bash
npm run cap:run:android
```

---

## iOS

> iOS builds require a Mac with Xcode 15+ installed.

### 1. Add the iOS platform (first time only)

```bash
cd frontend
npx cap add ios
pod install --project-directory=ios   # install CocoaPods dependencies
```

### 2. Open in Xcode

```bash
npm run cap:ios
```

Xcode opens `frontend/ios/App.xcworkspace`. From here you can:

- Run on Simulator or a connected device.
- Archive and upload to App Store Connect via **Product → Archive**.

### 3. Or run directly from the CLI

```bash
npm run cap:run:ios
```

---

## Updating the app after frontend changes

Whenever you change the web code, rebuild and sync:

```bash
cd frontend
NEXT_STATIC_EXPORT=true npm run build:static
```

Then re-run the app from Android Studio / Xcode (or via `cap:run:*`).

---

## Live Reload during development

To use live reload against the local Next.js dev server, update
`frontend/capacitor.config.ts` temporarily:

```ts
server: {
  url: "http://YOUR_MACHINE_IP:3000",
  cleartext: true,
},
```

Then sync and run on device:

```bash
cd frontend
npx cap sync
npx cap run android   # or ios
```

> **Remove the `server.url` override before building for production.**

---

## App Configuration

Key settings are in `frontend/capacitor.config.ts`:

| Setting | Value | Description |
|---|---|---|
| `appId` | `com.maktabi.app` | Reverse-domain bundle identifier |
| `appName` | `Maktabi` | App display name |
| `webDir` | `out` | Next.js static export directory |
| `androidScheme` | `https` | Secure scheme for Android WebView |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web App | Next.js 14 · TypeScript · TailwindCSS · shadcn/ui |
| Mobile Shell | Capacitor 8 |
| Android | Android Studio · Gradle |
| iOS | Xcode · CocoaPods · Swift |
| Backend | NestJS · PostgreSQL (shared with web) |
