# Mac Handoff: Fixing the Native Crash

Hello from Windows! This file contains the exact context of where we left off and what you need to do on this Mac to permanently fix the silent app crash.

## The Diagnosis
The app was silently crashing instantly upon opening, even though it succeeded building via Xcode. 
Through the `nativebuilderror.rtf` crash log, we found the exact fatal C++ error:
`libc++abi: terminating due to uncaught exception of type facebook::jsi::JSError: JS Symbols are not convertible to dynamic`

This is a known bug in Expo SDK 52 where the `expo-symbols` package attempts to convert JavaScript objects (the custom SF Symbols we used for the bottom tabs) into C++ Dynamic types via the Hermes Engine, but fails if there is a version mismatch, ripping the entire application out of memory. 

I have already locked down and forcefully downgraded `expo-symbols@~1.0.8` on the `main` branch to perfectly sync the JavaScript with the native engine.

## Your Immediate Steps on this Mac

Open your Mac terminal and run these commands **exactly in this order**:

1. **Delete the old, corrupted app from your physical iPhone.** 

2. **Navigate to the Project:**
   ```bash
   cd BlockHyre
   ```

3. **Pull the latest locked code from GitHub:**
   ```bash
   git checkout main
   git pull origin main
   ```

4. **Install the EXACT dependency versions defined in our updated lockfile:**
   ```bash
   pnpm install --frozen-lockfile
   ```

5. **Navigate to the mobile directory:**
   ```bash
   cd apps/mobile
   ```

6. **Plug in your iPhone. Unlock the screen. Run the native build:**
   ```bash
   npx expo run:ios --device
   ```

Once Xcode forcefully applies the new `expo-symbols` pod to the iPhone and opens the app successfully, the C++ crash loop will be permanently broken.

## Returning to Windows
Once it launches cleanly from the Mac:
1. Unplug the iPhone.
2. Put the Mac to sleep.
3. On your Windows machine, stop the existing Metro server (`Ctrl+C`).
4. Start a fresh one bound to your local IP: `npx expo start --clear --lan`.
5. Scan the QR code on your iPhone!
