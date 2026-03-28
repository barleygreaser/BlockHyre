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

interface NewMessageEmailProps {
    senderName: string;
    messagePreview: string;
    dashboardUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://blockhyre.com';

export const NewMessageEmail = ({
    senderName = "A user",
    messagePreview = "...",
    dashboardUrl = `${baseUrl}/messages`,
}: NewMessageEmailProps) => (
    <Html>
        <Head />
        <Preview>New message from {senderName} on BlockHyre</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Text style={logoText}>BLOCKHYRE</Text>
                </Section>
                <Section style={content}>
                    <Heading style={h1}>New Message</Heading>
                    <Text style={text}>
                        <strong>{senderName}</strong> sent you a message regarding your rental:
                    </Text>

                    <Section style={detailsContainer}>
                        <Text style={detailRow}>
                            "{messagePreview}"
                        </Text>
                    </Section>

                    <Button href={dashboardUrl} style={button}>
                        Reply to Message
                    </Button>
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

export default NewMessageEmail;

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
    color: '#3B82F6', // Blue for messages
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
    marginBottom: '24px',
    fontStyle: 'italic',
};

const detailRow = {
    color: '#334155',
    fontSize: '15px',
    margin: '0',
};

const button = {
    backgroundColor: '#3B82F6',
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
