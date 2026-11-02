const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        persistSession: false
    }
});

async function updatePassword() {
    const ownerId = '057291df-d626-43c8-85a2-de78acbf6d5a'; // robinsonc24@gmail.com
    const newPassword = 'California1';

    console.log(`Updating password for owner (ID: ${ownerId}) via Admin API...`);

    const { data, error } = await supabase.auth.admin.updateUserById(ownerId, {
        password: newPassword
    });

    if (error) {
        console.error('Failed to update password:', error.message);
    } else {
        console.log('Password updated successfully for:', data.user.email);
    }
}

updatePassword();
