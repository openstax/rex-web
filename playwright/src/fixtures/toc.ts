// Content page locators and functions
import { Locator, Page } from 'playwright'

class TOC {
  page: Page
  sectionLocator: Locator
  tocDropdownLocator: Locator

  constructor(page: Page) {
    this.page = page
    this.sectionLocator = this.page.locator('[data-type="page"]')
    this.tocDropdownLocator = this.page.locator('details[class*="NavDetails"]')
  }

  async pageClick(sectionNumber: number) {
    // Click on a toc link
    // param: section number to be clicked

    const tocPageCount = await this.sectionLocator.count()
    if (sectionNumber < tocPageCount) {
      // click the page, if it is visible in toc
      if ((await this.sectionLocator.nth(sectionNumber).isVisible()) === true) {
        await this.sectionLocator.nth(sectionNumber).click()
      } else {
        // expand the dropdowns in toc
        const tocDropdownCounts = await this.tocDropdownLocator.count()
        let tocDropdownCount: number
        for (tocDropdownCount = 0; tocDropdownCount < tocDropdownCounts; tocDropdownCount++) {
          await this.tocDropdownLocator.nth(tocDropdownCount).click()

          // click the page, if it is visible in toc
          if ((await this.sectionLocator.nth(sectionNumber).isVisible()) === true) {
            await this.sectionLocator.nth(sectionNumber).click()
            break
          }
        }
      }
    } else {
      console.log('The section number specified exceeds the total pages in the book')
    }
  }
}

export { TOC }
