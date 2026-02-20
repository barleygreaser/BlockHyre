# Mac OS iOS Development Setup Guide

Follow these steps on your **Macintosh** to build and install the "Native Shell" to your iPhone once every 7 days (for free accounts).

## 1. Install System Prerequisites
Open your Mac Terminal and run these commands:

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install pnpm (used in this monorepo)
npm install -g pnpm

# Install CocoaPods (required for iOS native dependencies)
brew install cocoapods
```

## 2. Xcode Setup (Mandatory)
1. Download **Xcode** from the Mac App Store.
2. Open Xcode once to accept the license agreement.
3. Run:
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
```

## 3. Clone and Branch Setup
```bash
git clone https://github.com/barleygreaser/BlockHyre.git
cd BlockHyre

# Ensure you are on main (now the default for messaging features)
git checkout main
git pull origin main
```

## 4. Install Project Dependencies
Run this from the root of the project:
```bash
pnpm install
```

## 5. Install to Physical iPhone (Free Account 7-Day Method)
1. Plug your iPhone into the Mac via USB.
2. Navigate to the mobile directory:
```bash
cd apps/mobile
```
3. Run the installation:
```bash
npx expo run:ios --device
```
4. **If you get "Signing Errors" in terminal:**
   - Open `apps/mobile/ios/BlockHyre.xcworkspace` in Xcode.
   - Select the **BlockHyre** project in the left sidebar.
   - Go to the **Signing & Capabilities** tab.
   - Select your **Personal Team** (your Apple ID) and change the **Bundle Identifier** to something unique (e.g., `com.yourname.blockhyre`).
   - Run the terminal command `npx expo run:ios --device` again.

## 6. Daily Workflow (Windows)
Once the app icon is on your iPhone:
1. You no longer need the Mac for 7 days.
2. On your **Windows PC**, run `npx expo start`.
3. Open the **BlockHyre** app on your iPhone.
4. It will connect to your Windows PC over Wi-Fi and hot-reload your changes instantly.

## Troubleshooting
- **Untrusted Developer**: On iPhone, go to **Settings > General > VPN & Device Management** and trust your Apple ID.
- **7-Day Expiry**: Simply re-plug your phone into the Mac and run `npx expo run:ios --device` again.
- **Port Blocked**: Ensure your Windows Firewall allows Node.js/Expo (Port 8081).
