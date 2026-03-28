import { sendEmail } from '../lib/email';
import BookingRequestedEmail from '../emails/booking-requested';
import BookingApprovedEmail from '../emails/booking-approved';
import NewMessageEmail from '../emails/new-message';
import DisputeFiledEmail from '../emails/dispute-filed';

const MOCK_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'christopher@blockhyre.com';

// Resend free tier only allows sending to the verified email address associated with the account.
// The user's account is associated with robinsonc24@gmail.com
const TEST_EMAIL = 'robinsonc24@gmail.com';

async function runTest() {
    console.log(`\n=========================================`);
    console.log(`🚀 BlockHyre Notification Engine Test 🚀`);
    console.log(`=========================================`);
    console.log(`\nTarget Email: ${TEST_EMAIL}`);
    console.log(`Key Found: ${process.env.RESEND_API_KEY ? 'YES ✓' : 'NO ❌'}`);

    if (!process.env.RESEND_API_KEY) {
        console.error('\n❌ ERROR: RESEND_API_KEY is not defined in .env.local');
        process.exit(1);
    }

    try {
        console.log(`\n📨 1/4 Sending [Booking Requested] template...`);
        const reqResult = await sendEmail({
            to: TEST_EMAIL,
            subject: "[TEST] New Rental Request for DeWalt Miter Saw",
            react: BookingRequestedEmail({
                renterName: "John Doe",
                toolName: "DeWalt Miter Saw - 12 inch",
                startDate: "Oct 25, 2026",
                endDate: "Oct 27, 2026",
                totalEarnings: "$76.50",
                dashboardUrl: "http://localhost:3000/dashboard?role=owner"
            })
        });
        console.log(`Result:`, reqResult.success ? '✅ Success' : `❌ Failed (${reqResult.error})`);

        console.log(`\n📨 2/4 Sending [Booking Approved] template...`);
        const appResult = await sendEmail({
            to: TEST_EMAIL,
            subject: "[TEST] Your rental for DeWalt Miter Saw was approved!",
            react: BookingApprovedEmail({
                ownerName: "Christopher",
                toolName: "DeWalt Miter Saw - 12 inch",
                startDate: "Oct 25, 2026",
                endDate: "Oct 27, 2026",
                dashboardUrl: "http://localhost:3000/my-rentals"
            })
        });
        console.log(`Result:`, appResult.success ? '✅ Success' : `❌ Failed (${appResult.error})`);

        console.log(`\n📨 3/4 Sending [New Message] template...`);
        const msgResult = await sendEmail({
            to: TEST_EMAIL,
            subject: "[TEST] New message from John Doe on BlockHyre",
            react: NewMessageEmail({
                senderName: "John Doe",
                messagePreview: "Hey, I'm waiting out front by the driveway!",
                dashboardUrl: "http://localhost:3000/messages"
            })
        });
        console.log(`Result:`, msgResult.success ? '✅ Success' : `❌ Failed (${msgResult.error})`);

        console.log(`\n📨 4/4 Sending [Dispute Filed (Admin)] template...`);
        const dispResult = await sendEmail({
            to: TEST_EMAIL,
            subject: "[TEST URGENT] Dispute filed on Rental #TEST-4091",
            react: DisputeFiledEmail({
                rentalId: "TEST-4091",
                filerName: "Christopher",
                filerRole: "Owner",
                reason: "User returned the saw with a completely shattered plastic guard and refused to respond to messages.",
                dashboardUrl: "https://supabase.com/dashboard/project/uttbptpkekijlfzvauzu"
            })
        });
        console.log(`Result:`, dispResult.success ? '✅ Success' : `❌ Failed (${dispResult.error})`);

        console.log(`\n✨ Test complete. Check your inbox: ${TEST_EMAIL}`);

    } catch (err) {
        console.error("\n❌ Unexpected Runtime Error:", err);
    }
}

runTest();
