# Rental Status System Documentation

## Complete Status Lifecycle

### Status Values & Meanings

| Status | Description | When Applied | Next Possible Status |
|--------|-------------|--------------|---------------------|
| `pending` | Rental request submitted, awaiting owner approval | When renter books a tool | `approved`, `rejected` |
| `approved` | Owner approved the request | When owner approves booking | `active`, `cancelled_by_owner`, `cancelled_by_renter` |
| `rejected` | Owner declined the rental request | When owner rejects booking | N/A (terminal state) |
| `active` | Rental currently in progress | When start_date is reached | `returned`, `disputed` |
| `returned` | Tool has been returned by renter | When renter returns tool | `completed`, `disputed` |
| `completed` | Rental finished, all settled | When rental is fully closed | `archived` |
| `cancelled_by_owner` | Owner cancelled before rental start | Owner cancels approved booking | N/A (terminal state) |
| `cancelled_by_renter` | Renter cancelled before rental start | Renter cancels approved booking | N/A (terminal state) |
| `disputed` | Issue raised (damage, late, etc.) | When either party raises dispute | `completed` (after resolution) |
| `archived` | Historical record, no longer active | Manual archiving of old rentals | N/A (terminal state) |

## Status Flow Diagram

```
[pending] ─────┬───> [approved] ───┬───> [active] ───┬───> [returned] ───> [completed] ───> [archived]
               │                    │                 │
               └───> [rejected]     └───> [cancelled_by_owner]
                                    └───> [cancelled_by_renter]
                                    
                     [any status] ──────> [disputed] ──────> [completed]
```

## Database Schema Updates Applied

### New Columns Added:
- `cancelled_at` (timestamptz) - When the rental was cancelled
- `cancellation_reason` (text) - Reason provided for cancellation
- `disputed_at` (timestamptz) - When a dispute was raised
- `dispute_reason` (text) - Description of the dispute
- `dispute_resolved_at` (timestamptz) - When dispute was resolved

### Constraints Added:
- CHECK constraint enforcing only valid status values (lowercase)
- Index on `status` column for improved query performance

### Data Normalization:
- All existing status values converted to lowercase
- Ensures consistency across the application

## Frontend Usage

### Filter Categories Mapping:

**Upcoming Rentals:**
- Status: `approved`
- Condition: `start_date > now()`

**Active Rentals:**
- Status: `active` OR `approved`
- Condition: `start_date <= now() AND end_date >= now()`

**Overdue Rentals:**
- Status: `active`, `approved`
- Condition: `end_date < now()`

**Completed Rentals:**
- Status: `completed`, `returned`, `archived`

**All Active (Owner View):**
- Status: `approved`, `active`, `returned`

## Code Examples

### Setting Status:
```typescript
// Approve a rental
await supabase
  .from('rentals')
  .update({ 
    status: 'approved',
    owner_approval_ts: new Date().toISOString()
  })
  .eq('id', rentalId);

// Cancel by owner
await supabase
  .from('rentals')
  .update({ 
    status: 'cancelled_by_owner',
    cancelled_at: new Date().toISOString(),
    cancellation_reason: 'Tool no longer available'
  })
  .eq('id', rentalId);

// Mark as disputed
await supabase
  .from('rentals')
  .update({ 
    status: 'disputed',
    disputed_at: new Date().toISOString(),
    dispute_reason: 'Tool returned damaged'
  })
  .eq('id', rentalId);
```

### Querying by Status:
```typescript
// Get all active rentals
const { data } = await supabase
  .from('rentals')
  .select('*')
  .in('status', ['approved', 'active', 'returned']);

// Get pending approvals
const { data } = await supabase
  .from('rentals')
  .select('*')
  .eq('status', 'pending')
  .order('created_at', { ascending: true });
```

## Migration Applied
- **File**: `20251228000000_normalize_rental_status.sql`
- **Date**: 2025-12-28
- **Status**: ✅ Successfully applied

## Notes
- All status values are **lowercase** for consistency
- The CHECK constraint prevents invalid status values at the database level
- Additional tracking fields allow for better audit trails and dispute resolution
- Existing data has been normalized to lowercase
