# BlockHyre E2E Testing Guide (Playwright)

This directory contains the Playwright End-to-End (E2E) testing suite for the BlockHyre web application. The suite covers critical user journeys, emphasizing authentication, marketplace compliance (safety gates), and checkout flows.

## 🏗️ Architecture & Global Setup

We employ a **Global Setup Pattern** to optimize execution speed:
1. **`auth.setup.ts`**: A dedicated setup project runs *first*. It logs in via the UI using credentials from `.env.test`.
2. **Session Storage**: The resulting authentication state (cookies and localStorage) is saved to `.auth/user.json`.
3. **Inheritance**: All downstream test projects (Chromium, Firefox, WebKit, Mobile Viewports) inherit this authenticated state. By skipping repetitive UI logins, we dramatically reduce test flakiness and suite execution time.

## ⚙️ Configuration & Environment

The test suite is driven by `.env.test`. We use this dedicated environment file to prevent accidental interactions with production data and to avoid exposing credentials in source control.

**Required `apps/web/.env.test` Configuration:**
```env
# Authenticated Test User
TEST_USER_EMAIL=...
TEST_USER_PASSWORD=...
TEST_BASE_URL=http://localhost:3000

# Used for automated database cleanup in teardowns
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# (Optional) Deterministic navigation
TEST_INSTANT_LISTING_ID=...
```

## 🧪 Core Test Flows

- **`auth.spec.ts`**: Verifies login, signup, and middleware route protection. Contains an `afterAll` hook that hits the Supabase Admin API to hard-delete test users generated during the run, keeping the database clean.
- **`safety-gate.spec.ts`**: Confirms that high-power (Tier 3) equipment triggers mandatory safety waivers before Stripe checkout can be accessed.
- **`rental-flow.spec.ts`**: Covers the entire marketplace transaction lifecycle, from selecting dates and viewing price breakdowns to cart management and checkout handoff.

---

## 🚀 Two-Tier Seeding Strategy

Locating valid state data (like an "Instant Book" listing we don't own) purely through DOM scraping is inherently flaky. We manage test data via a two-tier approach:

1. **Primary Path (Deterministic Navigation):**
   If `TEST_INSTANT_LISTING_ID` is defined in `.env.test`, the test navigates *directly* to that URL. This requires zero DOM searching and provides bulletproof reliability for CI pipelines.
   
2. **Fallback Path (UI Discovery Loop):**
   If the environment variable is absent, the test attempts to discover a valid listing dynamically by iterating through the `/listings` page.

---

## 💻 Running Tests Locally

Once your `.env.test` is configured and dependencies are installed, you can execute the test suite using the following commands:

**Run all tests in headless mode:**
```bash
pnpm exec playwright test
```

**Run tests with the Playwright UI (Recommended for debugging):**
```bash
pnpm exec playwright test --ui
```

**Run a specific test file:**
```bash
pnpm exec playwright test rental-flow.spec.ts
```

**View the HTML report from the last run:**
```bash
pnpm exec playwright show-report
```

---

## 🔄 CI/CD & Test Parallelization

As the test suite grows, running UI tests sequentially in CI becomes a bottleneck. We manage parallelization natively via Playwright configurations and GitHub Actions.

### 1. Local Parallelization
In `playwright.config.ts`, `fullyParallel: true` is enabled. Playwright automatically utilizes available CPU cores to execute different test files simultaneously. 

### 2. CI/CD Matrix Sharding (The Next Step)
Within our GitHub Actions (or equivalent CI runner), we limit Playwright workers to 1 (`workers: process.env.CI ? 1 : undefined`) to ensure stability on constraint runner boxes, but we scale horizontally across multiple machines using **Playwright Sharding**.

By splitting the test suite across multiple CI jobs, we can run tests across 5 browser projects in a fraction of the time.

**Example GitHub Actions Matrix Implementation:**
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
      
      - name: Install dependencies
        run: pnpm install
        
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps
        
      - name: Run E2E Tests
        env: 
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          # ...other env vars
        run: pnpm exec playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
        
      - name: Upload Test Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.shardIndex }}
          path: playwright-report/
```

### Merging Sharded Reports
After all Matrix jobs complete, an additional CI step merges the disparate HTML reports into a single, unified artifact containing full traces for the entire suite.
