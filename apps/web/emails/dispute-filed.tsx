import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Button,
} from '@react-email/components';
import * as React from 'react';

interface DisputeFiledEmailProps {
    rentalId: string;
    filerName: string;
    filerRole: string; // 'Owner' or 'Renter'
    reason: string;
    dashboardUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://blockhyre.com';

export const DisputeFiledEmail = ({
    rentalId = "1234",
    filerName = "A user",
    filerRole = "Owner",
    reason = "Tool was returned damaged",
    dashboardUrl = `https://supabase.com/dashboard`,
}: DisputeFiledEmailProps) => (
    <Html>
        <Head />
        <Preview>URGENT: Dispute filed on Rental #{rentalId}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Text style={logoText}>BLOCKHYRE TRIBUNAL</Text>
                </Section>
                <Section style={content}>
                    <Heading style={h1}>Action Required: Dispute</Heading>
                    <Text style={text}>
                        A dispute has been formally filed by the <strong>{filerRole}</strong> ({filerName}) for Rental #{rentalId}.
                    </Text>

                    <Section style={detailsContainer}>
                        <Text style={detailRow}>
                            <strong style={detailLabel}>Reason given:</strong>
                        </Text>
                        <Text style={reasonText}>
                            "{reason}"
                        </Text>
                    </Section>

                    <Text style={text}>
                        Please hold the Stripe Deposit and review the Chat History and Evidence Photos in Supabase immediately.
                    </Text>

                    <Button href={dashboardUrl} style={button}>
                        Open Supabase Console
                    </Button>
                </Section>
                <Section style={footer}>
                    <Text style={footerText}>
                        Internal Admin Alert
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default DisputeFiledEmail;

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
    color: '#EF4444', // Red for urgent admin alert
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

const detailsContainer = {
    backgroundColor: '#FEF2F2', // Light red background
    border: '1px solid #FCA5A5',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
};

const detailRow = {
    color: '#991B1B',
    fontSize: '15px',
    margin: '0 0 8px 0',
};

const detailLabel = {
    marginRight: '8px',
};

const reasonText = {
    color: '#7F1D1D',
    fontSize: '15px',
    margin: '0',
    fontStyle: 'italic',
};

const button = {
    backgroundColor: '#EF4444',
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
