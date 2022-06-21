import { ElementHandle, Page } from '@playwright/test'

async function closeExtras(page: Page, retries = 5): Promise<void> {
  try {
    await page.click('text=Got it!', { timeout: 500 })
  } catch (error) {}
  try {
    await page.click('lower-sticky-note-content > .put-away', { timeout: 500 })
  } catch (error) {}
  try {
    await page.click('._pi_closeButton', { timeout: 500 })
  } catch (error) {}
  try {
    await page.click('.ReactModalPortal .put-away', { timeout: 500 })
  } catch (error) {}
  const extras = await page.isVisible(
    '.cookie-notice button, lower-sticky-note-content > .put-away, ._pi_closeButton, .ReactModalPortal .put-away',
  )
  /* istanbul ignore if */
  if (retries > 0 && extras) {
    await sleep(1)
    return await closeExtras(page, retries - 1)
  }
}

function randomChoice(list: ElementHandle[]): ElementHandle {
  const option = Math.floor(Math.random() * list.length)
  return list[option]
}

async function sleep(seconds = 1.0): Promise<unknown> {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000)
  })
}

export { closeExtras, randomChoice, sleep }
