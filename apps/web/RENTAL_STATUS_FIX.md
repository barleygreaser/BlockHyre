# Rental Status Case Sensitivity Fix

## Problem
**Error**: `new row for relation "rentals" violates check constraint "rentals_status_check"`

This error occurred when owners tried to approve rental requests because the code was using capital-case status values (`'Approved'`, `'Active'`, `'Denied'`, `'Confirmed'`) but the CHECK constraint requires lowercase values.

---

## Root Cause
When we added the `rentals_status_check` constraint (migration `20251228000000_normalize_rental_status.sql`), it enforces lowercase status values:

```sql
CHECK (status IN (
    'pending',
    'approved',
    'rejected',
    'active',
    'returned',
    'completed',
    'cancelled_by_owner',
    'cancelled_by_renter',
    'disputed',
    'archived'
))
```

However, several parts of the codebase were still using capital-case status values.

---

## Files Fixed

### 1. **Database Migration: Existing Data**
**File**: `supabase/migrations/20251229000000_fix_rental_status_case.sql`

**What it does**:
```sql
UPDATE public.rentals
SET status = LOWER(status)
WHERE status != LOWER(status);
```

Converts all existing rental status values to lowercase:
- `'Approved'` → `'approved'`
- `'Active'` → `'active'`
- `'Returned'` → `'returned'`

### 2. **Database RPC: approve_rental_request**
**File**: `supabase/migrations/20251229000001_fix_approve_rental_status.sql`

**Changes**:
```sql
-- Line 28: Conflict check
status IN ('approved', 'active')  -- ✅ Was: ('Approved', 'Active')

-- Line 38: Update status
SET status = 'approved'  -- ✅ Was: 'Approved'
```

### 3. **Frontend: Owner Dashboard**
**File**: `app/components/dashboard/owner-view.tsx`

**Change**:
```typescript
// Line 216: Deny/reject rental
.update({ status: 'rejected' })  // ✅ Was: 'denied'
```

**Note**: Changed from `'denied'` to `'rejected'` to match the constraint.

### 4. **Backend: Stripe Webhook**
**File**: `app/api/stripe/webhook/route.ts`

**Change**:
```typescript
// Line 63: After payment confirmation
status: 'approved'  // ✅ Was: 'confirmed'
```

**Note**: Changed from `'confirmed'` to `'approved'` since `'confirmed'` is not in the constraint.

---

## Status Values Quick Reference

| Code Should Use | ❌ Wrong (Capital) | ❌ Wrong (Other) |
|-----------------|-------------------|------------------|
| `'pending'` | `'Pending'` | - |
| `'approved'` | `'Approved'` | `'confirmed'` |
| `'rejected'` | `'Rejected'` / `'Denied'` | `'denied'` |
| `'active'` | `'Active'` | - |
| `'returned'` | `'Returned'` | - |
| `'completed'` | `'Completed'` | - |
| `'archived'` | `'Archived'` | - |

---

## Testing

After these fixes, the following flows should work:

### ✅ Request to Rent Flow
1. Renter submits booking request → `status: 'pending'`
2. Owner approves → `status: 'approved'`
3. Rental starts → `status: 'active'`
4. Tool returned → `status: 'returned'`
5. Rental complete → `status: 'completed'`

### ✅ Instant Booking (Stripe) Flow
1. Renter pays via Stripe → `status: 'approved'`
2. Rental starts → `status: 'active'`
3. Tool returned → `status: 'returned'`
4. Rental complete → `status: 'completed'`

### ✅ Rejection Flow
1. Renter submits → `status: 'pending'`
2. Owner rejects → `status: 'rejected'`

---

## Migrations Applied

1. ✅ `20251228000000_normalize_rental_status.sql` - Added CHECK constraint
2. ✅ `20251229000000_fix_rental_status_case.sql` - Normalized existing data
3. ✅ `20251229000001_fix_approve_rental_status.sql` - Fixed RPC function

---

## Summary

**Problem**: Mixed case status values caused CHECK constraint violations
**Solution**: Normalized all status values to lowercase across:
- Existing database data
- RPC functions
- Frontend code
- Backend APIs

**Result**: Owner can now successfully approve rental requests! ✅
