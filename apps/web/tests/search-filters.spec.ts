import { test, expect } from '@playwright/test';

test.describe('Search and Filters', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/listings');
        await page.waitForLoadState('domcontentloaded');
        // Wait for inventory to fetch and render
        await expect(page.getByTestId('tool-card').first()).toBeVisible({ timeout: 15000 }).catch(() => {});
    });

    test('Listings page loads and shows results', async ({ page }) => {
        // Verify tools found heading
        const heading = page.locator('h2', { hasText: 'Found' });
        await expect(heading).toBeVisible({ timeout: 15000 });

        // Check if there are tool cards
        const toolCards = page.getByTestId('tool-card');
        const count = await toolCards.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Search by keyword', async ({ page, isMobile }) => {
        if (isMobile) {
            await page.getByLabel('Open filters').click();
            await page.waitForTimeout(500);
        }
        
        const searchInput = page.getByPlaceholder('Search tools...');
        await expect(isMobile ? searchInput.last() : searchInput.first()).toBeVisible();

        // Get initial count
        const initialCount = await page.getByTestId('tool-card').count();

        // Search for a specific keyword that's unlikely to match everything
        await (isMobile ? searchInput.last() : searchInput.first()).fill('drill');
        
        // Wait for results to update (debounce)
        await page.waitForTimeout(500);

        const newCount = await page.getByTestId('tool-card').count();
        expect(newCount).toBeLessThanOrEqual(initialCount);
    });

    test('Category filter', async ({ page, isMobile }) => {
        // Get initial count
        const initialCount = await page.getByTestId('tool-card').count();

        if (isMobile) {
            await page.getByLabel('Open filters').click();
            await page.waitForTimeout(500);
        }

        // Click a category
        const powerToolsLabel = page.getByText('Power Tools', { exact: true });
        await (isMobile ? powerToolsLabel.last() : powerToolsLabel.first()).click();

        // Wait for results
        await page.waitForTimeout(500);

        const filteredCount = await page.getByTestId('tool-card').count();
        expect(filteredCount).toBeLessThanOrEqual(initialCount);

        // Verify active filter badge
        const badge = page.locator('.flex-wrap > div', { hasText: 'Power Tools' });
        await expect(badge).toBeVisible();

        // Remove filter
        if (isMobile) {
            await page.locator('button', { hasText: 'Show Results' }).click();
            await page.waitForTimeout(500);
        } else {
            await badge.locator('svg').click();
            await page.waitForTimeout(500);
        }

        const finalCount = await page.getByTestId('tool-card').count();
        expect(finalCount).toEqual(initialCount);
    });

    test('Instant book filter', async ({ page, isMobile }) => {
        if (isMobile) {
            await page.getByLabel('Open filters').click();
            await page.waitForTimeout(500);
        }
        
        // Find the switch by its associated id
        const instantBookSwitch = isMobile ? page.locator('#mobile-instant') : page.locator('#instant-book');
        await instantBookSwitch.click();

        if (isMobile) {
            await page.locator('button', { hasText: 'Show Results' }).click();
        }

        await page.waitForTimeout(500);

        // Verify all visible cards have the instant badge
        const toolCards = page.getByTestId('tool-card');
        const count = await toolCards.count();
        
        for (let i = 0; i < count; i++) {
            const badge = toolCards.nth(i).getByTestId('instant-badge');
            await expect(badge).toBeVisible();
        }

        // No need to toggle off, test isolation handles cleanup
    });

    test('Sort by price', async ({ page, isMobile }) => {
        if (isMobile) {
            await page.getByLabel('Open sort options').click();
            await page.waitForTimeout(500);
            await page.locator('button', { hasText: 'Price: Lowest First' }).click();
            await page.waitForTimeout(1000);
            await page.getByLabel('Open sort options').click();
            await page.waitForTimeout(500);
            await page.locator('button', { hasText: 'Price: Highest First' }).click();
        } else {
            const sortSelect = page.locator('button[role="combobox"]');
            
            // Sort lowest first
            await sortSelect.click();
            await page.getByRole('option', { name: 'Price: Lowest First' }).click();
            await page.waitForTimeout(1000);
            
            // Sort highest first
            await sortSelect.click();
            await page.getByRole('option', { name: 'Price: Highest First' }).click();
        }
        await page.waitForTimeout(500);
        


        // Get prices again
        const highestFirstCards = page.getByTestId('tool-card');
        const countH = await highestFirstCards.count();
        if (countH > 1) {
            const firstPriceHText = await highestFirstCards.nth(0).locator('.text-lg.font-bold').first().innerText();
            const lastPriceHText = await highestFirstCards.nth(countH - 1).locator('.text-lg.font-bold').first().innerText();
            
            const firstPriceH = parseFloat(firstPriceHText.replace(/[^0-9.]/g, ''));
            const lastPriceH = parseFloat(lastPriceHText.replace(/[^0-9.]/g, ''));
            
            expect(firstPriceH).toBeGreaterThanOrEqual(lastPriceH);
        }
    });

    test('No results state', async ({ page, isMobile }) => {
        if (isMobile) {
            await page.getByLabel('Open filters').click();
            await page.waitForTimeout(500);
        }
        
        // Search for something impossible
        const searchInput = page.getByPlaceholder('Search tools...');
        await (isMobile ? searchInput.last() : searchInput.first()).fill('xyz123impossibletoolsearch');
        
        if (isMobile) {
            // Close filter on mobile so we can see results
            await page.locator('button', { hasText: 'Show Results' }).click();
        }
        
        await page.waitForTimeout(500);

        const emptyState = page.locator('text="No tools found"');
        await expect(emptyState).toBeVisible();

        const resetBtn = page.getByRole('button', { name: 'Reset Filters' });
        await expect(resetBtn).toBeVisible();
        await resetBtn.click();
        
        await page.waitForTimeout(1000);
        await expect(page.getByTestId('tool-card').first()).toBeVisible({ timeout: 10000 });
    });

    test('URL search parameter', async ({ page }) => {
        await page.goto('/listings?search=hammer');
        await page.waitForLoadState('domcontentloaded');

        const searchInput = page.getByPlaceholder('Search tools...');
        await expect(searchInput).toHaveValue('hammer');
    });
});
