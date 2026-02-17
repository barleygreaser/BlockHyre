# Mac OS iOS Development Setup Guide

Follow these steps on your **Macintosh** to build and run the BlockHyre mobile app with native system navigation.

## 1. Install System Prerequisites
Open your Mac Terminal and run these commands to install the necessary package managers.

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
3. Run the following in your terminal to initialize the command line tools:
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
```

## 3. Clone and Branch Setup

If you have SSH keys configured on your GitHub account, use the SSH method. If you get a `Permission denied (publickey)` error, use the **HTTPS** method instead.

### Option A: HTTPS (Recommended if SSH is not set up)
```bash
# Clone using HTTPS
git clone https://github.com/barleygreaser/BlockHyre.git
cd BlockHyre
```

### Option B: SSH
```bash
# Clone using SSH
git clone git@github.com:barleygreaser/BlockHyre.git
cd BlockHyre
```

**Note:** If you get `Permission denied`, you either need to use HTTPS (above) or [generate an SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) and add it to your GitHub account.

### Branch Setup
```bash
# Switch to the native tabs branch (if working on the refactor)
git checkout refactor/native-tabs
git pull origin refactor/native-tabs
```

## 4. Install Project Dependencies
Run this from the root of the project:
```bash
pnpm install
```

## 5. Run the iOS Development Build
Navigate to the mobile app directory and start the build process.

```bash
cd apps/mobile

# This command will:
# 1. Generate the /ios folder (Prebuild)
# 2. Install CocoaPods
# 3. Compile the native app
# 4. Launch the iOS Simulator
npx expo run:ios
```

## Troubleshooting
- **Git Permission Denied (SSH)**: Use the HTTPS URL (`https://github.com/barleygreaser/BlockHyre.git`) instead of SSH when cloning if you haven't uploaded an SSH key to GitHub.
- **Pod Install Errors**: If you see errors related to `pod install`, try running `cd apps/mobile/ios && pod install` manually.
- **Simulator Not Found**: Ensure you have a simulator downloaded in Xcode (Settings > Platforms).
- **Branch Sync**: Ensure you are on `refactor/native-tabs` to see the new Native System Tabs (Liquid Glass effect).
