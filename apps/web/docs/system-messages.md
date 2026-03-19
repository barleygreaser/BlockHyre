# System Messages - Technical Documentation

## Overview
System messages are automated notifications sent to users during key rental workflow events. They use **Liquid templates** for dynamic content and support **role-based messaging** (different content for owner vs renter).

## Architecture

### Database Schema

#### `system_message_templates` Table
```sql
- id: uuid (primary key)
- event_name: text (unique identifier like 'BOOKING_CONFIRMED')
- template_body: text (Liquid template string)
- description: text
- sends_external_alert: boolean
- alert_type: text (e.g., "email, push")
```

#### `messages` Table
```sql
- id: uuid (primary key)
- chat_id: uuid (foreign key to chats)
- sender_id: uuid (foreign key to users)
- recipient_id: uuid (for targeted messages)
- content: text (rendered template)
- message_type: text ('system' | 'text')
- is_read: boolean
- created_at: timestamptz
```

---

## How It Works

### 1. Template Creation
Templates are stored in the database with **Liquid syntax** for conditionals and variables:

```liquid
{% if recipient_role == 'owner' %}
  ✅ **New Booking!** {{ tool_name }} rented by {{ renter_name }}.
  **Earnings:** ${{ owner_earnings }}
{% elsif recipient_role == 'renter' %}
  🎉 **Confirmed!** Your booking for {{ tool_name }} is confirmed.
  **Total:** ${{ total_paid }}
{% endif %}
```

**Important:** 
- No leading spaces/indentation (causes formatting issues)
- Use `**bold**` for emphasis (markdown)
- Use `{{ variable }}` for substitution
- Use `{% if recipient_role == 'owner' %}` for role-based content
- **NEVER** use math operations in templates like `{{ total * 0.9 }}` - pre-calculate in JavaScript

### 2. Sending System Messages

#### Frontend Helper (`app/lib/chat-helpers.ts`)
```typescript
await sendSystemMessage(
  chatId,           // UUID of the chat
  'BOOKING_CONFIRMED',  // event_name from templates table
  {                 // Context variables
    tool_name: 'Drill',
    owner_name: 'John',
    renter_name: 'Jane',
    total_paid: '50.00',
    owner_earnings: '45.00',  // Pre-calculated!
    // ... more variables
  },
  ownerId,          // Sender (usually owner)
  renterId          // For recipient filtering
);
```

#### Backend RPC (`send_system_message`)
```sql
CREATE FUNCTION send_system_message(
  p_chat_id uuid,
  p_content text,        -- Already rendered content
  p_sender_id uuid,
  p_recipient_id uuid
)
```

### 3. Message Flow

```
┌─────────────────────┐
│ User Action         │
│ (e.g., approve)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Frontend calls sendSystemMessage()  │
│ - Fetches template from DB          │
│ - Renders TWICE (owner & renter)    │
│ - Calls RPC for each version        │
└──────────┬──────────────────────────┘
           │
           ▼
┌────────────────────────┐
│ Liquid Rendering       │
│ - Replace {{ vars }}   │
│ - Evaluate {% if %}    │
│ - Output plain text    │
└──────────┬─────────────┘
           │
           ▼
┌──────────────────────┐
│ RPC inserts message  │
│ - Sets recipient_id  │
│ - Type = 'system'    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Frontend displays    │
│ - Filters by user    │
│ - ReactMarkdown      │
│ - Centered styling   │
└──────────────────────┘
```

---

## Template Best Practices

### ✅ DO
- Pre-calculate all math operations in JavaScript
- Remove all leading whitespace/indentation
- Use markdown for formatting (`**bold**`, `_italic_`)
- Test with both owner and renter roles
- Keep messages concise (mobile-friendly)
- Use emojis for visual clarity (🎉, ✅, ❌)

### ❌ DON'T
- Use math in templates: `{{ total * 0.9 }}` ← **Will fail!**
- Add leading spaces/tabs (breaks formatting)
- Use complex nested conditionals
- Forget to escape single quotes: `'renter'` → `''renter''`

---

## Current System Messages

*Last Updated: 2026-03-04T20:42:00*

| Event Name | Trigger | Roles | Status |
|------------|---------|-------|--------|
| `BOOKING_CONFIRMED` | Owner approves rental | Owner, Renter | ✅ Active |
| `RENTAL_REQUEST_SUBMITTED` | Renter submits request | Owner, Renter | ✅ Active |
| `RENTAL_REQUEST_EXPIRING` | Request < 2 hours until auto-denial | Owner only | ✅ Active |
| `RENTAL_REQUEST_REJECTED` | Owner manually declines request | Owner, Renter | ✅ Active |
| `RENTAL_REQUEST_AUTO_DENIED` | Request auto-denied after 24 hours | Owner, Renter | ✅ Active |
| `RENTAL_CANCELLED` | Cancellation occurs | Owner, Renter | ❌ Removed (Handled functionally) |
| `LISTING_INQUIRY` | New chat started | Owner, Renter | ✅ Active |
| `RENTAL_OVERDUE` | Return date passed | Owner, Renter | ✅ Active |
| `RETURN_REMINDER_TODAY` | Day of return | Owner, Renter | ✅ Active |
| `RETURN_REMINDER_TOMORROW` | 24h before return | Owner, Renter | ✅ Active |
| `EXTENSION_REQUEST` | Renter requests extension | Owner, Renter | ✅ Active |
| `EXTENSION_APPROVED` | Owner approves extension | Owner, Renter | ✅ Active |
| `EXTENSION_REJECTED` | Owner rejects extension | Owner, Renter | ✅ Active |

