import { expect, Page } from '@playwright/test'
import test from '../../src/fixtures/base'
import { ContentPage, rexUserSignup } from './helpers'

const PAGE = '/books/business-ethics/pages/preface'

// Playwright's default mouse events have pressure 0, which react-aria treats as a virtual click.
// Dispatching through CDP with a force makes the press look like a real mouse.
async function realClick(page: Page, x: number, y: number) {
  const cdp = await page.context().newCDPSession(page)
  const base = { x, y, button: 'left' as const, clickCount: 1, force: 0.5 }
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...base })
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...base, force: 0 })
}

async function realClickOn(page: Page, selector: string) {
  const box = await page.locator(selector).first().boundingBox()
  if (!box) { throw new Error(`${selector} has no bounding box`) }
  await realClick(page, box.x + box.width / 2, box.y + box.height / 2)
}

test.describe('profile menu', () => {
  test.setTimeout(240000)

  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(isMobile as boolean, 'the profile menu popover is desktop only')
    await new ContentPage(page).open(PAGE)
    await rexUserSignup(page)
    await page.waitForSelector('#main-content p')
  })

  const trigger = (page: Page) => page.locator('[data-testid="user-nav-toggle"]')
  const menu = (page: Page) => page.locator('[role="menu"]')

  test('opens as a menu, not a dialog, and leaves the page available', async ({ page }) => {
    await trigger(page).focus()
    await page.keyboard.press('Enter')

    await expect(menu(page)).toBeVisible()
    await expect(page.locator('[role="dialog"]')).toHaveCount(0)
    await expect(page.locator('#main-content')).not.toHaveAttribute('aria-hidden', 'true')
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')
  })

  test('Escape closes the menu and returns focus to the trigger', async ({ page }) => {
    await trigger(page).focus()
    await page.keyboard.press('Enter')
    await expect(menu(page)).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(menu(page)).toHaveCount(0)
    await expect(trigger(page)).toBeFocused()
  })

  test('Tab out of the menu closes it', async ({ page }) => {
    await trigger(page).focus()
    await page.keyboard.press('Enter')
    await expect(menu(page)).toBeVisible()

    await page.keyboard.press('Tab')

    await expect(menu(page)).toHaveCount(0)
  })

  test('reopens on the next press after an outside press closed it', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'uses CDP mouse events')
    const triggerSelector = '[data-testid="user-nav-toggle"]'

    await realClickOn(page, triggerSelector)
    await expect(menu(page)).toBeVisible()

    await realClickOn(page, '#main-content p')
    await expect(menu(page)).toHaveCount(0)

    await realClickOn(page, triggerSelector)
    await expect(menu(page)).toBeVisible()

    await realClickOn(page, triggerSelector)
    await expect(menu(page)).toHaveCount(0)
  })
})
