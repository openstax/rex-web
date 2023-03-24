/* istanbul ignore file */
import { PlaywrightTestConfig } from '@playwright/test'
import { devices } from 'playwright'

const BASE_URL = process.env.URL

const config: PlaywrightTestConfig = {
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 1600, height: 1200 },
      },
    },
    {
      name: 'Desktop Firefox',
      use: {
        browserName: 'firefox',
        viewport: { width: 1600, height: 1200 },
      },
    },
    {
      name: 'Desktop Safari',
      use: {
        browserName: 'webkit',
        viewport: { width: 1600, height: 1200 },
      },
    },
    {
      name: 'Mobile (Pixel 5)',
      use: {
        browserName: 'chromium',
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile (iPhone 12)',
      use: {
        browserName: 'webkit',
        ...devices['iPhone 12'],
      },
    },
  ],
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  retries: 0,
  workers: 1,
  testMatch: /.*\.behaviorspec\.ts/,
  timeout: 60000,
  use: {
    baseURL: BASE_URL ? BASE_URL : 'https://staging.openstax.org',
    launchOptions: {
      slowMo: 150,
    },
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
}

export default config
