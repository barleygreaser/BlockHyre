import { test as setup } from '@playwright/test';
import { loginAndInject } from './utils';
import path from 'node:path';
import fs from 'node:fs';

const AUTH_STATE_PATH = path.join(__dirname, '..', '.auth', 'user.json');

/**
 * Global Setup: Programmatically authenticates via GoTrue/Supabase API to bypass
 * the slow UI login and prevent Next.js parallel middleware page/resource loads
 * from hitting hosted rate limits (HTTP 429).
 */
setup('Authenticate test user programmatically', async ({ context }) => {
    // Perform programmatic login and inject cookies
    await loginAndInject(context);

    // Ensure the destination directory exists
    const dir = path.dirname(AUTH_STATE_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Persist storage state (cookies & localStorage)
    await context.storageState({ path: AUTH_STATE_PATH });
});