### System Messages Chronological Sequence (Full Journey)
When testing or simulating a full rental journey, system messages are typically expected in the following sequential order:

1. `LISTING_INQUIRY` (Renter spots a listing and clicks "Rent Tool" or "Contact Owner")
2. `RENTAL_REQUEST_SUBMITTED` (Renter formally submits their dates/payment details)
3. `RENTAL_REQUEST_EXPIRING` (Owner is warned 2 hours prior to the 24h expiration limit)
4. `RENTAL_REQUEST_REJECTED` (Owner actively denies) OR `RENTAL_REQUEST_AUTO_DENIED` (24h period expires)
5. `BOOKING_CONFIRMED` (Owner actively approves)
6. `EXTENSION_REQUEST` (Before return, Renter asks for more time)
7. `EXTENSION_REJECTED` (Owner actively denies extension)
8. `EXTENSION_APPROVED` (Owner accepts extension)
9. `RETURN_REMINDER_TOMORROW` (24 hours prior to the end date)
10. `RETURN_REMINDER_TODAY` (On the end date)
11. `RENTAL_OVERDUE` (End date passes without the tool being returned)

---

## Rendering on Frontend

### Component: `SystemMessage` (`app/components/messages/system-message.tsx`)

```tsx
export function SystemMessage({ content }: SystemMessageProps) {
  return (
    <div className="flex justify-center my-4 w-full">
      <div className="max-w-md w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-xs text-blue-600 font-semibold mb-2">
          📋 System Message
        </div>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
```

**Key Features:**
- Centered layout
- Blue background for distinction
- ReactMarkdown for formatting
- Max width to prevent overflow

### Filtering Logic (`components/realtime-chat.tsx`)

```tsx
// Only show message if it's for this user or is a broadcast
if (message.recipient_id && message.recipient_id !== currentUserId) {
  return null; // Skip
}

return <SystemMessage content={message.content} />;
```

---

## Adding a New System Message

### Step 1: Create Template (Migration)
```sql
INSERT INTO system_message_templates (event_name, template_body, description)
VALUES (
  'MY_NEW_EVENT',
  '{% if recipient_role == ''owner'' %}
Owner message here: {{ tool_name }}
{% elsif recipient_role == ''renter'' %}
Renter message here: {{ tool_name }}
{% endif %}',
  'Description of when this is sent'
);
```

### Step 2: Call from Code
```typescript
await sendSystemMessage(
  chatId,
  'MY_NEW_EVENT',
  {
    tool_name: listing.title,
    // Add all variables used in template
    recipient_role: 'owner' // Filled automatically
  },
  ownerId,
  renterId
);
```

### Step 3: Test Both Roles
- Login as owner → check message
- Login as renter → check message
- Verify formatting, no overflow, correct content

---

## Common Issues & Solutions

### Issue: Template shows raw Liquid syntax
**Cause:** Template not being rendered, sent as-is  
**Fix:** Ensure `sendSystemMessage()` is calling `engine.parseAndRender()`

### Issue: Math error "expected | before filter"
**Cause:** Using `{{ total * 0.9 }}` in template  
**Fix:** Pre-calculate in context: `owner_earnings: (total * 0.9).toFixed(2)`

### Issue: Message not visible to user
**Cause:** `recipient_id` not matching current user  
**Fix:** Check filtering logic in `realtime-chat.tsx`

### Issue: Formatting looks wrong (different font, overflow)
**Cause:** Leading spaces in template  
**Fix:** Remove ALL leading whitespace from template body

### Issue: Empty error object `{}`
**Cause:** Supabase error not serializing  
**Fix:** Use `JSON.stringify(error, null, 2)` for logging

---

## Database Queries

### Get all templates
```sql
SELECT event_name, description 
FROM system_message_templates 
ORDER BY event_name;
```

### View template content
```sql
SELECT template_body 
FROM system_message_templates 
WHERE event_name = 'BOOKING_CONFIRMED';
```

### See recent system messages
```sql
SELECT m.content, m.created_at, u.full_name as sender
FROM messages m
JOIN users u ON m.sender_id = u.id
WHERE m.message_type = 'system'
ORDER BY m.created_at DESC
LIMIT 10;
```

---

## Future Enhancements
- [ ] Email delivery via external alert system
- [ ] Push notifications
- [ ] Message read receipts
- [ ] Template versioning
- [ ] A/B testing different message formats
- [ ] Analytics on message open rates
