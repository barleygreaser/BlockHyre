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

interface PasswordResetEmailProps {
    userEmail: string;
    resetLink: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://blockhyre.com';

export const PasswordResetEmail = ({
    userEmail = "User",
    resetLink = `${baseUrl}/auth/reset-password`,
}: PasswordResetEmailProps) => (
    <Html>
        <Head />
        <Preview>Reset your BlockHyre password</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Text style={logoText}>BLOCKHYRE</Text>
                </Section>
                <Section style={content}>
                    <Heading style={h1}>Password Reset Request</Heading>
                    <Text style={text}>
                        Hi {userEmail},
                    </Text>
                    <Text style={text}>
                        Someone requested a password reset for your BlockHyre account. If this was you, click the button below to set a new password:
                    </Text>

                    <Button href={resetLink} style={button}>
                        Reset Password
                    </Button>

                    <Text style={text}>
                        If you didn't request this, you can safely ignore this email. The link will expire in 24 hours.
                    </Text>

                    <Section style={detailsContainer}>
                        <Text style={detailRow}>
                            <strong style={detailLabel}>Trouble clicking?</strong> Copy and paste this link into your browser:
                        </Text>
                        <Text style={linkText}>
                            {resetLink}
                        </Text>
                    </Section>
                </Section>
                <Section style={footer}>
                    <Text style={footerText}>
                        © 2026 BlockHyre. All rights reserved.<br />
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default PasswordResetEmail;

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
    color: '#F06449', // Use the safety orange brand color
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
    backgroundColor: '#F1F5F9',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px',
};

const detailRow = {
    color: '#334155',
    fontSize: '14px',
    margin: '0 0 8px 0',
};

const detailLabel = {
    color: '#64748B',
};

const linkText = {
    color: '#F06449',
    fontSize: '12px',
    wordBreak: 'break-all' as const,
};

const button = {
    backgroundColor: '#F06449',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '100%',
    padding: '14px 0',
    marginTop: '16px',
    marginBottom: '16px',
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
