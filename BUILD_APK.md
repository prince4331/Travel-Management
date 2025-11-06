# 🎯 Simple APK Build Instructions

## Prerequisites (One-time setup)

1. **Install Android Studio**: https://developer.android.com/studio
   - During installation, make sure to install Android SDK
   - Accept all license agreements

2. **Set Environment Variables** (Windows):
   ```
   ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
   ```
   Add to PATH:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   ```

## Step-by-Step Build Process

### Step 1: Install Capacitor (Run once)

Open PowerShell in the `frontend` folder:

```powershell
cd "d:\Website making\travel_management\frontend"
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Step 2: Initialize Capacitor (Run once)

```powershell
npx cap init
```

When prompted, enter:
- **App name**: `Travel Management`
- **App package ID**: `com.travel.management`
- **Web asset directory**: `out`

### Step 3: Enable Static Export

In `frontend/next.config.js`, uncomment these lines:

```javascript
output: 'export',
images: { unoptimized: true },
```

### Step 4: Update API URL for Production

Create `frontend/.env.production`:

```
NEXT_PUBLIC_API_URL=http://your-server-ip:3000
# Or use your deployed backend URL
```

### Step 5: Build the App

```powershell
npm run build
```

### Step 6: Add Android Platform (Run once)

```powershell
npx cap add android
```

### Step 7: Sync Assets

Every time you make changes, run:

```powershell
npx cap sync
```

### Step 8: Open in Android Studio

```powershell
npx cap open android
```

### Step 9: Build APK in Android Studio

1. Wait for Gradle sync to finish (first time takes 5-10 minutes)
2. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for build to complete (~2-5 minutes)
4. Click **locate** to find your APK

APK Location:
```
d:\Website making\travel_management\frontend\android\app\build\outputs\apk\debug\app-debug.apk
```

### Step 10: Install on Phone

**Option A - Via USB**:
1. Enable Developer Options on phone (tap Build Number 7 times in Settings)
2. Enable USB Debugging
3. Connect phone to computer
4. In Android Studio, click ▶️ Run button

**Option B - Transfer APK**:
1. Copy `app-debug.apk` to phone
2. Open and install (allow install from unknown sources)

---

## 🚀 Quick Commands (After Initial Setup)

```powershell
# 1. Make your code changes in frontend/src

# 2. Build
npm run build

# 3. Sync to mobile
npx cap sync

# 4. Open Android Studio (if not already open)
npx cap open android

# 5. Click Run ▶️ button in Android Studio
```

---

## ⚠️ Important Backend Configuration

Your mobile app needs to connect to your backend. You have 2 options:

### Option A: Local Testing (Same WiFi Network)

1. Find your computer's local IP:
   ```powershell
   ipconfig
   ```
   Look for `IPv4 Address` (e.g., `192.168.1.100`)

2. Update `frontend/.env.production`:
   ```
   NEXT_PUBLIC_API_URL=http://192.168.1.100:3000
   ```

3. Make sure backend is running:
   ```powershell
   cd "d:\Website making\travel_management\backend"
   npm run start:dev
   ```

### Option B: Deploy Backend to Cloud (For Real Use)

Use free services like:
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com

Then update:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## 📝 Checklist Before Building APK

- ✅ Backend is running and accessible
- ✅ `NEXT_PUBLIC_API_URL` is set correctly
- ✅ Run `npm run build` successfully
- ✅ Run `npx cap sync`
- ✅ Android Studio is installed
- ✅ No compile errors in Android Studio

---

## 🐛 Common Issues & Solutions

### "Web directory not found"
- **Fix**: Run `npm run build` first

### "Could not find Android SDK"
- **Fix**: Install Android Studio and set ANDROID_HOME

### "API calls failing on mobile"
- **Fix**: Use your computer's IP address, not `localhost`
- **Fix**: Make sure backend allows CORS from all origins

### "Build failed in Android Studio"
- **Fix**: File → Invalidate Caches → Invalidate and Restart
- **Fix**: Make sure you have JDK 11 or higher installed

### "App crashes on startup"
- **Fix**: Check Android Logcat in Android Studio for errors
- **Fix**: Make sure all environment variables are set

---

## 🎉 Success!

Once you have the APK:
1. Share it with anyone (via Google Drive, WhatsApp, etc.)
2. They can install directly on Android phones
3. For Play Store publishing, you need a signed APK (see MOBILE_BUILD_GUIDE.md)

---

## Next Steps

1. Test all features on real device
2. Fix any mobile-specific issues
3. Create app icons (1024x1024 PNG)
4. Generate signed APK for production
5. Publish to Google Play Store
