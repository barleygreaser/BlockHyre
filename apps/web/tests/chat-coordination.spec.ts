import { test, expect } from '@playwright/test';
import { loginAndInject } from './utils';

test.describe('Chat & Coordination', () => {
    test.beforeEach(async ({ context, page }) => {
        await loginAndInject(context);
        await page.goto('/messages');
        await page.waitForLoadState('domcontentloaded');
    });

    test('Messages Center Loads & Shows Conversations', async ({ page }) => {
        // Verify Messages heading
        await expect(page.getByTestId('messages-center')).toBeVisible();

        // Verify Conversations sidebar is visible
        const conversationList = page.getByTestId('conversation-list');
        await expect(conversationList).toBeVisible();
    });

    test('Conversation Selection & Message Display', async ({ page }) => {
        // Wait for list to populate (might be empty, so handle both cases gracefully)
        const conversationItems = page.getByTestId('conversation-item');
        const count = await conversationItems.count();

        if (count > 0) {
            // Click the first conversation
            await conversationItems.first().click();
            
            // Verify URL updates with ?id=
            await expect(page).toHaveURL(/.*\/messages\?id=.+/);
            
            // Verify message input is visible
            await expect(page.getByTestId('message-input')).toBeVisible();
        }
    });

    test('Send a New Message', async ({ page }) => {
        const conversationItems = page.getByTestId('conversation-item');
        const count = await conversationItems.count();

        if (count > 0) {
            await conversationItems.first().click();
            
            // Wait for chat to load
            await page.waitForTimeout(1000);
            
            const messageInput = page.getByTestId('message-input');
            const testMsg = `Test message ${Date.now()}`;
            
            await messageInput.fill(testMsg);
            await page.getByTestId('send-message-btn').click();
            
            // Verify message appears
            await expect(page.locator(`text="${testMsg}"`)).toBeVisible();
        }
    });

    test('Cross-User Message Delivery', async ({ browser }) => {
        // Renter Context
        const renterContext = await browser.newContext();
        const renterPage = await renterContext.newPage();
        await loginAndInject(renterContext, process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD);
        
        // Owner Context
        const ownerContext = await browser.newContext();
        const ownerPage = await ownerContext.newPage();
        await loginAndInject(ownerContext, process.env.TEST_OWNER_EMAIL, process.env.TEST_OWNER_PASSWORD);
        
        // Navigate both to messages
        await renterPage.goto('/messages');
        await ownerPage.goto('/messages');
        
        // Renter selects first conversation (assuming one exists between them)
        const renterConversations = renterPage.getByTestId('conversation-item');
        if (await renterConversations.count() > 0) {
            await renterConversations.first().click();
            await renterPage.waitForTimeout(1000); // Wait for chat to load
            
            // Send message
            const testMsg = `Cross-delivery test ${Date.now()}`;
            await renterPage.getByTestId('message-input').fill(testMsg);
            await renterPage.getByTestId('send-message-btn').click();
            
            // Owner selects same conversation
            // In a robust test we'd parse the chat ID, but for now just click first
            const ownerConversations = ownerPage.getByTestId('conversation-item');
            if (await ownerConversations.count() > 0) {
                await ownerConversations.first().click();
                
                // Verify owner sees the message
                await expect(ownerPage.locator(`text="${testMsg}"`)).toBeVisible();
            }
        }
        
        await renterContext.close();
        await ownerContext.close();
    });
});
