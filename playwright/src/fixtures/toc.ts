// Content page locators and functions
import { Locator, Page } from 'playwright'

class toc {
    page: Page
    sectionLocator: Locator
    tocDropdownLocator: Locator

  constructor(page: Page) {
    this.page = page
    this.sectionLocator = this.page.locator('[data-type="page"]')
    this.tocDropdownLocator = this.page.locator('details[class*="NavDetails"]')
  }

  async pageClick(n: number) {
    // Click on a toc link
    // param: nth page number to be clicked

    const tocPageCount = await this.sectionLocator.count()
    if (n < tocPageCount) {
        // click the page, if it is visible in toc
        if (await this.sectionLocator.nth(n).isVisible() === true) {
            await this.sectionLocator.nth(n).click()
        }
        else {
            // expand the dropdowns in toc
            const tocDropdownCounts = await this.tocDropdownLocator.count()
            let tocDropdownCount: number
            for (tocDropdownCount = 0; tocDropdownCount < tocDropdownCounts; tocDropdownCount++) {
                await this.tocDropdownLocator.nth(tocDropdownCount).click()

                // click the page, if it is visible in toc
                if (await this.sectionLocator.nth(n).isVisible() === true) {
                    await this.sectionLocator.nth(n).click()
                    break
                }
            }
        }
    }
    else { console.log("The page number specified exceeds the total pages in the book")
    }
  }
}

export { toc }