# 📱 Mobile APK Build Guide

## Option 1: Capacitor (Recommended for Next.js)

### Prerequisites
- Node.js installed
- Android Studio installed (download from https://developer.android.com/studio)
- JDK 11 or higher

### Step 1: Install Capacitor

```bash
cd frontend
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

### Step 2: Initialize Capacitor

```bash
npx cap init
```

When prompted:
- App name: `Travel Management`
- App ID: `com.travel.management` (reverse domain notation)
- Web directory: `out` (for Next.js static export)

### Step 3: Configure Next.js for Static Export

Edit `frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static export
  images: {
    unoptimized: true,  // Required for static export
  },
  // Update API base URL for production
  env: {
    NEXT_PUBLIC_API_URL: 'https://your-backend-url.com', // Replace with your deployed backend
  },
}

module.exports = nextConfig
```

### Step 4: Add Build Script

Add to `frontend/package.json` scripts:

```json
{
  "scripts": {
    "build:mobile": "next build && npx cap sync"
  }
}
```

### Step 5: Build and Add Android Platform

```bash
# Build the Next.js app
npm run build

# Add Android platform
npx cap add android

# Sync web assets
npx cap sync
```

### Step 6: Open in Android Studio

```bash
npx cap open android
```

This will open the Android project in Android Studio.

### Step 7: Build APK in Android Studio

1. In Android Studio, go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for the build to complete
3. Click **locate** to find your APK file
4. The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 8: Install APK on Device

Transfer the APK to your Android device and install it, or use:

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Option 2: React Native (If You Want Full Native)

### Use the Existing Mobile Folder

Your project already has a `mobile/` folder. To use it:

```bash
cd mobile
npm install
```

For Android APK:

```bash
# Generate debug APK
npx react-native run-android --variant=release

# Or build with gradle
cd android
./gradlew assembleRelease
```

APK location: `mobile/android/app/build/outputs/apk/release/app-release.apk`

---

## Option 3: PWA to APK (Using TWA)

Convert your PWA to an APK using Trusted Web Activity:

### Using Bubblewrap CLI

```bash
npm install -g @bubblewrap/cli

# Initialize TWA project
bubblewrap init --manifest=https://your-domain.com/manifest.json

# Build APK
bubblewrap build
```

---

## Important Notes

### 1. Backend API Configuration

For mobile apps, you need to:

1. **Deploy your backend** to a public server (Heroku, AWS, DigitalOcean, etc.)
2. **Update API URLs** in your frontend to point to the deployed backend
3. **Enable CORS** for mobile origins

In `backend/src/main.ts`:

```typescript
app.enableCors({
  origin: ['capacitor://localhost', 'http://localhost', 'https://your-domain.com'],
  credentials: true,
});
```

### 2. Offline Features

Your app has offline-first features. Make sure to:

- Enable service workers in Capacitor
- Configure IndexedDB properly
- Test offline map downloads

### 3. Permissions

Add required permissions in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### 4. App Icons

Generate app icons (1024x1024 PNG):

1. Use https://icon.kitchen/ or similar tool
2. Place icons in `android/app/src/main/res/` folders

---

## Quick Start Commands

### Using Capacitor (Fastest):

```bash
# In frontend folder
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Travel Management" "com.travel.management"
npm run build
npx cap add android
npx cap sync
npx cap open android
```

Then build APK in Android Studio.

---

## Troubleshooting

### Issue: "Web directory not found"
**Solution:** Run `npm run build` first to generate the `out` folder

### Issue: "Android SDK not found"
**Solution:** Install Android Studio and set ANDROID_HOME environment variable

### Issue: "API calls failing"
**Solution:** Update API_BASE_URL to point to your deployed backend server

---

## Publishing to Google Play Store

1. **Create signed APK** in Android Studio (Build → Generate Signed Bundle/APK)
2. **Create Google Play Console account** ($25 one-time fee)
3. **Upload APK** with screenshots, description, and privacy policy
4. **Submit for review**

---

## Recommended Workflow

1. ✅ Use **Capacitor** for quick APK generation
2. ✅ Deploy backend to a cloud server
3. ✅ Test thoroughly on real devices
4. ✅ Generate signed APK for production
5. ✅ Publish to Google Play Store
