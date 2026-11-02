const { Resend } = require('resend');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const resendApiKey = process.env.RESEND_API_KEY;
console.log('API Key:', resendApiKey ? resendApiKey.substring(0, 10) + '...' : 'MISSING');

if (!resendApiKey) {
    console.error('RESEND_API_KEY is not defined in .env.local');
    process.exit(1);
}

const resend = new Resend(resendApiKey);

async function send() {
    console.log('Sending email...');
    try {
        const response = await resend.emails.send({
            from: 'BlockHyre <notifications@notif.blockhyre.com>',
            to: 'robinsonc24@gmail.com',
            subject: 'Test Resend Direct',
            html: '<p>If you see this, Resend direct email works!</p>'
        });
        console.log('Response:', response);
    } catch (error) {
        console.error('Error sending:', error);
    }
}

send();
