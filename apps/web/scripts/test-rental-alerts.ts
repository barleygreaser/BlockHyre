import { config } from 'dotenv';
config({ path: '.env.local' });

import { sendEmail } from '../lib/email';
import RentalAlertEmail from '../emails/rental-alert';

// Resend free tier only allows sending to the verified email address.
const TEST_EMAIL = 'robinsonc24@gmail.com';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const mockContext = {
    tool_name: 'DeWalt 12" Miter Saw',
    renter_name: 'John Doe',
    owner_name: 'Christopher',
    start_date: 'Apr 10, 2026',
    end_date: 'Apr 13, 2026',
    new_end_date: 'Apr 16, 2026',
};

interface TestCase {
    label: string;
    subject: string;
    headline: string;
    accentColor: string;
    bodyText: string;
    detailLines: string[];
    ctaLabel: string;
    ctaPath: string;
}

const testCases: TestCase[] = [
    {
        label: 'RENTAL_REQUEST_EXPIRING',
        subject: `⏰ Action needed: Request for ${mockContext.tool_name} expires soon`,
        headline: '⏰ Request Expiring Soon',
        accentColor: '#F59E0B',
        bodyText: `The rental request from ${mockContext.renter_name} for your ${mockContext.tool_name} is about to expire. If you don't respond, it will be automatically denied.`,
        detailLines: [
            `Tool: ${mockContext.tool_name}`,
            `Renter: ${mockContext.renter_name}`,
            `Dates: ${mockContext.start_date} – ${mockContext.end_date}`,
        ],
        ctaLabel: 'Review Request',
        ctaPath: '/dashboard?role=owner',
    },
    {
        label: 'RENTAL_REQUEST_REJECTED',
        subject: `Your request for ${mockContext.tool_name} was declined`,
        headline: 'Request Declined',
        accentColor: '#EF4444',
        bodyText: `Unfortunately, ${mockContext.owner_name} has declined your rental request for the ${mockContext.tool_name}. Your payment has been automatically refunded.`,
        detailLines: [
            `Tool: ${mockContext.tool_name}`,
            `Dates: ${mockContext.start_date} – ${mockContext.end_date}`,
        ],
        ctaLabel: 'Browse Other Tools',
        ctaPath: '/listings',
    },
    {
        label: 'RENTAL_REQUEST_AUTO_DENIED',
        subject: `Rental request for ${mockContext.tool_name} expired`,
        headline: 'Request Auto-Expired',
        accentColor: '#6B7280',
        bodyText: `The rental request for ${mockContext.tool_name} has expired because it was not responded to within 24 hours. The payment has been automatically refunded.`,
        detailLines: [
            `Tool: ${mockContext.tool_name}`,
            `Dates: ${mockContext.start_date} – ${mockContext.end_date}`,
        ],
        ctaLabel: 'View Dashboard',
        ctaPath: '/dashboard',
    },
    {
        label: 'RETURN_REMINDER_TOMORROW',
        subject: `📦 Reminder: ${mockContext.tool_name} is due back tomorrow`,
        headline: '📦 Return Reminder',
        accentColor: '#3B82F6',
        bodyText: `Just a friendly reminder — the ${mockContext.tool_name} is due back tomorrow. Please coordinate the return with your neighbor via messaging.`,
        detailLines: [
            `Tool: ${mockContext.tool_name}`,
            `Return Date: ${mockContext.end_date}`,
        ],
        ctaLabel: 'Open Messages',
        ctaPath: '/messages',
    },
    {
        label: 'RETURN_REMINDER_TODAY',
        subject: `📦 Due today: ${mockContext.tool_name}`,
        headline: '📦 Return Due Today',
        accentColor: '#F59E0B',
        bodyText: `The ${mockContext.tool_name} is due back today. Please return it promptly to avoid overdue status. Don't forget to take return photos!`,
        detailLines: [
            `Tool: ${mockContext.tool_name}`,
            `Due: Today`,
        ],
        ctaLabel: 'View Rental',
        ctaPath: '/my-rentals',
    },
    {
        label: 'RENTAL_OVERDUE',
        subject: `🚨 OVERDUE: ${mockContext.tool_name} has not been returned`,
        headline: '🚨 Rental Overdue',
        accentColor: '#DC2626',
        bodyText: `The ${mockContext.tool_name} is past its return date and is now marked overdue. Please coordinate the immediate return to avoid potential Peace Fund claims.`,
        detailLines: [
            `Tool: ${mockContext.tool_name}`,
            `Was due: ${mockContext.end_date}`,
        ],
        ctaLabel: 'Resolve Now',
        ctaPath: '/my-rentals',
    },
    {
        label: 'EXTENSION_REQUEST',
        subject: `⏳ ${mockContext.renter_name} requested an extension for ${mockContext.tool_name}`,
        headline: '⏳ Extension Requested',
        accentColor: '#8B5CF6',
        bodyText: `${mockContext.renter_name} has requested to extend their rental of your ${mockContext.tool_name}. Please review the request on your dashboard.`,
        detailLines: [
            `Tool: ${mockContext.tool_name}`,
            `Renter: ${mockContext.renter_name}`,
            `New End Date: ${mockContext.new_end_date}`,
        ],
        ctaLabel: 'Review Extension',
        ctaPath: '/dashboard?role=owner',
    },
    {
        label: 'EXTENSION_APPROVED',
        subject: `✅ Extension approved for ${mockContext.tool_name}`,
        headline: '✅ Extension Approved',
        accentColor: '#10B981',
        bodyText: `Great news! ${mockContext.owner_name} has approved your extension request for the ${mockContext.tool_name}.`,
        detailLines: [
            `Tool: ${mockContext.tool_name}`,
            `New Return Date: ${mockContext.new_end_date}`,
        ],
        ctaLabel: 'View Rental',
        ctaPath: '/my-rentals',
    },
    {
        label: 'EXTENSION_REJECTED',
        subject: `Extension declined for ${mockContext.tool_name}`,
        headline: 'Extension Declined',
        accentColor: '#EF4444',
        bodyText: `${mockContext.owner_name} has declined your extension request for the ${mockContext.tool_name}. Please return the tool by the original due date.`,
        detailLines: [
            `Tool: ${mockContext.tool_name}`,
            `Original Return Date: ${mockContext.end_date}`,
        ],
        ctaLabel: 'View Rental',
        ctaPath: '/my-rentals',
    },
];

