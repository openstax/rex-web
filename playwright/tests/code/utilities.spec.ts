import { performance } from 'perf_hooks'
import { ElementHandle, expect } from '@playwright/test'
import test from '../../src/fixtures/base'
import { closeExtras, randomChoice, sleep } from '../../src/utilities/utilities'
import { accountsUserSignup } from '../rex-test/helpers'

test('sleep timer using the default parameter', async () => {
  const startingTime = performance.now()
  await sleep()
  const totalTime = performance.now() - startingTime
  expect(totalTime).toBeGreaterThanOrEqual(985)
  expect(totalTime).toBeLessThanOrEqual(1015)
})

test('sleep timer with a parameter', async () => {
  const startingTime = performance.now()
  await sleep(0.5)
  const totalTime = performance.now() - startingTime
  expect(totalTime).toBeGreaterThanOrEqual(485)
  expect(totalTime).toBeLessThanOrEqual(515)
})

test('close cookie, PI and React modals', async ({ accountsBaseURL, page, webBaseURL }) => {
  await accountsUserSignup(page, accountsBaseURL)
  await page.goto(webBaseURL)
  await closeExtras(page)
  const notice = await page.$('.cookie-notice, .put-away, ._pi_closeButton, .ReactModalPortal .put-away')
  try {
    expect(notice).toBeFalsy()
  } catch (error) {
    if (Array.isArray(notice)) {
      notice.forEach(async (node) =>
        expect(await page.evaluate((node: ElementHandle) => node.getAttribute('outerHTML'), node)).toBeNull(),
      )
    } else {
      expect(await page.evaluate((notice) => notice.getAttribute('outerHTML'), notice)).toBeNull()
    }
  }
})

test('random choice', async ({ webBaseURL, page }) => {
  expect(randomChoice([])).toBeFalsy()
  await page.goto(webBaseURL)
  const body = await page.$$('body')
  expect(randomChoice(body)['_type']).toBe('ElementHandle')
  const divs = await page.$$('div[class]')
  const div = randomChoice(divs)
  expect(divs.length).toBeGreaterThan(0)
  expect(divs.filter((element) => element === div)).toHaveLength(1)
})
