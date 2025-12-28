# Booking Request Flow Documentation

## Overview
This document explains the complete booking request workflow from when a renter requests to rent a tool until the owner approves or rejects it.

---

## Booking Request Flow

### Step 1: Renter Initiates Booking Request
**Page**: `/request-booking/[id]`

**User Actions:**
1. Renter selects dates on the listing page
2. Clicks "Request to Book"
3. Gets redirected to `/request-booking/[listingId]?from=[startDate]&to=[endDate]`
4. Writes a message to the owner
5. Clicks "Send Request"

### Step 2: System Creates Rental & Chat

**What Happens (in `handleSubmit`):**

#### A. Calculate Rental Fees
```typescript
const totalDays = end.diff(start, 'day') + 1;
const dailyPrice = listing.daily_price;
const riskTier = category.risk_tier; // from listings.category
const peaceFundFee = dailyPrice * riskTier * totalDays;
const rentalFee = dailyPrice * totalDays;
const totalPaid = rentalFee + peaceFundFee;
```

#### B. Create Rental Record
```typescript
INSERT INTO rentals (
    listing_id,
    renter_id,
    owner_id,
    start_date,
    end_date,
    total_days,
    daily_price_snapshot,
    risk_fee_snapshot,
    rental_fee,
    peace_fund_fee,
    total_paid,
    is_barter_deal,
    status  -- SET TO 'pending'
)
```

**Key Points:**
- Status is set to `'pending'` (waiting for owner approval)
- All financial details are calculated and stored
- `owner_id` is included for easier queries
- Rental is immediately visible in database

#### C. Create or Get Chat Thread
```typescript
// Check if chat already exists for this listing with these users
SELECT id FROM chats 
WHERE listing_id = ? 
AND owner_id = ?
AND renter_id = ?

// If not found, create new chat
INSERT INTO chats (listing_id, owner_id, renter_id)
```

#### D. Send Booking Request Message
```typescript
INSERT INTO messages (
    chat_id,
    sender_id,
    content,
    is_system_message,       -- TRUE
    system_message_type      -- 'booking_request'
)
```

**Message Format:**
```
📅 **Booking Request**

[User's custom message]

**Dates:** Jan 5, 2026 - Jan 10, 2026
**Duration:** 5 days
**Total:** $481.50 (Rental: $450.00 + Peace Fund: $31.50)
```

### Step 3: Renter is Redirected
**Redirect**: `/messages?listing=[listingId]&chat=[chatId]`

The renter can now:
- See the booking request message they sent
- Continue chatting with the owner
- Wait for owner's response

---

## Owner's View

### Where Owner Sees the Request

#### 1. **Messages Page** (`/messages`)
- New message notification
- Shows the booking request message
- Can reply to renter

#### 2. **Owner Dashboard** (Future Enhancement)
- Could show pending rental count
- Link to approve/reject rentals

#### 3. **Active Rentals Page** (`/owner/active-rentals`)
- Currently only shows `approved`, `active`, `returned` status
- **Missing**: Should also show `pending` rentals for owner to review

---

## Rental Status Progression

```
[Renter Submits] → pending
                    ↓
[Owner Reviews]  →  approved / rejected
                    ↓
[Start Date]     →  active
                    ↓
[Renter Returns] →  returned
                    ↓
[Owner Confirms] →  completed
```

---

## Database Tables Involved

### 1. `public.rentals`
**Created**: A new row with status `'pending'`
**Fields Populated**:
- listing_id, renter_id, owner_id
- start_date, end_date, total_days
- daily_price_snapshot, risk_fee_snapshot
- rental_fee, peace_fund_fee, total_paid
- status = `'pending'`

### 2. `public.chats`
**Created**: If no chat exists for this listing between these users
**Fields**:
- listing_id
- owner_id (tool owner)
- renter_id (person renting)

### 3. `public.messages`
**Created**: Booking request message
**Fields**:
- chat_id
- sender_id (renter)
- content (formatted booking request)
- is_system_message = true
- system_message_type = 'booking_request'

---

## Frontend Components Modified

### File: `app/request-booking/[id]/page.tsx`

**Changes Made:**
1. ✅ Added `useAuth` hook to get current user
2. ✅ Added `supabase` import for database operations
3. ✅ Implemented complete `handleSubmit` function
4. ✅ Added rental creation logic
5. ✅ Added chat creation/retrieval logic
6. ✅ Added booking request message sending
7. ✅ Added loading state (`submitting`)
8. ✅ Added proper error handling
9. ✅ Redirect to messages page after success

---

## What's Still Needed

### High Priority
1. **Owner Approval Interface**: UI for owner to approve/reject pending rentals
2. **Pending Rentals Filter**: Add "Pending Requests" tab in `/owner/active-rentals`
3. **Notification System**: Email/in-app notifications when:
   - Owner receives new booking request
   - Renter's request is approved/rejected

### Medium Priority
1. **Payment Integration**: Connect Stripe for actual payments
2. **Cancellation Flow**: Allow either party to cancel
3. **Dispute Flow**: Handle disputes

### Low Priority
1. **Barter Support**: Handle barter deal flow
2. **Calendar Blocking**: Block dates when rental is approved
3. **Auto-rejection**: Auto-reject if owner doesn't respond in X days

---

## Testing the Flow

### Manual Test Steps:
1. Login as a renter
2. Browse to a listing
3. Select dates and click "Request to Book"
4. Fill in message and submit
5. **Verify**:
   - New row in `public.rentals` with status='pending'
   - New/existing chat in `public.chats`
   - New message in `public.messages` with booking details
   - Redirected to messages page
6. Login as the owner
7. Check messages - should see the booking request
8. (Future) Check pending rentals section

---

## Code Example: Approving a Rental

```typescript
// Owner approves rental
await supabase
  .from('rentals')
  .update({ 
    status: 'approved',
    owner_approval_ts: new Date().toISOString()
  })
  .eq('id', rentalId);

// Send approval message
await supabase
  .from('messages')
  .insert({
    chat_id: chatId,
    sender_id: ownerId,
    content: '✅ Your booking request has been approved!',
    is_system_message: true,
    system_message_type: 'booking_approved'
  });
```

---

## Summary

✅ **What Now Works:**
- Renter can submit booking requests
- Rentals are created in database with `pending` status
- Chat threads are created automatically
- Booking request messages are sent to owner
- All financial calculations are stored

⚠️ **What's Missing:**
- Owner approval/rejection UI
- Payment processing
- Notifications
- Pending rentals display for owners

The core booking request infrastructure is now in place and functional!
