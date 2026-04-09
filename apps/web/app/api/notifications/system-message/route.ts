import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import RentalAlertEmail from "../../../../emails/rental-alert";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Events that are ALREADY handled by dedicated Resend email flows.
 * These are sent from the Stripe webhook handler (booking-requested, booking-approved)
 * or from the disputes page (dispute-filed).
 * We skip them here to prevent double-emailing the user.
 */
const REDUNDANT_EVENTS = new Set([
    'RENTAL_REQUEST_SUBMITTED', // Handled by stripe/webhook → booking-requested.tsx
    'BOOKING_CONFIRMED',        // Handled by stripe/webhook → booking-approved.tsx
    'LISTING_INQUIRY',          // Low-priority "someone viewed your listing" — no email needed
]);

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://blockhyre.com';

/**
 * Maps each system event to email content configuration.
 * `recipientKey` determines who receives the email: 'renter', 'owner', or 'both'.
 */
interface EventEmailConfig {
    recipientKey: 'renter' | 'owner' | 'both';
    subject: (ctx: Record<string, string>) => string;
    headline: string;
    accentColor: string;
    bodyText: (ctx: Record<string, string>) => string;
    detailLines: (ctx: Record<string, string>) => string[];
    ctaLabel: string;
    ctaPath: string;
}

const EVENT_EMAIL_MAP: Record<string, EventEmailConfig> = {
    RENTAL_REQUEST_EXPIRING: {
        recipientKey: 'owner',
        subject: (ctx) => `⏰ Action needed: Request for ${ctx.tool_name} expires soon`,
        headline: '⏰ Request Expiring Soon',
        accentColor: '#F59E0B',
        bodyText: (ctx) => `The rental request from ${ctx.renter_name} for your ${ctx.tool_name} is about to expire. If you don't respond, it will be automatically denied.`,
        detailLines: (ctx) => [
            `Tool: ${ctx.tool_name}`,
            `Renter: ${ctx.renter_name}`,
            `Dates: ${ctx.start_date} – ${ctx.end_date}`,
        ],
        ctaLabel: 'Review Request',
        ctaPath: '/dashboard?role=owner',
    },
    RENTAL_REQUEST_REJECTED: {
        recipientKey: 'renter',
        subject: (ctx) => `Your request for ${ctx.tool_name} was declined`,
        headline: 'Request Declined',
        accentColor: '#EF4444',
        bodyText: (ctx) => `Unfortunately, ${ctx.owner_name} has declined your rental request for the ${ctx.tool_name}. Your payment has been automatically refunded.`,
        detailLines: (ctx) => [
            `Tool: ${ctx.tool_name}`,
            `Dates: ${ctx.start_date} – ${ctx.end_date}`,
        ],
        ctaLabel: 'Browse Other Tools',
        ctaPath: '/listings',
    },
    RENTAL_REQUEST_AUTO_DENIED: {
        recipientKey: 'both',
        subject: (ctx) => `Rental request for ${ctx.tool_name} expired`,
        headline: 'Request Auto-Expired',
        accentColor: '#6B7280',
        bodyText: (ctx) => `The rental request for ${ctx.tool_name} has expired because it was not responded to within 24 hours. The payment has been automatically refunded.`,
        detailLines: (ctx) => [
            `Tool: ${ctx.tool_name}`,
            `Dates: ${ctx.start_date} – ${ctx.end_date}`,
        ],
        ctaLabel: 'View Dashboard',
        ctaPath: '/dashboard',
    },
    RETURN_REMINDER_TOMORROW: {
        recipientKey: 'both',
        subject: (ctx) => `📦 Reminder: ${ctx.tool_name} is due back tomorrow`,
        headline: '📦 Return Reminder',
        accentColor: '#3B82F6',
        bodyText: (ctx) => `Just a friendly reminder — the ${ctx.tool_name} is due back tomorrow. Please coordinate the return with your neighbor via messaging.`,
        detailLines: (ctx) => [
            `Tool: ${ctx.tool_name}`,
            `Return Date: ${ctx.end_date}`,
        ],
        ctaLabel: 'Open Messages',
        ctaPath: '/messages',
    },
    RETURN_REMINDER_TODAY: {
        recipientKey: 'both',
        subject: (ctx) => `📦 Due today: ${ctx.tool_name}`,
        headline: '📦 Return Due Today',
        accentColor: '#F59E0B',
        bodyText: (ctx) => `The ${ctx.tool_name} is due back today. Please return it promptly to avoid overdue status. Don't forget to take return photos!`,
        detailLines: (ctx) => [
            `Tool: ${ctx.tool_name}`,
            `Due: Today`,
        ],
        ctaLabel: 'View Rental',
        ctaPath: '/my-rentals',
    },
    RENTAL_OVERDUE: {
        recipientKey: 'both',
        subject: (ctx) => `🚨 OVERDUE: ${ctx.tool_name} has not been returned`,
        headline: '🚨 Rental Overdue',
        accentColor: '#DC2626',
        bodyText: (ctx) => `The ${ctx.tool_name} is past its return date and is now marked overdue. Please coordinate the immediate return to avoid potential Peace Fund claims.`,
        detailLines: (ctx) => [
            `Tool: ${ctx.tool_name}`,
            `Was due: ${ctx.end_date}`,
        ],
        ctaLabel: 'Resolve Now',
        ctaPath: '/my-rentals',
    },
    EXTENSION_REQUEST: {
        recipientKey: 'owner',
        subject: (ctx) => `⏳ ${ctx.renter_name} requested an extension for ${ctx.tool_name}`,
        headline: '⏳ Extension Requested',
        accentColor: '#8B5CF6',
        bodyText: (ctx) => `${ctx.renter_name} has requested to extend their rental of your ${ctx.tool_name}. Please review the request on your dashboard.`,
        detailLines: (ctx) => [
            `Tool: ${ctx.tool_name}`,
            `Renter: ${ctx.renter_name}`,
            ...(ctx.new_end_date ? [`New End Date: ${ctx.new_end_date}`] : []),
        ],
        ctaLabel: 'Review Extension',
        ctaPath: '/dashboard?role=owner',
    },
    EXTENSION_APPROVED: {
        recipientKey: 'renter',
        subject: (ctx) => `✅ Extension approved for ${ctx.tool_name}`,
        headline: '✅ Extension Approved',
        accentColor: '#10B981',
        bodyText: (ctx) => `Great news! ${ctx.owner_name} has approved your extension request for the ${ctx.tool_name}.`,
        detailLines: (ctx) => [
            `Tool: ${ctx.tool_name}`,
            ...(ctx.new_end_date ? [`New Return Date: ${ctx.new_end_date}`] : []),
        ],
        ctaLabel: 'View Rental',
        ctaPath: '/my-rentals',
    },
    EXTENSION_REJECTED: {
        recipientKey: 'renter',
        subject: (ctx) => `Extension declined for ${ctx.tool_name}`,
        headline: 'Extension Declined',
        accentColor: '#EF4444',
        bodyText: (ctx) => `${ctx.owner_name} has declined your extension request for the ${ctx.tool_name}. Please return the tool by the original due date.`,
        detailLines: (ctx) => [
            `Tool: ${ctx.tool_name}`,
            `Original Return Date: ${ctx.end_date}`,
        ],
        ctaLabel: 'View Rental',
        ctaPath: '/my-rentals',
    },
};

