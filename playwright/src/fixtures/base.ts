/* istanbul ignore file */
import { test as base } from '@playwright/test'

type BaseURL = {
  accountsBaseURL: string
  webBaseURL: string
}

const INSTANCE = process.env.INSTANCE
const ACCOUNTS = process.env.ACCOUNTS_BASE_URL
const WEB = process.env.WEB_BASE_URL
const production = ['prod', 'Prod', 'PROD', 'production', 'Production', 'PRODUCTION']

const test = base.extend<BaseURL>({
  accountsBaseURL: async ({}, use) => {
    if (INSTANCE) {
      if (production.includes(INSTANCE)) {
        await use(`https://openstax.org/accounts`)
      } else {
        await use(`https://${INSTANCE}.openstax.org/accounts`)
      }
    } else if (ACCOUNTS) {
      await use(ACCOUNTS.endsWith('/') ? ACCOUNTS.slice(0, ACCOUNTS.length - 1) : ACCOUNTS)
    } else {
      await use('https://staging.openstax.org/accounts')
    }
  },

  webBaseURL: async ({}, use) => {
    if (INSTANCE) {
      if (production.includes(INSTANCE)) {
        await use(`https://openstax.org`)
      } else {
        await use(`https://${INSTANCE}.openstax.org`)
      }
    } else if (WEB) {
      await use(WEB.endsWith('/') ? WEB.slice(0, WEB.length - 1) : WEB)
    } else {
      await use('https://staging.openstax.org')
    }
  },
});

test.beforeEach(async ({ context }) => {
  // Block GTM and pulseinsights
  await context.route(/^https?:\/\/(?:www\.)?googletagmanager\.com/, route => route.abort());
  await context.route(/^https?:\/\/js\.pulseinsights\.com/, route => route.abort());
  await context.route(/^https?:\/\/cdn-cookieyes\.com/, route => route.abort());
});

export default test