async function runTest() {
    console.log(`\n=========================================`);
    console.log(`🚀 BlockHyre Rental Alert Email Test 🚀`);
    console.log(`=========================================`);
    console.log(`\nTarget Email: ${TEST_EMAIL}`);
    console.log(`Total Events: ${testCases.length}`);
    console.log(`Key Found: ${process.env.RESEND_API_KEY ? 'YES ✓' : 'NO ❌'}`);

    if (!process.env.RESEND_API_KEY) {
        console.error('\n❌ ERROR: RESEND_API_KEY is not defined in .env.local');
        process.exit(1);
    }

    let passed = 0;
    let failed = 0;

    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        console.log(`\n📨 ${i + 1}/${testCases.length} Sending [${tc.label}] ...`);

        try {
            const result = await sendEmail({
                to: TEST_EMAIL,
                subject: `[TEST] ${tc.subject}`,
                react: RentalAlertEmail({
                    headline: tc.headline,
                    previewText: tc.subject,
                    bodyText: tc.bodyText,
                    toolName: mockContext.tool_name,
                    detailLines: tc.detailLines,
                    ctaLabel: tc.ctaLabel,
                    ctaUrl: `${baseUrl}${tc.ctaPath}`,
                    accentColor: tc.accentColor,
                }),
            });

            if (result.success) {
                console.log(`   ✅ Success`);
                passed++;
            } else {
                console.log(`   ❌ Failed: ${result.error}`);
                failed++;
            }
        } catch (err: any) {
            console.log(`   ❌ Error: ${err.message}`);
            failed++;
        }

        // Small delay to avoid Resend rate limits
        if (i < testCases.length - 1) {
            await new Promise((r) => setTimeout(r, 1000));
        }
    }

    console.log(`\n=========================================`);
    console.log(`✨ Test complete: ${passed} passed, ${failed} failed`);
    console.log(`📬 Check inbox: ${TEST_EMAIL}`);
    console.log(`=========================================\n`);
}

runTest();
