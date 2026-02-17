# Mobile Architecture Overview

## 1. High-Level Architecture
BlockHyre Mobile is a native iOS and Android application built using **React Native** and the **Expo** framework. It leverages **Expo Router** for file-based navigation and **Supabase** for backend services (Authentication, Database, Storage).

### Core Technologies
- **Framework**: Expo (SDK 50+)
- **Language**: TypeScript
- **Navigation**: `expo-router` (v3)
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: React Hooks (`useState`, `useEffect`, `useContext`)
- **Styling**: Native `StyleSheet`, `react-native-safe-area-context`
- **UI Components**: Custom components, `lucide-react-native` for icons, `expo-symbols` for native iOS SF Symbols
- **Navigation (Mobile)**: `@bottom-tabs/react-navigation` (Native System Tabs)
- **Animations**: `react-native-reanimated`

## 2. Project Structure (`apps/mobile`)

The project follows the standard Expo Router structure:

```
apps/mobile/
├── app/                        # File-based routing (pages)
│   ├── (tabs)/                 # Main tab navigation
│   │   ├── index.tsx           # Explore Tab (Home)
│   │   ├── favorites.tsx       # Favorites Tab
│   │   ├── profile.tsx         # Profile Tab
│   │   └── _layout.tsx         # Tab Bar configuration
│   ├── listings/
│   │   └── [id].tsx            # Dynamic Listing Details Page
│   ├── onboarding/             # Auth & Intro flow
│   ├── _layout.tsx             # Root Layout (Stack Navigator, Global Providers)
│   └── +not-found.tsx          # 404 Handler
├── components/                 # Reusable UI Components
│   ├── ExploreCardSkeleton.tsx # Loading states
│   ├── FavoritesSkeleton.tsx   # Loading states
│   ├── ListingDetailSkeleton.tsx # Loading states
│   ├── SortDrawer.tsx          # Bottom sheet for sorting/filtering
│   └── ...
├── constants/                  # Configuration constants (Colors, Layout)
├── hooks/                      # Custom React Hooks
└── assets/                     # Images, Fonts, Splash screens
```

## 3. Key Core Flows

### A. Navigation & Routing
- **File-Based Routing**: The folder structure in `app/` directly maps to navigation routes.
- **Stacks & Tabs**: 
  - The root `_layout.tsx` defines a Stack Navigator.
  - The `(tabs)` folder defines the main Tab Navigator using **Native System Tabs** on mobile and standard JS Tabs on web.
- **Dynamic Routes**: `app/listings/[id].tsx` handles dynamic routing for individual listing pages.
- **Navigation Loop Prevention**: When navigating from a Stack screen (like Favorites) back to a main Tab (like Explore), always use `router.dismiss()` followed by `router.replace('/(tabs)/')` to prevent building an infinite navigation stack.

### B. Data Layer (Supabase)
- **Client**: Initialized in `@/lib/supabase.ts` using `AsyncStorage` for session persistence.
- **Fetching Strategy**:
  - Components fetch data directly using `supabase.from('table').select(...)`.
  - **Explore Page**: Fetches live listings from `public.listings`. Falls back to `MOCK_TOOLS` if the database is empty.
  - **Listing Details**: Fetches details by ID. Handles both real UUIDs (DB) and legacy Mock IDs (preventing crashes during transition).
  - **Favorites**: Joins `favorites` with `listings` to display user saved items.
  - **Image Prefetching**: `listing/[id].tsx` prefetches critical images (Hero & Avatar) via `expo-image` before dismissing the skeleton loader to ensure instant, pop-in free rendering.

### C. Authentication
- **Flow**:
  1. App launch (`RootLayout`) checks for persistent session and `hasSeenOnboarding` flag.
  2. If new user -> Redirects to `/onboarding`.
  3. If logged out -> Login screen.
  4. If logged in -> Main `(tabs)` flow.
