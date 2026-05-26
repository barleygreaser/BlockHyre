import { test, expect } from '@playwright/test';
import { loginAndInject } from './utils';
import { createClient } from '@supabase/supabase-js';

const LISTING_ID = 'f728d568-6a80-4e4c-9609-d8f2199af3b3'; // Makita Impact Drill Kit (non-instant, request)

test.describe('Booking Request & Owner Approval Flow', () => {
    let supabase: any;

    test.beforeAll(async () => {
        const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Cannot set up test data.');
        }

        // Initialize Supabase admin client to clean up test data
        supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false }
        });

        // Clean up any old rentals for this specific listing to ensure dates are free
        const { error } = await supabase
            .from('rentals')
            .delete()
            .eq('listing_id', LISTING_ID);

        if (error) {
            console.warn('Could not clean up old rentals for testing listing:', error.message);
        }
    });

    test('Should complete booking request, database record creation, and owner approval lifecycle', async ({ browser, baseURL }) => {
        test.setTimeout(90000);
        const renterEmail = process.env.TEST_USER_EMAIL;
        const renterPassword = process.env.TEST_USER_PASSWORD;
        const ownerEmail = process.env.TEST_OWNER_EMAIL;
        const ownerPassword = process.env.TEST_OWNER_PASSWORD;

        if (!renterEmail || !renterPassword || !ownerEmail || !ownerPassword) {
            throw new Error('Missing renter or owner environment variables. Ensure .env.test is configured.');
        }

        // ── 1. Create separate browser contexts for Renter & Owner ──
        const renterContext = await browser.newContext({ baseURL, storageState: undefined });
        const ownerContext = await browser.newContext({ baseURL, storageState: undefined });

        // ── 2. Log in both users programmatically to avoid login page rate limits ──
        await loginAndInject(renterContext, renterEmail, renterPassword);
        await loginAndInject(ownerContext, ownerEmail, ownerPassword);

        const renterPage = await renterContext.newPage();
        const ownerPage = await ownerContext.newPage();

        // Ensure renter starts with a clean cart and bypass onboarding overlays
        await renterPage.goto('/');
        await renterPage.evaluate(() => {
            localStorage.removeItem('blockhyre_cart');
            localStorage.setItem('blockhyre_dashboard_onboarding_v1', 'true');
            localStorage.setItem('blockhyre_owner_onboarding_v1', 'true');
        });

        // ── 3. Renter navigates to the request-bookable tool listing ──
        await renterPage.goto(`/listings/${LISTING_ID}/makita-impact-drill-kit`);

        // Verify it is a "Request to Book" listing (should show request-to-rent button, not instant-book)
        const requestToRentBtn = renterPage.locator('[data-testid="request-to-rent-btn"]');
        await expect(requestToRentBtn).toBeVisible({ timeout: 15000 });

        // ── 4. Renter selects rental dates ──
        const availableDays = renterPage.locator('button[data-day]:not([disabled])');
        await expect(availableDays.first()).toBeVisible({ timeout: 10000 });

        // Click first two available days
        await availableDays.first().click();
        await availableDays.nth(1).click();

        // ── 5. Initiate Request booking ──
        await requestToRentBtn.click();

        // Confirm redirect to the booking request page
        await expect(renterPage).toHaveURL(/\/request-booking\/.+/, { timeout: 15000 });

        // ── 6. Fill message and submit request ──
        const messageInput = renterPage.getByPlaceholder("Hi! I'd like to rent this for a weekend project...");
        await expect(messageInput).toBeVisible({ timeout: 10000 });
        await messageInput.fill('Hi, I would like to request to rent your Makita Impact Drill Kit for a quick project.');

        const submitBtn = renterPage.getByRole('button', { name: 'Send Request' });
        await expect(submitBtn).toBeEnabled();
        await submitBtn.click();

        // Renter gets redirected to messages view upon submission
        await expect(renterPage).toHaveURL(/\/messages\?listing=.+/, { timeout: 15000 });

        // ── 7. Database Verification: Check that the rental was created as 'pending' ──
        const { data: rentals, error: dbError } = await supabase
            .from('rentals')
            .select('id, status, renter_id, owner_id')
            .eq('listing_id', LISTING_ID)
            .eq('status', 'pending');

        expect(dbError).toBeNull();
        expect(rentals).not.toBeNull();
        expect(rentals.length).toBe(1);

        const rentalId = rentals[0].id;
        const renterId = rentals[0].renter_id;
        const ownerId = rentals[0].owner_id;

        // ── 8. Owner views dashboard and approves request ──
        // Navigate to / first to set localStorage onboarding flags to bypass overlays
        await ownerPage.goto('/');
        await ownerPage.evaluate(() => {
            localStorage.setItem('blockhyre_dashboard_onboarding_v1', 'true');
            localStorage.setItem('blockhyre_owner_onboarding_v1', 'true');
        });
        await ownerPage.goto('/dashboard?role=owner');

        // Verify the rental request card is visible on owner dashboard
        const requestCard = ownerPage.locator('[data-testid="rental-request-card"]').filter({ hasText: 'wants to rent Makita Impact Drill Kit' });
        await expect(requestCard).toBeVisible({ timeout: 15000 });

        // Click Approve
        const approveBtn = requestCard.getByRole('button', { name: 'Approve' });
        await expect(approveBtn).toBeVisible();
        await approveBtn.click();

        // Verify the success toast notification appears
        await expect(ownerPage.getByText(/RENTAL APPROVED/i)).toBeVisible({ timeout: 15000 });

        // Verify the card is removed from owner's dashboard
        await expect(requestCard).not.toBeVisible({ timeout: 10000 });

        // ── 9. Database Verification: Check status transitions to 'approved' ──
        const { data: updatedRental, error: dbError2 } = await supabase
            .from('rentals')
            .select('status')
            .eq('id', rentalId)
            .single();

        expect(dbError2).toBeNull();
        expect(updatedRental.status).toBe('approved');

        // ── 10. Chat Message Verification: Check system message is present in the chat thread ──
        // Check if a chat thread exists between the two users
        const { data: chat } = await supabase
            .from('chats')
            .select('id')
            .eq('owner_id', ownerId)
            .eq('renter_id', renterId)
            .single();

        expect(chat).not.toBeNull();

        // Check for the BOOKING_CONFIRMED message sent to the chat thread
        const { data: messages } = await supabase
            .from('messages')
            .select('content')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false });

        expect(messages).not.toBeNull();
        // The last system message should contain the booking approval context
        const hasApprovalMessage = messages.some((m: any) => 
            m.content.includes('BOOKING_CONFIRMED') || m.content.includes('confirmed') || m.content.includes('approved')
        );
        expect(hasApprovalMessage).toBe(true);

        // Cleanup: Close contexts
        await renterContext.close();
        await ownerContext.close();
    });
});
