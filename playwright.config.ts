import { devices, PlaywrightTestConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

// config file reference - https://playwright.dev/docs/test-configuration
const config: PlaywrightTestConfig = {
  globalSetup: './global-setup',
  webServer: {
    command: 'yarn start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  testIgnore: '**/util/__tests__/**',
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'list' : 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    storageState: 'storage-state/storageState.json',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  outputDir: 'test-results/',
};

export default config;
