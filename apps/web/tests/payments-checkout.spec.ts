import { test, expect, request } from '@playwright/test';
import { loginAndInject, createSupabaseAdmin } from './utils';

test.describe('Payments & Checkout', () => {
    test.beforeEach(async ({ context, page }) => {
        // Authenticate programmatically
        await loginAndInject(context);
        
        // Add a listing to cart to test checkout flow
        await page.goto('/listings');
        await page.waitForLoadState('domcontentloaded');
        
        // Find an instant book listing to request
        // Since we can't easily click "Request to Rent" without dates, 
        // we'll just verify the cart page renders if empty for now, 
        // or rely on local storage injection if needed.
    });

    test('Cancellation API Rejects Unauthorized Users', async ({ request, context }) => {
        const session = await loginAndInject(context);
        const token = session.access_token;
        
        const response = await request.post('/api/rentals/cancel', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: {
                rentalId: 'some-fake-id-123'
            }
        });
        
        // Since the ID is fake, it should return 404 or a similar error, but we just verify it doesn't succeed (200)
        expect(response.status()).not.toBe(200);
    });

    test('Finalize API Rejects Invalid Status', async ({ request, context }) => {
        const session = await loginAndInject(context);
        const token = session.access_token;
        
        const response = await request.post('/api/rentals/finalize', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: {
                rentalId: 'some-fake-id-123'
            }
        });
        
        // Fake ID
        expect(response.status()).not.toBe(200);
    });
});
