# Native iOS Build Learnings & Fixes

This document serves as a post-mortem and knowledge base for the severe native crash loop encountered when attempting to run the mobile application as a standalone native iOS build (via `npx expo run:ios`).

While the application ran perfectly fine inside the Expo Go sandbox environment, compiling the app down to raw native iOS binaries triggered multiple compounding framework crashes.

## 1. Native Tab Bar C++ JSI Crash
**The Error**: `uncaught exception of type facebook::jsi::JSError: JS Symbols are not convertible to dynamic`
**The Context**: This error crashes the app immediately after the splash screen hides. It produces a completely silent native crash (terminating the app instantly) without ever printing a JavaScript stack trace to the Metro Bundler terminal.
**The Cause**: The application utilizes `@bottom-tabs/react-navigation` to render true native iOS `UITabBar` instances. For standard React Native/Expo Web apps, you return a JSX `<View>` or `<SymbolView>` in your `tabBarIcon` method. However, the Native Bottom Tabs library uses the C++ React Native bridge to serialize JS objects. It expects `tabBarIcon` to return a raw JavaScript object dictionary (e.g. `{ sfSymbol: 'house.fill' }`). Because a React Element (`<SymbolView />`) was passed to the bridge instead, the Hermes JavaScript engine panicked during serialization (`folly::dynamic`) because it cannot convert a `Symbol(react.element)` down to raw native C++ primitives.
**The Fix**: Refactor `app/(tabs)/_layout.tsx` to conditionally pass pure JavaScript objects containing `sfSymbol` string configurations when running on `Platform.OS === 'ios'`.

```tsx
// ❌ BAD (Crashes Native App Instantly)
tabBarIcon: ({ focused }) => (
  <SymbolView name={focused ? 'house.fill' : 'house'} />
)

// ✅ GOOD (Serializes safely across the JSI Bridge)
tabBarIcon: ({ focused }) => ({
  sfSymbol: focused ? 'house.fill' : 'house'
})
```

## 2. Fast Refresh Context Detachment 
**The Error**: `useSheet must be used within a SheetProvider`
**The Cause**: This error arose temporarily during debugging because of Expo Metro Bundler's Fast Refresh mechanism. When deeply modifying core files representing Root Layouts (`_layout.tsx`) that contain singleton React Contexts (`<SheetProvider />`), the hot-reloading module occasionally loses the memory pointer to the `createContext()` initializer while the sub-components (`<SortDrawer />`) re-render. 
**The Fix**: This is purely a development-environment artifact. Fully restarting the Expo server with `npx expo start --clear` and force-closing the iOS application entirely flushes the corrupted Hot Module Replacement states. Furthermore, ensuring that all components importing the Context (e.g. `SortDrawer`) use explicit path aliases (`@/components/SortDrawer`) rather than relative paths (`../components`) strictly enforces Metro bundle mapping.

## 3. Gesture Handler Invariant Violations
**The Error**: `Invariant Violation: Tried to register two views with the same name RNGestureHandlerButton` and `Route "./_layout.tsx" is missing the required default export.`
**The Cause**: The root layout explicitly featured an `import 'react-native-gesture-handler'` side-effect and a redundant `<GestureHandlerRootView>` wrapper. Because `expo-router` v3+ natively injects and manages the Gestures API at the core wrapper level, mounting a second instance causes the Native Engine to throw a duplicate view registry panic (Invariant Violation). Because this error evaluates at the very top of `_layout.tsx`, the JS engine halts evaluation before reading the `export default function` statement at the bottom of the file—thus tricking Expo Router into assuming the file had no default export.
**The Fix**: Remove the unused `<GestureHandlerRootView>` and explicit side-effect imports from the main `app/_layout.tsx` file, delegating all gesture registry natively to Expo Router.

## 4. node_modules "Shamefully Hoisted" Desync
**The Context**: Running aggressive commands like `rm -rf node_modules` alongside `pnpm install --no-frozen-lockfile` in a monorepo workspace environment can easily destroy your native build configurations.
**The Cause**: The native iOS project (`ios/Pods`) builds heavily upon exact symbolic links nested deeply within `.pnpm` and `node_modules`. Breaking the lockfile reconstructs the `node-linker=hoisted` mapping in a new topography. By doing so, the iOS binaries expect to find `react-native` and `expo` modules in folders that no longer exist, causing complete bundle failures (`Cannot determine the project's Expo SDK version`).
**The Fix**: Never discard the `package-lock.json` unless intentionally bumping major SDK versions. In the event of catastrophic failure, revert to the last working Git tree:
```sh
git restore package-lock.json
pnpm install --frozen-lockfile
npx expo start --clear
```
