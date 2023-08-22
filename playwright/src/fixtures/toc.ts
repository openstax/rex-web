// Content page locators and functions
import { Locator, Page } from 'playwright'

class TOC {
  page: Page
  pageLocator: Locator
  tocDropdownLocator: Locator
  sectionNameLocator: Locator
  pageSlugLocator: Locator
  currentPageLocator: Locator

  constructor(page: Page) {
    this.page = page
    this.pageLocator = this.page.locator('[data-type="page"]')
    this.tocDropdownLocator = this.page.locator('details[class*="NavDetails"]')
    this.sectionNameLocator = this.page.locator('h1[class*="BookBanner"]')
    this.pageSlugLocator = this.page.locator('[data-type="page"] a')
    this.currentPageLocator = this.page.locator("[aria-label*='Current Page'] a")
  }

  async pageCount() {
    // Total number of pages in the book
    return await this.pageLocator.count()
  }

  async pageClick(pageNumber: number) {
    // Click on a toc link
    // param: page number to be clicked

    if (pageNumber < (await this.pageCount())) {
      // click the page if it is visible in toc
      if ((await this.pageLocator.nth(pageNumber).isVisible()) === true) {
        await this.pageLocator.nth(pageNumber).click()
      } else {
        // expand the dropdowns in toc
        const tocDropdownCounts = await this.tocDropdownLocator.count()
        let tocDropdownCount: number
        for (tocDropdownCount = 0; tocDropdownCount < tocDropdownCounts; tocDropdownCount++) {
          await this.tocDropdownLocator.nth(tocDropdownCount).click()

          // click the page, if it is visible in toc
          if ((await this.pageLocator.nth(pageNumber).isVisible()) === true) {
            await this.pageLocator.nth(pageNumber).click()
            break
          }
        }
      }
    } else {
      console.log('The section number specified exceeds the total pages in the book')
    }
  }

  async SectionName() {
    // Return the section name displayed in the BookBanner
    const SectionName = await this.sectionNameLocator.textContent()
    return SectionName
  }

  async CurrentPageSlug() {
    // Return the page slug of the current open page
    const pageSlugString = this.currentPageLocator.toString().split('@')
    const currentPageSlug = await this.page.getAttribute(pageSlugString[1], 'href')
    return currentPageSlug
  }

  async pageNumber(page_slug: string) {
    // Return the page number for the specified page slug
    // Expand all the dropdown locators
    const tocDropdownCounts = await this.tocDropdownLocator.count()
    let tocDropdownCount: number
    for (tocDropdownCount = 0; tocDropdownCount < tocDropdownCounts; tocDropdownCount++) {
      await this.tocDropdownLocator.nth(tocDropdownCount).click()
    }
    // Return the page number if the page slug matches the slug parameter passed in the function
    let pageCount: number
    await this.pageLocator.nth(0).click()
    for (pageCount = 0; pageCount < (await this.pageCount()); pageCount++) {
      const pageSlugs = this.pageSlugLocator.nth(pageCount).toString().split('@')
      const pageSlug = await this.page.getAttribute(pageSlugs[1], 'href')
      if (pageSlug === page_slug) {
        return pageCount
      }
    }
  }

  async ChapterName() {
    // Return chapter name of the current page
    const toc = this.page.locator('div[data-testid=toc]')
    const chapterLocator = toc.locator('[data-type=chapter]', {
      has: this.page.locator(`[href="${await this.CurrentPageSlug()}"]`),
    })
    const chapter = chapterLocator.locator('span[class*="SummaryTitle"]').first().textContent()
    return (await chapter).replace(/[\n\r]/g, '')
  }

  async UnitName() {
    // Return unit name of the current page
    const toc = this.page.locator('div[data-testid=toc]')
    const unitLocator = toc
      .locator('css=[data-type=unit] >> details', {
        has: this.page.locator(`[href="${await this.CurrentPageSlug()}"]`),
      })
      .first()
    const unit = unitLocator.locator('.os-text').first().textContent()
    return await unit
  }

  async eocSectionHeading() {
    // Return chapter name of the current page
    const toc = this.page.locator('div[data-testid=toc]')
    const eocLocator = toc.locator('[data-type=eoc-dropdown]', {
      has: this.page.locator(`[href="${await this.CurrentPageSlug()}"]`),
    })
    const eocSectionHeading = eocLocator.locator('span[class*="SummaryTitle"]').first().textContent()
    return (await eocSectionHeading).replace(/[\n\r]/g, '')
  }

  async eobSectionHeading() {
    // Return chapter name of the current page
    const toc = this.page.locator('div[data-testid=toc]')
    const eobLocator = toc.locator('[data-type=eob-dropdown]', {
      has: this.page.locator(`[href="${await this.CurrentPageSlug()}"]`),
    })
    const eobSectionHeading = eobLocator.locator('span[class*="SummaryTitle"]').first().textContent()
    return (await eobSectionHeading).replace(/[\n\r]/g, '')
  }
}

export { TOC }
