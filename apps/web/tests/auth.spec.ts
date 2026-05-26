import { test, expect } from '@playwright/test';

/**
 * Authentication & Security Tests
 *
 * These tests verify core auth flows and middleware protection.
 * Credentials are sourced from .env.test — never hardcoded.
 *
 * Teardown: The afterAll hook deletes the timestamped user created in the
 * signup test via the Supabase Admin API, preventing database pollution across runs.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.test.
 */

const TEST_SIGNUP_EMAIL_PREFIX = 'pw-test-';
let createdTestEmail: string | null = null;

test.describe('Authentication & Security', () => {

    /**
     * Teardown: delete the test user created by the signup test.
     * Uses the Supabase Admin API which requires the service role key.
     * This runs after ALL tests in this describe block complete.
     */
    test.afterAll(async ({ request }) => {
        if (!createdTestEmail) return;

        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            test.info().annotations.push({
                type: 'warning',
                description: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — skipping test user teardown.',
            });
            return;
        }

        // Step 1: Look up the user's UUID by email via the Admin API
        const listResponse = await request.get(
            `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(createdTestEmail)}`,
            { headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey } }
        );

        if (!listResponse.ok()) {
            test.info().annotations.push({
                type: 'warning',
                description: `Could not look up test user for deletion: ${listResponse.status()}`,
            });
            return;
        }

        const body = await listResponse.json();
        // Supabase returns { users: [...] } from the admin list endpoint
        const users: Array<{ id: string; email: string }> = body.users ?? [];
        const match = users.find((u) => u.email === createdTestEmail);

        if (!match) {
            test.info().annotations.push({
                type: 'info',
                description: `Test user ${createdTestEmail} not found — may not have been created (e.g., email confirmation pending).`,
            });
            return;
        }

        // Step 2: Hard-delete the user by UUID
        const deleteResponse = await request.delete(
            `${supabaseUrl}/auth/v1/admin/users/${match.id}`,
            { headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey } }
        );

        if (!deleteResponse.ok()) {
            test.info().annotations.push({
                type: 'warning',
                description: `Failed to delete test user ${createdTestEmail} (${match.id}): ${deleteResponse.status()}`,
            });
        } else {
            test.info().annotations.push({
                type: 'info',
                description: `Teardown: deleted test user ${createdTestEmail} (${match.id}).`,
            });
        }
    });

    test('User should be able to sign up with valid credentials', async ({ page }) => {
        await page.goto('/auth');

        // Switch to signup mode
        const signupToggle = page.getByRole('button', { name: /Sign Up/i });
        if (await signupToggle.isVisible()) {
            await signupToggle.click();
        }

        const nameInput = page.getByPlaceholder(/Full Name/i);
        await expect(nameInput).toBeVisible({ timeout: 10000 });
        await nameInput.fill('Playwright Test User');

        createdTestEmail = `${TEST_SIGNUP_EMAIL_PREFIX}${Date.now()}@example.com`;
        await page.getByPlaceholder(/Email address/i).fill(createdTestEmail);
        await page.getByPlaceholder(/Password/i).fill('TestPass123!');

        await page.getByRole('button', { name: /Sign Up/i }).first().click();

        // Supabase may redirect to /auth/verify for email confirmation,
        // or directly to /dashboard depending on config
        await expect(page).toHaveURL(/.*(?:dashboard|verify).*/, { timeout: 15000 });
    });

    test('User should be able to log in', async ({ page }) => {
        const email = process.env.TEST_USER_EMAIL;
        const password = process.env.TEST_USER_PASSWORD;

        if (!email || !password) {
            test.skip(!email || !password, 'Missing TEST_USER_EMAIL or TEST_USER_PASSWORD');
            return;
        }

        await page.goto('/auth');
        await page.getByPlaceholder(/Email address/i).fill(email);
        await page.getByPlaceholder(/Password/i).fill(password);
        await page.getByPlaceholder(/Password/i).press('Enter');

        await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
    });

    test('Incorrect credentials should show error message', async ({ page }) => {
        await page.goto('/auth');
        await page.getByPlaceholder(/Email address/i).fill('wrong@example.com');
        await page.getByPlaceholder(/Password/i).fill('WrongPassword1');
        await page.getByPlaceholder(/Password/i).press('Enter');

        await expect(page.getByText(/Invalid/i)).toBeVisible({ timeout: 10000 });
    });

    test('Middleware should redirect unauthenticated users from /dashboard', async ({ browser }) => {
        // Use a fresh, unauthenticated browser context to avoid the global storageState
        const context = await browser.newContext({ storageState: undefined });
        const page = await context.newPage();

        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/auth/);

        await context.close();
    });

    test('Middleware should redirect unauthenticated users from /cart', async ({ browser }) => {
        // Use a fresh, unauthenticated browser context to avoid the global storageState
        const context = await browser.newContext({ storageState: undefined });
        const page = await context.newPage();

        await page.goto('/cart');
        await expect(page).toHaveURL(/\/auth/);

        await context.close();
    });
});
