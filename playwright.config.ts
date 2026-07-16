import { defineConfig } from '@playwright/test';
import process from 'node:process';

const chromiumPath = process.env.CHROMIUM_BIN;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    launchOptions: chromiumPath ? { executablePath: chromiumPath } : undefined,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'deno task preview',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
