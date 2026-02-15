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
- **UI Components**: Custom components, `lucide-react-native` for icons
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
  - The `(tabs)` folder defines the main Tab Navigator (Explore, Favorites, Profile).
- **Dynamic Routes**: `app/listings/[id].tsx` handles dynamic routing for individual listing pages.

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

## 5. Development Strategy
- **Hybrid Data Approach**: The app currently supports both **Real DB Data** and **Mock Data (Fallback)**.
  - This allows UI development to proceed even if the backend is empty or offline.
  - `listings/[id].tsx` includes a specific check for "Mock IDs" (short non-UUID strings) to render dummy data safely.

## 6. Future Roadmap
- **Maps**: Integrate `react-native-maps` for the "Map View" toggle in Explore.
- **Real-time**: Enable Supabase Realtime for chat/messaging.
- **Payments**: Integrate Stripe Mobile SDK.
