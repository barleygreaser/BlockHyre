# Feat: Implement Favorites for Web App

## Summary
Adds a fully functional favorites feature to `apps/web`, reusing the existing `public.favorites` Supabase table already used by the mobile app. Users can now save/unsave listings from anywhere in the web interface and view all their favorites on a dedicated page.

## What Changed

### New Files
| File | Description |
|------|-------------|
| `app/hooks/use-favorites.ts` | Core React hook managing favorites state via a `Set<string>` for O(1) lookup. Handles optimistic toggle, bulk fetch, and full listing data retrieval for the favorites page. |
| `app/components/favorite-button.tsx` | Reusable `<FavoriteButton>` component with two variants: `overlay` (translucent circle over images) and `inline` (text button with label). Includes animation, auth gating, keyboard accessibility. |
| `app/favorites/page.tsx` | Dedicated `/favorites` route displaying saved listings in a responsive grid. Includes auth gate, empty state, and loading state. |

### Modified Files
| File | Description |
|------|-------------|
| `app/components/tool-card.tsx` | Added `FavoriteButton` overlay on the top-left of each listing card image. |
| `app/listings/[id]/[slug]/page.tsx` | Added `FavoriteButton` overlay on the top-right of the listing hero image. |
| `app/components/navbar.tsx` | Added "My Favorites" link (with Heart icon) to both the desktop user dropdown menu and the mobile navigation drawer. |

## Architecture Decisions

- **Shared hook pattern**: All `FavoriteButton` instances on a page share state through `useFavorites()`, so toggling a favorite from a card instantly reflects everywhere.
- **Optimistic updates**: The UI updates immediately on toggle; the Supabase mutation runs in the background. On failure, state reverts and a toast error is shown.
- **Same backend table**: Uses `public.favorites` with `user_id` + `listing_id` — identical schema to the mobile app. Cross-platform sync is automatic.
- **Auth gating**: Unauthenticated users see a toast with a "Sign In" action button instead of an error.
- **Accessibility**: All interactive elements include `aria-label`, `tabIndex`, and `onKeyDown` handlers.

## Testing Checklist
- [ ] Click heart on tool card → listing favorited, toast appears
- [ ] Click heart on listing detail page → same behavior
- [ ] Click heart when logged out → toast with "Sign In" action
- [ ] Navigate to `/favorites` → see saved listings
- [ ] Remove favorite from `/favorites` page → card disappears on refresh
- [ ] Favorite from web, check mobile → same listing is favorited
- [ ] Desktop dropdown menu shows "My Favorites" link
- [ ] Mobile drawer shows "My Favorites" link
