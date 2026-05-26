import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Load environment variables from .env.test
 * Uses a lightweight parser to avoid requiring dotenv as a dependency.
 */
const envTestPath = path.resolve(__dirname, '.env.test');
if (fs.existsSync(envTestPath)) {
    const envContent = fs.readFileSync(envTestPath, 'utf-8');
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

const AUTH_STATE_PATH = path.join(__dirname, '.auth', 'user.json');

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    timeout: 90000,
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? 'github' : 'html',

    use: {
        baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
    },

    projects: [
        // ── Auth Setup (runs once, saves storageState) ──────────────────
        {
            name: 'setup',
            testMatch: /auth\.setup\.ts/,
        },

        // ── Desktop Browsers ────────────────────────────────────────────
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: AUTH_STATE_PATH,
            },
            dependencies: ['setup'],
        },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                storageState: AUTH_STATE_PATH,
            },
            dependencies: ['setup'],
        },
        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
                storageState: AUTH_STATE_PATH,
            },
            dependencies: ['setup'],
        },

        // ── Mobile Viewports ────────────────────────────────────────────
        {
            name: 'Mobile Chrome',
            use: {
                ...devices['Pixel 7'],
                storageState: AUTH_STATE_PATH,
            },
            dependencies: ['setup'],
        },
        {
            name: 'Mobile Safari',
            use: {
                ...devices['iPhone 14'],
                storageState: AUTH_STATE_PATH,
            },
            dependencies: ['setup'],
        },
    ],

    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        stdout: 'pipe',
        stderr: 'pipe',
    },
});
