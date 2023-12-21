import { ElementHandle, Page } from '@playwright/test'

async function closeExtras(page: Page, retries = 5): Promise<void> {
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

function randomNum(count: number, excludenum?: number) {
  // Generate random number within specified max
  // Exclude a number from the generated random number
  // param: count - maximum number within which random number is generated
  // param: excludenum - number to be excluded while generating the random number

  let n = Math.floor(Math.random() * (count - 1))
  if (n >= excludenum) n++
  return n
}

function randomstring(length = 15) {
  // Generate random string within specified max
  let string = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    string += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return string
}

function colorNumber(color: string) {
  // Assign number to each color in the highlighter
  switch (color) {
    case 'yellow':
      return 0

    case 'green':
      return 1

    case 'blue':
      return 2

    case 'purple':
      return 3

    case 'pink':
      return 4
  }
}

async function sleep(seconds = 1.0): Promise<unknown> {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000)
  })
}

class MobileNavigation {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  async openMobileMenu(menu: any) {
    switch (menu) {
      case 'toc':
        await this.page.click('[id*="mobile-menu-button"] [class*="styled__PlainButton"]')
        await this.page.click('[data-analytics-label="Click to open the Table of Contents"]')
        break

      case 'MH':
        await this.page.click('[id*="mobile-menu-button"] [class*="styled__PlainButton"]')
        await this.page.click('[data-analytics-label="My highlights"]')
        // Close the mobile help notification tooltip
        await this.page.locator('[data-testid="highlights-popup-wrapper"] button').nth(4).click()
        break
    }
  }

  async openBigMobileMenu(menu: any) {
    switch (menu) {
      case 'toc':
        await this.page.click('[data-analytics-label="Click to open the Table of Contents"]')
        break

      case 'MH':
        await this.page.click('[data-analytics-label="My highlights"]')
        // Close the mobile help notification tooltip
        await this.page.locator('[data-analytics-region="Mobile MH help info"] button').click()
        break
    }
  }
}

export { closeExtras, randomChoice, randomNum, randomstring, sleep, colorNumber, MobileNavigation }
