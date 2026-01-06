# GitHub Secrets Setup for Auto-Deny Workflow

To enable the GitHub Actions workflow for auto-denying expired rental requests, you need to add the following secrets to your GitHub repository.

## Required Secrets

### 1. SUPABASE_URL
- **Description**: Your Supabase project URL
- **Format**: `https://<project-ref>.supabase.co`
- **How to find**: 
  1. Go to your Supabase project dashboard
  2. Click on "Settings" → "API"
  3. Copy the "Project URL"

### 2. SUPABASE_ANON_KEY
- **Description**: Your Supabase anonymous/public API key
- **Format**: Long JWT token (starts with `eyJ...`)
- **How to find**:
  1. Go to your Supabase project dashboard
  2. Click on "Settings" → "API"
  3. Copy the "anon public" key

## Adding Secrets to GitHub

1. Go to your GitHub repository
2. Click on "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add each secret:
   - Name: `SUPABASE_URL`
   - Value: Your Supabase project URL
   - Click "Add secret"
5. Repeat for `SUPABASE_ANON_KEY`

## Verify Setup

After adding the secrets:

1. Go to "Actions" tab in your GitHub repository
2. Find the "Auto-Deny Expired Rental Requests" workflow
3. Click "Run workflow" to manually trigger it
4. Check the workflow run to ensure it completes successfully

## Workflow Schedule

The workflow runs automatically:
- **Frequency**: Every 15 minutes
- **Timezone**: UTC
- **Can be manually triggered**: Yes (via "Run workflow" button)

## Monitoring

To view workflow execution:
1. Go to "Actions" tab
2. Click on "Auto-Deny Expired Rental Requests"
3. View recent runs and logs

## Troubleshooting

### Workflow failing with 401 error
- Check that `SUPABASE_ANON_KEY` is correct
- Verify the key hasn't expired

### Workflow failing with 404 error
- Check that `SUPABASE_URL` is correct
- Verify the Edge Function is deployed: `supabase functions list`

### Workflow not running on schedule
- GitHub Actions schedules can have delays during high-traffic times
- Ensure the repository is not private (or you have GitHub Actions minutes available)

## Security Notes

- ✅ **SAFE**: Using anon key is safe because the Edge Function uses service role internally
- ✅ **SAFE**: These secrets are only accessible to GitHub Actions, not public
- ⚠️ **NEVER** commit these values directly to your code
- ⚠️ **ROTATE** keys periodically for security