- **Logout**: Handled in `profile.tsx` via `supabase.auth.signOut()`.

## 4. UI/UX Patterns
- **Loading States**: Uses custom Skeleton loaders (`ExploreCardSkeleton`, `FavoritesSkeleton`, `ListingDetailSkeleton`) for a premium feel instead of generic spinners.
- **Safe Areas**: All screens utilize `useSafeAreaInsets` to ensure content respects notches and home indicators.
- **Animations**: 
  - Scroll-driven animations (e.g., Sticky Headers in Profile & Listing Details).
  - Reanimated shared values for performant UI interactions.
- **Gestures & Bottom Sheets**: 
  - **Library**: `@gorhom/bottom-sheet` (v5) is the standard for all modal interactions.
  - **Sizing Strategy**: Always prefer `enableDynamicSizing={true}`. This allows the sheet to grow naturally with its content (e.g., switching from login buttons to a form) without requiring manual snap point calculations.
  - **Keyboard Handling (CRITICAL)**:
    - **Inputs**: You **MUST** use `<BottomSheetTextInput />` (imported from `@gorhom/bottom-sheet`) instead of the standard React Native `<TextInput />`. The standard input does not synchronize with the sheet's position logic, causing the keyboard to cover the input.
    - **Configuration**: Always apply these props for a native iOS feel:
      ```tsx
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      ```
  - **Programmatic Control**: Use `ref.current?.close()` or `dismiss()` for navigation logic (e.g., after successful login) rather than conditionally unmounting the component, to ensure exit animations play correctly.

### D. Premium Native Visuals (Liquid Glass)
- **Native Tabs**: Uses `@bottom-tabs/react-navigation` to leverage platform-native navigation primitives (UITabBar on iOS).
- **Translucency**: `translucent: true` is enabled in `(tabs)/_layout.tsx` to achieve the native iOS "Liquid Glass" material effect where content scrolls behind the tab bar.
- **SF Symbols**: Integrates `expo-symbols` for high-fidelity native icons on iOS that respect system tinting and translucency.
  - **Conflict Resolution**: Since this is a monorepo, `react-native-gesture-handler` MUST be aliased in `metro.config.js` to point EXCLUSIVELY to the root `node_modules`.

## 5. Development Strategy
  - `listings/[id].tsx` includes a specific check for "Mock IDs" (short non-UUID strings) to render dummy data safely.

### B. Development Environment (Windows vs Mac)
- **Development Builds (NOT Expo Go)**: This project includes native dependencies (`@bottom-tabs/react-navigation`). You **MUST** use a Development Build; it will not run in the standard Expo Go app.
- **Cross-Platform Strategy**:
  - **Windows (Web)**: Run `npm run web` for rapid development of UI and logic. The tabs will fallback to standard JS components.
  - **Mac (iOS)**: Run `npx expo run:ios` to verify native aesthetics, haptics, and SF Symbols.
  - **Windows (iOS Device)**: Run `eas build --profile development --platform ios` to build in the cloud and test on a physical iPhone.

## 6. Monorepo & Configuration Gotchas
- **Duplicate Native Modules**: 
  - **Symptom**: "Invariant Violation: Tried to register two views with the same name (RNGestureHandlerButton)".
  - **Cause**: Metro bundling two copies of a native library (local vs root).
  - **Fix**: 
    1. Force `pnpm` to use a single version via `overrides` in root `package.json`.
    2. Configure `metro.config.js` `blockList` to ignore the local `apps/mobile/node_modules` path for the conflicting lib.
    3. Configure `extraNodeModules` to resolve the lib to `path.resolve(workspaceRoot, 'node_modules/lib-name')`.
    4. Manually delete the local folder if symlinks persist.

## 7. Future Roadmap
- **Maps**: Integrate `react-native-maps` for the "Map View" toggle in Explore.
- **Real-time**: Enable Supabase Realtime for chat/messaging.
- **Payments**: Integrate Stripe Mobile SDK.
