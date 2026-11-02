import { test, expect } from '@playwright/test';
import { loginAndInject } from './utils';

test.describe('Verification & Tier Limits', () => {
    test.beforeEach(async ({ context, page }) => {
        // Authenticate programmatically
        await loginAndInject(context);
        await page.goto('/profile');
        await page.waitForLoadState('domcontentloaded');
    });

    test('Profile page renders verification tiers', async ({ page }) => {
        // Verify we are on the profile page by checking the heading
        const heading = page.locator('h1:has-text("Your Profile")');
        await expect(heading).toBeVisible();

        // The "Identity & Trust" tab should be active by default, or we click it
        const identityTab = page.locator('button[role="tab"]', { hasText: 'Identity & Trust' });
        await identityTab.click(); // Ensure it's active

        // Verify Residency Verification row
        const residencyRow = page.locator('div:has-text("Residency Verification")').first();
        await expect(residencyRow).toBeVisible();

        // Verify Government ID row
        const govIdRow = page.locator('div:has-text("Government ID")').first();
        await expect(govIdRow).toBeVisible();
    });

    test('Profile tabs navigate correctly', async ({ page }) => {
        // Click Activity tab
        await page.locator('button[role="tab"]', { hasText: 'Activity' }).click();
        await expect(page.locator('text="Recent Activity"')).toBeVisible();

        // Click Financials tab
        await page.locator('button[role="tab"]', { hasText: 'Financials' }).click();
        await expect(page.locator('text="Payout Methods"')).toBeVisible();

        // Click Protection tab
        await page.locator('button[role="tab"]', { hasText: 'Protection' }).click();
        await expect(page.locator('text="Peace Fund Coverage"')).toBeVisible();
    });

    test('Stripe Connect status', async ({ page }) => {
        await page.locator('button[role="tab"]', { hasText: 'Financials' }).click();
        
        // Either connected or not connected should be visible
        // Just verify the Stripe section exists
        const stripeHeading = page.locator('h3:has-text("Payout Methods")');
        await expect(stripeHeading).toBeVisible();
    });

    test('Neighborhood map renders', async ({ page }) => {
        await page.locator('button[role="tab"]', { hasText: 'Identity & Trust' }).click();
        
        // Wait for neighborhood section
        const neighborhoodHeading = page.locator('h3:has-text("My Neighborhood")');
        await expect(neighborhoodHeading).toBeVisible();
        
        // Verify map container exists
        const mapContainer = page.locator('.mapboxgl-map').first();
        await expect(mapContainer).toBeVisible();
    });
});
