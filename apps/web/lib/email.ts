import { Resend } from 'resend';

// Only initialize if the key is provided, otherwise fail gracefully in dev if missing
const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// USE REAL DOMAIN FOR ALL ENVIRONMENTS SINCE DNS IS VERIFIED
export const SENDER_EMAIL = process.env.SENDER_EMAIL || 'BlockHyre <notifications@notif.blockhyre.com>';

// Add ADMIN_EMAIL for dispute/critical notifications
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@blockhyre.com';

export async function sendEmail({
    to,
    subject,
    react
}: {
    to: string | string[];
    subject: string;
    react: React.ReactElement;
}) {
    if (!resend) {
        console.warn(`[Email Skipped] RESEND_API_KEY not set. Would have sent: "${subject}" to ${to}`);
        return { success: false, error: 'RESEND_API_KEY not configured' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: SENDER_EMAIL,
            to,
            subject,
            react,
        });

        if (error) {
            console.error('Resend API Error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err: any) {
        console.error('Failed to send email:', err);
        return { success: false, error: err.message };
    }
}
