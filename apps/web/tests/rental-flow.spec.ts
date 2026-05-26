import { test, expect } from '@playwright/test';

/**
 * Rental Flow E2E Tests
 * 
 * Pre-condition: Authenticated via global storageState (no login step needed).
 * 
 * These tests verify the complete Instant Book checkout lifecycle:
 *   1. Find a valid Instant Book listing (not owned by test user)
 *   2. Select dates → verify cost breakdown
 *   3. Add to cart → proceed to checkout
 *   4. Handle safety gate if present
 *   5. Assert redirect to Stripe checkout
 * 
 * KEY FIXES from audit:
 * - No hardcoded credentials (uses storageState)
 * - No waitForTimeout / networkidle
 * - No force: true bypasses
 * - No "silent pass" on Request flow — test MUST find an Instant listing
 * - Positive URL assertion (stripe.com) instead of weak negative
 * - Uses data-testid selectors where available
 *
 * SEEDING STRATEGY (two-tier):
 * - Primary:  Set TEST_INSTANT_LISTING_ID in .env.test to navigate directly to a
 *             known, pre-seeded listing. Zero DOM scraping, fully deterministic.
 * - Fallback: If the env var is absent, the test discovers an Instant listing from
 *             the /listings page. Provides coverage when seeding isn't configured.
 */

test.describe('Rental Flow — Instant Book Checkout', () => {

    test('Should complete full instant book checkout lifecycle', async ({ page }) => {
        // Ensure a clean cart state before starting
        await page.goto('/');
        await page.evaluate(() => localStorage.removeItem('blockhyre_cart'));



        // ── 2. Locate a valid Instant Book listing (not owned by the test user) ──
        //
        // PRIMARY PATH: navigate directly to a pre-seeded listing.
        // Set TEST_INSTANT_LISTING_ID in .env.test to enable this path.
        // This is fully deterministic and avoids all DOM scraping.
        //
        // FALLBACK PATH: if the env var is absent, discover via the listings page.
        const seededListingId = process.env.TEST_INSTANT_LISTING_ID;

        if (seededListingId) {
            test.info().annotations.push({
                type: 'info',
                description: `Using pre-seeded listing: ${seededListingId}`,
            });
            // Navigate directly — no loop, no DOM scanning
            await page.goto(`/listings/${seededListingId}`);
            // Confirm we did not land on the owner view
            const isOwnerView = await page.getByText(/Manage Listing/i).isVisible().catch(() => false);
            if (isOwnerView) {
                throw new Error(
                    `TEST_INSTANT_LISTING_ID (${seededListingId}) points to a listing owned by the test user. ` +
                    'Update .env.test to reference a listing from a different account.'
                );
            }
        } else {
            // FALLBACK: scan the listings page for an Instant listing we don't own
            await page.goto('/listings');
            await expect(page.getByRole('heading', { name: /Tools? Found/i })).toBeVisible({ timeout: 15000 });

            const instantCards = page.locator('[data-testid="tool-card"]:has([data-testid="instant-badge"])');
            const count = await instantCards.count();

            test.skip(
                count === 0,
                'No Instant Book listings found and TEST_INSTANT_LISTING_ID is not set. ' +
                'Seed test data or add TEST_INSTANT_LISTING_ID to .env.test.'
            );

            let foundValidListing = false;
            const maxAttempts = Math.min(count, 5);

            for (let i = 0; i < maxAttempts; i++) {
                await instantCards.nth(i).locator('[data-testid="tool-card-link"]').click();
                await expect(page).toHaveURL(/\/listings\/.+/);

                const isOwnerView = await page.getByText(/Manage Listing/i).isVisible().catch(() => false);
                if (isOwnerView) {
                    test.info().annotations.push({
                        type: 'info',
                        description: `Listing ${i + 1} belongs to test user, skipping.`,
                    });
                    await page.goto('/listings');
                    await expect(page.getByRole('heading', { name: /Tools? Found/i })).toBeVisible({ timeout: 10000 });
                    continue;
                }

                foundValidListing = true;
                break;
            }

            test.skip(
                !foundValidListing,
                'All attempted Instant listings belong to the test user. ' +
                'Set TEST_INSTANT_LISTING_ID in .env.test to a listing from a different owner.'
            );
        }

        // ── 3. Wait for Listing Details to load ──
        // Verify we actually landed on an Instant Book listing (has "Add to Cart" or "Rent Now")
        const addToCartBtn = page.locator('[data-testid="add-to-cart-btn"]');
        const rentNowBtn = page.locator('[data-testid="rent-now-btn"]');
        
        await expect(
            addToCartBtn.or(rentNowBtn).first()
        ).toBeVisible({ timeout: 10000 });

        // ── 4. Select first two available days ──
        const availableDays = page.locator('button[data-day]:not([disabled])');
        await expect(availableDays.first()).toBeVisible({ timeout: 10000 });

        await availableDays.first().click();
        await availableDays.nth(1).click();

        // ── 5. Verify cost breakdown rendered (web-first assertion, no timeout) ──
        await expect(page.locator('[data-testid="total-due-now"]')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText(/days?\)/i)).toBeVisible({ timeout: 5000 });

        // ── 6. Add to cart ──
        await addToCartBtn.click();
        await expect(page.getByText(/Item added to cart/i)).toBeVisible({ timeout: 10000 });

        // ── 7. Navigate to cart and checkout ──
        await page.goto('/cart');
        await expect(page.getByText(/Order Summary/i)).toBeVisible({ timeout: 10000 });
        await page.getByRole('button', { name: /Proceed to Checkout/i }).click();

        // ── 8. Verify Checkout Page ──
        await expect(page.getByRole('heading', { name: /Checkout/i })).toBeVisible({ timeout: 10000 });
        await expect(page.locator('[data-testid="checkout-order-summary"]')).toBeVisible();

        // ── 9. Initiate Payment ──
        await page.locator('[data-testid="checkout-pay-btn"]').click();

        // ── 10. Handle Safety Gate if applicable ──
        const safetyModal = page.locator('[data-testid="safety-modal"]');
        const isSafetyGateVisible = await safetyModal.isVisible().catch(() => false);

        if (isSafetyGateVisible) {
            test.info().annotations.push({
                type: 'info',
                description: 'Safety gate triggered for high-power item.',
            });

            await page.locator('[data-testid="safety-check-manual"]').click();
            await page.locator('[data-testid="safety-check-waiver"]').click();
            await page.locator('[data-testid="safety-check-condition"]').click();

            const proceedBtn = page.locator('[data-testid="safety-proceed-btn"]');
            await expect(proceedBtn).toBeEnabled();
            await proceedBtn.click();
        }

        // ── 11. POSITIVE ASSERTION: Verify redirect to Stripe checkout ──
        // Instead of the weak `not.toHaveURL(/\/checkout/)` which passes on error pages,
        // we assert the *exact expected destination*.
        await expect(page).toHaveURL(/.*checkout\.stripe\.com.*/, { timeout: 20000 });
    });


    test('Should block invalid system message notification requests (CSRF)', async ({ request }) => {
        // Sending incomplete data to Notification API
        const response = await request.post('/api/notifications/system-message', {
            data: {
                eventName: 'RENTAL_REQUEST_EXPIRING',
                // Missing ownerId, renterId
            }
        });

        // Should return a 403 Forbidden due to CSRF middleware protecting the API
        expect(response.status()).toBe(403);
        const text = await response.text();
        expect(text).toContain('Forbidden');
    });
});
