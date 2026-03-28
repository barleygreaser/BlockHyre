import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Button,
} from '@react-email/components';
import * as React from 'react';

interface BookingRequestedEmailProps {
    renterName: string;
    toolName: string;
    startDate: string;
    endDate: string;
    totalEarnings: string;
    dashboardUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://blockhyre.com';

export const BookingRequestedEmail = ({
    renterName = "A neighbor",
    toolName = "your tool",
    startDate = "today",
    endDate = "tomorrow",
    totalEarnings = "$0.00",
    dashboardUrl = `${baseUrl}/dashboard/owner/bookings`,
}: BookingRequestedEmailProps) => (
    <Html>
        <Head />
        <Preview>You have a new rental request for {toolName}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Text style={logoText}>BLOCKHYRE</Text>
                </Section>
                <Section style={content}>
                    <Heading style={h1}>New Booking Request</Heading>
                    <Text style={text}>
                        Good news! <strong>{renterName}</strong> wants to borrow your <strong>{toolName}</strong>.
                    </Text>

                    <Section style={detailsContainer}>
                        <Text style={detailRow}>
                            <strong style={detailLabel}>Dates:</strong> {startDate} to {endDate}
                        </Text>
                        <Text style={detailRow}>
                            <strong style={detailLabel}>Your Earnings:</strong> {totalEarnings}
                        </Text>
                    </Section>

                    <Text style={strongText}>Next Steps:</Text>
                    <Text style={text}>
                        This booking is automatically approved and paid. Please coordinate a pickup time and location with the renter through the messaging system.
                    </Text>

                    <Button href={dashboardUrl} style={button}>
                        View Booking Details
                    </Button>
                </Section>
                <Section style={footer}>
                    <Text style={footerText}>
                        © 2026 BlockHyre. All rights reserved.<br />
                        <Link href={`${baseUrl}/terms`} style={footerLink}>Terms of Service</Link> | <Link href={`${baseUrl}/privacy`} style={footerLink}>Privacy Policy</Link>
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default BookingRequestedEmail;

const main = {
    backgroundColor: '#F8FAFC',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '560px',
};

const header = {
    padding: '24px',
    backgroundColor: '#0F172A',
    borderRadius: '12px 12px 0 0',
    textAlign: 'center' as const,
};

const logoText = {
    color: '#FF6B00',
    fontSize: '24px',
    fontFamily: '"Bebas Neue", impact, sans-serif',
    fontWeight: 'bold',
    letterSpacing: '2px',
    margin: '0',
};

const content = {
    padding: '32px 24px',
    backgroundColor: '#ffffff',
    border: '1px solid #E2E8F0',
    borderTop: 'none',
    borderRadius: '0 0 12px 12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

const h1 = {
    color: '#0F172A',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '1.25',
    marginBottom: '24px',
};

const text = {
    color: '#475569',
    fontSize: '16px',
    lineHeight: '24px',
    marginBottom: '16px',
};

const strongText = {
    color: '#0F172A',
    fontSize: '16px',
    fontWeight: 'bold',
    lineHeight: '24px',
    marginBottom: '8px',
    marginTop: '24px',
};

const detailsContainer = {
    backgroundColor: '#F1F5F9',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
};

const detailRow = {
    color: '#334155',
    fontSize: '15px',
    margin: '0 0 8px 0',
};

const detailLabel = {
    color: '#64748B',
    marginRight: '8px',
};

const button = {
    backgroundColor: '#FF6B00',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '100%',
    padding: '14px 0',
    marginTop: '32px',
};

const footer = {
    padding: '32px 0',
    textAlign: 'center' as const,
};

const footerText = {
    fontSize: '12px',
    color: '#94A3B8',
    lineHeight: '1.5',
};

const footerLink = {
    color: '#64748B',
    textDecoration: 'underline',
};
