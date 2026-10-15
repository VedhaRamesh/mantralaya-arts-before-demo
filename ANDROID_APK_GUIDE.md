# Mantralaya Arts — Running the App & Building an Android APK

This guide provides step-by-step instructions on **how to run the application** and **how to generate a standalone Android APK**.

---

## Part 1: How to Run the Application

### 1. Running in Cloud Preview (Active Right Now)
The app is fully functional and hosted on Google AI Studio Cloud Run:
- **Development URL**: `https://ais-dev-iuhokln75vsgvcimzb3sjo-482862357886.asia-southeast1.run.app`
- **Shared Production URL**: `https://ais-pre-iuhokln75vsgvcimzb3sjo-482862357886.asia-southeast1.run.app`

#### Instant Android Installation (PWA — No APK Build Required):
1. Open the URL in **Google Chrome** on your Android smartphone.
2. Tap the **"Install App"** banner at the top, or tap Chrome's three-dot menu (**⋮**) and choose **"Install App"** (or **"Add to Home Screen"**).
3. The app will install onto your phone with its consecrated temple icon, full-screen standalone display (no browser address bar), and offline support.

---

### 2. Running Locally on Your Computer
To run and develop the project on your personal machine:

1. **Install Node.js**: Ensure **Node.js 18+ or 20+** is installed on your computer.
2. **Download or Clone the Project**:
   Ensure you have all the project files in a folder on your system.
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Start the Local Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.
5. **Build Production Web Bundle**:
   ```bash
   npm run build
   ```
   This compiles all React components, styles, and assets into the `dist/` directory.

---

## Part 2: Building the Android APK with Capacitor

Capacitor bridges your existing Vite + React web code into a **native Android Studio Gradle project**, enabling you to compile a real `.apk` (for direct sideloading/testing) or `.aab` (for Google Play Store).

### Prerequisites on Your Machine
- **Node.js** (v18+)
- **Android Studio** (Electric Eel or newer recommended) with:
  - Android SDK (API 34 or 35)
  - Android SDK Platform-Tools
  - Java JDK 17 or 21 (included with modern Android Studio)

---

### Step-by-Step APK Build Process

#### Step 1: Build the Web Application
Compile the production web assets into the `dist/` folder:
```bash
npm run build
```

#### Step 2: Initialize the Android Native Project (First Time Only)
Add the Android native platform template:
```bash
npx cap add android
```
> This creates an `android/` directory containing a complete, native Android Studio project configured with package ID `com.mantralayaarts.app`.

#### Step 3: Sync Web Assets to Android
Whenever you modify your React code or catalog, sync the changes to the Android native folder:
```bash
npm run build:android
```
*(Or run `npm run build && npx cap sync`)*

#### Step 4: Open in Android Studio
Launch Android Studio with the project:
```bash
npx cap open android
```
*(Or open Android Studio manually, select **Open**, and navigate to the `android/` subfolder).*

---

### Step 5: Generate the `.apk` File

#### Option A: Using the Android Studio GUI (Easiest)
1. Wait for Android Studio to finish indexing and syncing Gradle.
2. From the top menu, click **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Once completed, a notification bubble appears: *"APK(s) generated successfully for 1 module"*.
4. Click **locate** to reveal the compiled `.apk` file:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

#### Option B: Using the Command Line (Without opening Android Studio GUI)
In your terminal, navigate to the `android/` directory and run Gradle:

- **On macOS / Linux**:
  ```bash
  cd android
  ./gradlew assembleDebug
  ```
- **On Windows**:
  ```cmd
  cd android
  gradlew.bat assembleDebug
  ```
The generated APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

### Step 6: How to Install the APK on Your Android Device

1. **Direct Download / Sideloading**:
   - Send `app-debug.apk` to your phone via USB cable, Google Drive, WhatsApp, or email.
   - On your Android phone, tap the file in your Downloads or Files app.
   - If prompted, toggle on *"Allow from this source"* in Android Settings to permit installing apps outside the Play Store.
   - Tap **Install**, then tap **Open**.
2. **Via USB Debugging (Developer Mode)**:
   - Connect your Android phone to your computer via USB.
   - Enable **USB Debugging** in your phone's *Developer Options*.
   - In your project root, run:
     ```bash
     npx cap run android
     ```
   - Capacitor will compile the APK, push it to your connected device, and launch it automatically.

---

### Step 7: Generating a Signed Release APK for Production
To create a production-ready signed APK:
1. In Android Studio, go to **Build** > **Generate Signed Bundle / APK...**
2. Select **APK** (or **Android App Bundle** for Google Play).
3. Create a new Keystore or choose an existing one, enter your password, and select **release**.
4. The signed APK will be output in `android/app/release/app-release.apk`.

---

## Summary of Useful Commands

| Task | Command |
|---|---|
| Run web dev server | `npm run dev` |
| Build production web code | `npm run build` |
| Initialize Android native folder | `npm run cap:init:android` |
| Sync web changes to Android | `npm run build:android` |
| Open Android project in Android Studio | `npm run cap:open:android` |
| Compile Debug APK via terminal | `cd android && ./gradlew assembleDebug` |
