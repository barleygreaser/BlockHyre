# Active Rentals Deep Link Examples

## How to use URL hashes to link directly to filtered views

You can now link directly to specific filtered views of the Active Rentals page by adding a hash to the URL:

### Available Filter Hashes:

1. **All Rentals**
   - URL: `/owner/active-rentals#all`
   - Shows all rentals

2. **Upcoming Rentals**
   - URL: `/owner/active-rentals#upcoming`
   - Shows rentals that haven't started yet

3. **Active Rentals**
   - URL: `/owner/active-rentals#active`
   - Shows currently ongoing rentals

4. **Overdue Rentals**
   - URL: `/owner/active-rentals#overdue`
   - Shows rentals past their end date

5. **Completed/Archived**
   - URL: `/owner/active-rentals#archived`
   - Shows completed or archived rentals

### Example Usage in Code:

```tsx
// Link to overdue rentals
<Link href="/owner/active-rentals#overdue">
  View Overdue Rentals
</Link>

// Or use a regular anchor tag
<a href="/owner/active-rentals#upcoming">
  Check Upcoming Rentals
</a>
```

### Features:

- ✅ URL hash updates when clicking filter pills
- ✅ Page automatically filters based on URL hash on load
- ✅ Can be bookmarked or shared
- ✅ Browser back/forward buttons work
- ✅ No page reload when switching filters
