# 24-Hour Auto-Denial System for Rental Requests

## Overview

This system automatically denies rental requests if the owner doesn't respond within 24 hours of receiving the request. This ensures renters get timely responses and prevents listings from appearing available when owners are inactive.

## System Components

### 1. Database Layer

#### Migration: `20251231000000_add_rental_auto_denial.sql`

Created two key functions:

**`auto_deny_expired_rentals()`**
- Automatically updates pending rentals older than 24 hours to 'rejected' status
- Sets cancellation reason to explain auto-denial
- Called periodically by scheduled jobs

**`get_rental_time_remaining(uuid)`**
- Calculates time remaining before a specific rental request expires
- Returns interval in hours/minutes
- Used by UI for real-time countdown (optional, UI uses client-side calculation)

### 2. Edge Function

**Location**: `supabase/functions/auto-deny-rentals/index.ts`

- Serverless function that calls `auto_deny_expired_rentals()`
- Designed to be triggered on a schedule (every 15 minutes recommended)
- Has CORS support for various scheduling methods

**Deployment**:
```bash
supabase functions deploy auto-deny-rentals
```

### 3. Frontend UI

#### Owner Dashboard Updates

**File**: `app/components/dashboard/owner-view.tsx`

**Changes Made**:

1. **Added `created_at` to rental query** (line 164):
   - Fetches the timestamp when each rental request was created

2. **Helper Functions** (lines 438-464):
   - `getTimeRemaining(createdAt)`: Calculates hours/minutes remaining
   - `formatTimeRemaining(createdAt)`: Formats countdown for display
   - Marks requests as "urgent" when < 2 hours remain

3. **Time Warning Display** (lines 667-687):
   - Shows countdown timer on each pending rental request
   - **Amber warning** (normal): Yellow background, shows time remaining
   - **Red urgent warning** (< 2 hours): Red background, pulsing clock icon, warning emoji
   - Auto-hides when expired (though request should be auto-denied by then)

**Visual Examples**:

- Normal state (> 2 hours): 
  ```
  🕐 15h 30m to respond or auto-denies
  ```
  
- Urgent state (< 2 hours):
  ```
  ⚠️ 1h 15m to respond - Auto-denies soon!
  ```

### 4. Scheduling Options

You must schedule the Edge Function to run periodically. See `supabase/functions/auto-deny-rentals/README.md` for full details.

**Recommended**: Every 15 minutes

**Options**:
1. **GitHub Actions** (free, reliable)
2. **Cron-job.org** (free external service)
3. **Vercel Cron** (if using Vercel)
4. **pg_cron** (database-level, requires Supabase Pro)

## User Flow

### For Renters

1. Renter submits a rental request → Status: `pending`
2. Request includes `created_at` timestamp
3. Renter sees "Pending Owner Approval" in their dashboard
4. If owner doesn't respond within 24 hours:
   - Request automatically changes to `rejected`
   - Cancellation reason logged
   - Renter can request other tools (is notified via status change)

### For Owners

1. Owner sees rental request in dashboard
2. **Countdown timer** shows time remaining to respond
3. Timer changes color/style:
   - **Green zone** (24-2 hours): Amber badge, calm display
   - **Red zone** (< 2 hours): Red badge, pulsing icon, urgent warning
4. **At < 2 hours**: System sends urgent warning message to owner's chat
   - Message type: `RENTAL_REQUEST_EXPIRING`
   - Shows renter name, tool, dates, and potential earnings
   - Only sent once per request
5. Owner can:
   - **Approve**: Request accepted, timer removed
   - **Deny**: Request rejected manually
   - **Ignore**: Auto-denied after 24 hours

## Status on public.rentals Table

The `/status` endpoint or public rental status page will show:

- **Pending**: Waiting for owner response (< 24 hours old)
- **Rejected**: Either manually denied or auto-denied after 24 hours
  - Manual: `cancellation_reason` is empty or owner-provided
  - Auto: `cancellation_reason = "Automatically denied - owner did not respond within 24 hours"`

## Database Schema Changes

### Columns Used

- `created_at` (existing): Timestamp when rental request was created
- `status` (existing): Rental status, updated to 'rejected' on auto-denial
- `cancelled_at` (existing): Set to NOW() when auto-denied
- `cancellation_reason` (existing): Set to auto-denial message
- `expiring_warning_sent_at` (new): Timestamp when the < 2 hour warning was sent to owner

