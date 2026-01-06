# Auto-Deny Expired Rentals

This Edge Function automatically denies rental requests that have been pending for more than 24 hours.

## How It Works

1. **Database Function**: `auto_deny_expired_rentals()` in the database checks for pending rentals older than 24 hours and updates their status to 'rejected'
2. **Edge Function**: This function calls the database function periodically
3. **UI Display**: The owner dashboard shows a countdown timer for each pending request

## Deployment

### Deploy the Edge Function

```bash
supabase functions deploy auto-deny-rentals
```

### Schedule the Function

You have several options to schedule this function:

#### Option 1: GitHub Actions (Recommended for Production)

Create `.github/workflows/auto-deny-rentals.yml`:

```yaml
name: Auto-Deny Expired Rentals

on:
  schedule:
    # Run every 15 minutes
    - cron: '*/15 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  auto-deny:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST "${{ secrets.SUPABASE_URL }}/functions/v1/auto-deny-rentals" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"
```

#### Option 2: Cron Job Service (e.g., cron-job.org)

1. Go to cron-job.org or similar service
2. Create a new cron job:
   - **URL**: `https://<your-project-ref>.supabase.co/functions/v1/auto-deny-rentals`
   - **Schedule**: Every 15 minutes
   - **Method**: POST
   - **Headers**: 
     - `Authorization: Bearer <your-anon-key>`
     - `Content-Type: application/json`

#### Option 3: Vercel Cron (if using Vercel)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-deny-rentals",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

Then create `pages/api/cron/auto-deny-rentals.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auto-deny-rentals`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to run auto-denial' });
  }
}
```

#### Option 4: pg_cron (Database Level - Requires Supabase Pro)

If you have access to pg_cron extension:

```sql
SELECT cron.schedule(
  'auto-deny-expired-rentals',
  '*/15 * * * *',  -- Every 15 minutes
  $$SELECT public.auto_deny_expired_rentals();$$
);
```

## Testing

Test the Edge Function manually:

```bash
# Local testing
supabase functions serve auto-deny-rentals

# In another terminal
curl -X POST http://localhost:54321/functions/v1/auto-deny-rentals \
  -H "Authorization: Bearer <your-anon-key>" \
  -H "Content-Type: application/json"
```

## Monitoring

Check the logs:

```bash
supabase functions logs auto-deny-rentals
```

## Notes

- The function runs with service role permissions to update rentals
- Expired rentals are marked as 'rejected' with reason "Automatically denied - owner did not respond within 24 hours"
- The UI shows a countdown timer for owners to see how much time remains
- Urgent warnings appear when less than 2 hours remain