/**
 * POST /api/notifications/system-message
 *
 * Called by the frontend `sendSystemMessage()` helper after inserting
 * system messages into the chat. Dispatches a Resend email for events
 * that do NOT already have a dedicated email template.
 *
 * Body: { eventName, ownerId, renterId, context }
 */
export async function POST(req: Request) {
    try {
        const { eventName, ownerId, renterId, context } = await req.json();

        if (!eventName || !ownerId || !renterId) {
            return NextResponse.json(
                { error: "Missing required fields: eventName, ownerId, renterId" },
                { status: 400 }
            );
        }

        // Skip events that are already handled by other Resend flows
        if (REDUNDANT_EVENTS.has(eventName)) {
            return NextResponse.json({
                skipped: true,
                reason: `Event "${eventName}" is handled by a dedicated email flow.`,
            });
        }

        const config = EVENT_EMAIL_MAP[eventName];
        if (!config) {
            return NextResponse.json({
                skipped: true,
                reason: `No email config defined for event "${eventName}".`,
            });
        }

        // Resolve recipient emails
        const recipientIds: string[] = [];
        if (config.recipientKey === 'owner' || config.recipientKey === 'both') {
            recipientIds.push(ownerId);
        }
        if (config.recipientKey === 'renter' || config.recipientKey === 'both') {
            recipientIds.push(renterId);
        }

        // Deduplicate (in case ownerId === renterId, which shouldn't happen but let's be safe)
        const uniqueIds = [...new Set(recipientIds)];

        const { data: users, error: usersError } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name')
            .in('id', uniqueIds);

        if (usersError || !users || users.length === 0) {
            console.error('[Notification] Failed to resolve user emails:', usersError);
            return NextResponse.json(
                { error: "Could not resolve recipient emails" },
                { status: 500 }
            );
        }

        const results: Array<{ userId: string; success: boolean; error?: string }> = [];

        for (const user of users) {
            if (!user.email) continue;

            const emailResult = await sendEmail({
                to: user.email,
                subject: config.subject(context || {}),
                react: RentalAlertEmail({
                    headline: config.headline,
                    previewText: config.subject(context || {}),
                    bodyText: config.bodyText(context || {}),
                    toolName: context?.tool_name || 'a tool',
                    detailLines: config.detailLines(context || {}),
                    ctaLabel: config.ctaLabel,
                    ctaUrl: `${baseUrl}${config.ctaPath}`,
                    accentColor: config.accentColor,
                }),
            });

            results.push({
                userId: user.id,
                success: emailResult.success,
                error: emailResult.error,
            });
        }

        return NextResponse.json({ sent: true, results });
    } catch (error: any) {
        console.error('[Notification] System message email error:', error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