### Functions Added

- `public.auto_deny_expired_rentals()` - Service role only
- `public.get_rental_time_remaining(uuid)` - Available to authenticated users
- `public.send_expiring_rental_warnings()` - Service role only, sends urgent warnings when < 2 hours remain

### System Messages

- `RENTAL_REQUEST_EXPIRING` - Template for urgent warning sent to owners when < 2 hours remain

## Testing

### Manual Testing

1. **Create a test rental request** (set `created_at` to > 24 hours ago manually if needed)
2. **Call the Edge Function**:
   ```bash
   curl -X POST https://<project-ref>.supabase.co/functions/v1/auto-deny-rentals \
     -H "Authorization: Bearer <anon-key>"
   ```
3. **Check the database**:
   ```sql
   SELECT id, status, created_at, cancellation_reason 
   FROM rentals 
   WHERE status = 'rejected' 
   AND cancellation_reason LIKE '%Automatically denied%';
   ```

### UI Testing

1. Create a rental request
2. Temporarily modify the UI's `getTimeRemaining` function to use minutes instead of hours:
   ```typescript
   const expiresAt = new Date(created.getTime() + 5 * 60 * 1000); // 5 minutes for testing
   ```
3. Observe the countdown timer
4. Verify urgent styling appears correctly
5. Revert the change

## Monitoring & Maintenance

### Check Edge Function Logs

```bash
supabase functions logs auto-deny-rentals --limit 50
```

### View Auto-Denied Rentals

```sql
SELECT 
  id,
  created_at,
  cancelled_at,
  EXTRACT(EPOCH FROM (cancelled_at - created_at))/3600 as hours_pending,
  cancellation_reason
FROM rentals
WHERE status = 'rejected' 
AND cancellation_reason LIKE '%Automatically denied%'
ORDER BY cancelled_at DESC
LIMIT 20;
```

### Metrics to Track

- Number of auto-denials per week
- Average response time for owners
- Percentage of requests that expire

## Future Enhancements

1. **Email Notifications**: 
   - Send owner an email at 20 hours (4 hours before auto-denial)
   - Send renter notification when auto-denied

2. **Configurable Timeout**:
   - Allow platform admins to adjust the 24-hour window
   - Store in `platform_settings` table

3. **Grace Period**:
   - For owners with high ratings, extend to 36 or 48 hours

4. **Analytics Dashboard**:
   - Track owner response rates
   - Identify slow-responding owners

## Troubleshooting

### Issue: Countdown not showing
- Verify `created_at` is included in the rental query
- Check browser console for errors

### Issue: Auto-denial not working
- Verify Edge Function is deployed
- Check scheduling is active (GitHub Actions, cron, etc.)
- Review Edge Function logs for errors
- Verify database function permissions

### Issue: Timer shows wrong time
- Check server time vs. client time (timezone issues)
- Verify `created_at` is stored as `timestamptz` type

## Files Modified/Created

### New Files
- ✅ `supabase/migrations/20251231000000_add_rental_auto_denial.sql` (deployed)
- ✅ `supabase/migrations/20251231000001_add_expiring_request_template.sql`
- ✅ `supabase/migrations/20251231000002_add_expiring_warning_function.sql`
- `supabase/functions/auto-deny-rentals/index.ts`
- `supabase/functions/auto-deny-rentals/README.md`
- `.github/workflows/auto-deny-rentals.yml`
- `.github/workflows/SECRETS_SETUP.md`
- `docs/AUTO_DENIAL_SYSTEM.md` (full documentation)

### Modified Files
- `app/components/dashboard/owner-view.tsx`
  - Added `created_at` to query
  - Added time calculation helpers
  - Added countdown UI component
  - Added Clock icon import

## Deployment Checklist

- [x] Apply database migration
- [ ] Deploy Edge Function
- [ ] Set up scheduling (GitHub Actions/cron)
- [ ] Test with staging data
- [ ] Monitor for first 48 hours
- [ ] Document in user guide

## Support

For issues or questions, refer to:
- Database function source: `supabase/migrations/20251231000000_add_rental_auto_denial.sql`
- Edge Function: `supabase/functions/auto-deny-rentals/`
- UI implementation: `app/components/dashboard/owner-view.tsx`
