import { defineConfig, devices } from '@playwright/test';

/**
 * Simplified playwright config for basic testing
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run local server for testing */
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: 'serve -s build -l 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000, // 2 minutes
  },
});