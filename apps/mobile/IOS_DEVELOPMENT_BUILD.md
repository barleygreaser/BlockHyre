# Testing Native Libraries on iOS (Without Expo Go)

## Why Can't I Use Expo Go?

`react-native-bottom-tabs` requires native iOS code, which **cannot** be included in the generic Expo Go app. This is a common limitation for libraries that use native modules.

## Solution: Create a Development Build

A **Development Build** is like a custom version of Expo Go that includes all your native dependencies. You get the same fast refresh experience!

---

## Option 1: iOS Simulator (Mac Only) ⭐ EASIEST

If you have a Mac with Xcode installed:

```bash
# Install EAS CLI globally (if not already installed)
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS simulator
eas build --profile development --platform ios --local
```

Once built, run:
```bash
npx expo start --dev-client
```

Then press `i` to open in iOS Simulator.

---

## Option 2: Physical iPhone (Cloud Build)

This works from Windows! Expo builds your app in the cloud.

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login
```bash
eas login
```

### Step 3: Configure your project
```bash
cd apps/mobile
eas build:configure
```

### Step 4: Build for device
```bash
eas build --profile development --platform ios
```

This will:
1. Build your app in the cloud
2. Give you a QR code to download the app
3. Install it on your iPhone via TestFlight or direct download

### Step 5: Run development server
```bash
npx expo start --dev-client
```

Scan the QR code with your iPhone to connect!

---

## What Changed?

✅ **Added:** `react-native-bottom-tabs` library  
✅ **Added:** Plugin to `app.json`  
✅ **Created:** `eas.json` configuration file  

## Next Steps

1. Choose your platform (Simulator or Physical Device)
2. Run the build command
3. Once installed, you can use it like Expo Go with fast refresh!

## Costs

- **Development builds in cloud:** FREE with Expo account
- **Simulator builds:** FREE (requires Mac)
- **No Apple Developer account needed** for development builds!

---

## Troubleshooting

### "eas: command not found"
Run: `npm install -g eas-cli`

### "Not logged in"
Run: `eas login`

### Build fails
Check that:
- You're in the `apps/mobile` directory
- `app.json` has the plugin added
- Internet connection is stable
