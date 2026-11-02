import { BrowserContext } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// Helper to load environment variables from a file if not already present in process.env
function loadEnvFile(filePath: string) {
    if (fs.existsSync(filePath)) {
        const envContent = fs.readFileSync(filePath, 'utf-8');
        for (const line of envContent.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex === -1) continue;
            const key = trimmed.slice(0, eqIndex).trim();
            const value = trimmed.slice(eqIndex + 1).trim();
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    }
}

/**
 * Creates a Supabase admin client for test setup/teardown using the service role key.
 */
export function createSupabaseAdmin() {
    loadEnvFile(path.resolve(__dirname, '..', '.env.test'));
    loadEnvFile(path.resolve(__dirname, '..', '.env.local'));

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    return createClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

/**
 * Programmatically authenticates a user against GoTrue/Supabase and injects
 * the session cookies directly into the Playwright BrowserContext.
 * This completely avoids shared refresh token collisions (refresh_token_already_used)
 * and bypasses rate limits from loading the frontend auth page.
 */
export async function loginAndInject(context: BrowserContext, email?: string, password?: string) {
    // Ensure environment variables are loaded
    loadEnvFile(path.resolve(__dirname, '..', '.env.test'));
    loadEnvFile(path.resolve(__dirname, '..', '.env.local'));

    const testEmail = email || process.env.TEST_USER_EMAIL;
    const testPassword = password || process.env.TEST_USER_PASSWORD;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

    if (!testEmail || !testPassword) {
        throw new Error('Missing email or password credentials for programmatic login.');
    }
    if (!supabaseUrl || !anonKey) {
        throw new Error('Missing Supabase URL or Anon Key environment variables.');
    }

    // Extract project reference from the Supabase URL host
    const url = new URL(supabaseUrl);
    const projectRef = url.hostname.split('.')[0];

    // Authenticate programmatically against GoTrue
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
            'apikey': anonKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Programmatic authentication failed for ${testEmail}: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const sessionData = await response.json();

    // Set expires_at and expires_in to be 24 hours in the future relative to the local clock.
    // This prevents the client-side Supabase SDK from deleting the cookies/localStorage
    // due to clock skew between the local machine and the hosted Supabase GoTrue server.
    const localNowSec = Math.floor(Date.now() / 1000);
    const expiresDuration = 24 * 60 * 60; // 24 hours

    // Strip down the session to keep cookie size within Chrome's 4096-byte limit.
    // Google OAuth logins add huge user metadata, causing "Invalid cookie fields" in CDP.
    const minimalSession = {
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
        expires_in: expiresDuration,
        expires_at: localNowSec + expiresDuration,
        token_type: sessionData.token_type,
        user: sessionData.user ? {
            id: sessionData.user.id,
            email: sessionData.user.email,
            role: sessionData.user.role,
            aud: sessionData.user.aud,
            user_metadata: {
                full_name: sessionData.user.user_metadata?.full_name,
                avatar_url: sessionData.user.user_metadata?.avatar_url || sessionData.user.user_metadata?.picture
            }
        } : undefined
    };

    // Prepare cookie structures
    const expiresTimestamp = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // far in the future
    const cookieValue = 'base64-' + Buffer.from(JSON.stringify(minimalSession)).toString('base64');

    const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

    const cookies = [
        {
            name: `sb-${projectRef}-auth-token`,
            value: cookieValue,
            url: baseUrl,
            expires: expiresTimestamp,
            httpOnly: false,
            secure: false,
            sameSite: 'Lax' as const,
        },
        {
            name: 'bh-auth-hint',
            value: '1',
            url: baseUrl,
            expires: expiresTimestamp,
            httpOnly: false,
            secure: false,
            sameSite: 'Lax' as const,
        }
    ];

    console.log(`[loginAndInject] Adding cookies for ${testEmail} to url ${baseUrl}:`, JSON.stringify(cookies, null, 2));

    // Add session cookies to the context
    await context.addCookies(cookies);

    // Also populate localStorage to bypass client-side rate limits on load.
    // We use an init script that safely runs on the target origin, ignoring about:blank.
    await context.addInitScript(({ key, value }) => {
        try {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                window.localStorage.setItem(key, value);
            }
        } catch (e) {
            // Ignore SecurityErrors on about:blank pages
        }
    }, {
        key: `sb-${projectRef}-auth-token`,
        value: JSON.stringify(minimalSession)
    });

    return sessionData;
}
