# Running Mantralaya Arts & Generating an Android APK

Guide and implementation plan explaining how to run the Mantralaya Arts application and how to configure Capacitor to package the web application into a native Android Studio project that compiles a standalone Android APK.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your responses:
> - **Android APK Generation**: We will configure **Capacitor** (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`), providing the Android configuration (`capacitor.config.ts`), build scripts in `package.json`, and step-by-step instructions to compile the native `.apk` in Android Studio or via Gradle command line.
> - **Execution Environment**: We provide explicit instructions for running in the **AI Studio Cloud Preview & Android Chrome** (zero setup) as well as **Local Node.js Development** (for building the APK locally).

---

## 1. How to Run This Application

### Method A: Running in Cloud Preview (Active Right Now)
The application is already hosted and running live in your AI Studio cloud environment.
- **Development URL**: Access the app URL in your browser on PC, tablet, or mobile phone.
- **Instant Android Home Screen App (PWA)**:
  1. Open the app link in **Google Chrome** on your Android phone.
  2. Tap the **"Install App"** button at the top banner or tap Chrome's three-dot menu (**⋮**) and select **"Install App"** (or **"Add to Home Screen"**).
  3. The app is installed on your phone with a standalone icon, splash screen, and full-screen experience with no browser URL bar.

### Method B: Running Locally on Your Computer
To run and develop the project on your personal computer:
1. **Prerequisites**: Ensure **Node.js (version 18 or 20+)** and **npm** are installed.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.
4. **Build for Production**:
   ```bash
   npm run build
   ```
   This generates the optimized static bundle in the `dist/` directory.

---

## 2. Converting the Entire App to an Android APK

Capacitor bridges the Vite + React single-page application into a standard **Android Studio native project** that compiles into an `.apk` file (for direct installation on any Android phone) or `.aab` file (for Google Play Store).

```
┌────────────────────────────────────────────────────────┐
│               Mantralaya Arts React App                │
│    (Vite SPA, Tailwind CSS, Firestore, Offline PWA)    │
└───────────────────────────┬────────────────────────────┘
                            │ npm run build
                            ▼
┌────────────────────────────────────────────────────────┐
│                     dist/ Folder                       │
│           (Compiled HTML, JS, CSS, and Assets)         │
└───────────────────────────┬────────────────────────────┘
                            │ npx cap sync
                            ▼
┌────────────────────────────────────────────────────────┐
│            Capacitor Native Android Container          │
│        (capacitor.config.ts, AndroidManifest.xml)      │
└───────────────────────────┬────────────────────────────┘
                            │ Android Studio / ./gradlew
                            ▼
┌────────────────────────────────────────────────────────┐
│              Standalone Android APK File               │
│          (app-debug.apk / app-release.apk)             │
└────────────────────────────────────────────────────────┘
```

### Proposed Changes to the Codebase

1. **Install Capacitor Dependencies**:
   - `@capacitor/core`: Runtime bridge for native Android functionality.
   - `@capacitor/cli`: Command-line tools for project initialization and asset synchronization.
   - `@capacitor/android`: Native Android runtime platform files and templates.

2. **Add Capacitor Configuration (`capacitor.config.ts`)**:
   - Package ID: `com.mantralayaarts.app`
   - App Name: `Mantralaya Arts`
   - Web Asset Directory: `dist`
   - Android Status Bar & Theme Color: `#701A1E` (sacred temple maroon)
   - Cleartext/HTTP traffic flags and deep-linking configuration.

3. **Update `package.json` Scripts**:
   - `"build:android"`: Runs `npm run build && npx cap sync`
   - `"cap:open:android"`: Opens the Android project directly in Android Studio (`npx cap open android`).

4. **Detailed Step-by-Step Guide for Generating the APK**:
   A dedicated guide document (`ANDROID_APK_GUIDE.md`) covering:
   - Setting up Android Studio & Android SDK
   - Generating debug APK (`./gradlew assembleDebug`)
   - Creating a release signing keystore for production APK (`./gradlew assembleRelease`)
   - Sideloading the APK onto an Android device via USB or direct download.

---

## 3. Key Product & Technical Decisions

- **Why Capacitor over React Native rewrite?**
  Capacitor preserves 100% of the existing React 19 codebase, Tailwind CSS devotional design, Firestore real-time sync, and offline caching without requiring a complete rewrite into native UI components.
- **Why Capacitor over pure TWA (Trusted Web Activity)?**
  Capacitor bundles the HTML/JS/CSS directly inside the APK, ensuring the core app shell boots instantly even before an internet connection is established, matching the temple shopping offline mode.

---

## 4. Verification & Testing Plan

1. Verify package installation of Capacitor core and CLI.
2. Validate compilation of `capacitor.config.ts`.
3. Verify that `npm run build` generates production assets without errors.
4. Ensure the web app continues to run cleanly in AI Studio dev server with zero regressions to the PWA and Firestore workflows.
