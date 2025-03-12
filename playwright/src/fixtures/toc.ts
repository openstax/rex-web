// Table of Contents locators and functions
import { Locator, Page } from 'playwright'
import { MobileNavigation, sleep } from '../utilities/utilities'

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
    this.tocDropdownLocator = this.page.locator('a[class*="NavDetails"]')
    this.sectionNameLocator = this.page.locator('h1[class*="BookBanner"]')
    this.pageSlugLocator = this.page.locator('[data-type="page"] a')
    this.currentPageLocator = this.page.locator("[aria-label*='Current Page'] a")
  }

  async pageCount() {
    // Total number of pages in the book
    return await this.pageLocator.count()
  }

  async chapterCount() {
    // Total number of chapters in the book
    const toc = this.page.locator('nav[data-testid=toc]')
    const chapterLocator = toc.locator('[data-type=chapter]')
    return await chapterLocator.count()
  }

  async unitIntroCount() {
    // Total number of unit introduction pages in the book
    const unitIntroPageLocator = this.page.locator('//li[@data-type="unit"]/a/ol[1]/li[1][@data-type="page"]')
    return await unitIntroPageLocator.count()
  }

  async eobDropdownCount() {
    // Total number of eob dropdowns in the book
    const toc = this.page.locator('nav[data-testid=toc]')
    const eobDropdownLocator = toc.locator('[data-type=eob-dropdown]')
    return await eobDropdownLocator.count()
  }

  async standalonePagesCount() {
    // Total number of pages in the book that are not contained in chapter or EOB or unit categories
    const standalonepageLocator = this.page.locator('nav[aria-label="Table of contents"] > ol > [data-type="page"]')
    return await standalonepageLocator.count()
  }

  async pageClick(pageNumber: number) {
    // Click on a toc link
    // param: page number to be clicked

    const titleBeforeClick = this.page.locator('head title').textContent()

    const mobileNav = new MobileNavigation(this.page)
    const browserAgent = await this.page.evaluate(() => navigator.userAgent)

    if (browserAgent.includes('Mobile') && browserAgent.includes('iPad')) {
      await mobileNav.openBigMobileMenu('toc')
    } else if (browserAgent.includes('Mobile')) {
      await mobileNav.openMobileMenu('toc')
    }

    await this.page.waitForSelector('[data-type="page"]')
    if (pageNumber < (await this.pageCount())) {
      // click the page if it is visible in toc
      if ((await this.pageLocator.nth(pageNumber).isVisible()) === true) {
        await this.pageLocator.nth(pageNumber).click()
      } else {
        // expand the dropdowns in toc
        await this.page.waitForSelector('a[class*="NavDetails"]')
        const tocDropdownCounts = await this.tocDropdownLocator.count()
        let tocDropdownCount: number
        for (tocDropdownCount = 0; tocDropdownCount < tocDropdownCounts; tocDropdownCount++) {
          await this.tocDropdownLocator.nth(tocDropdownCount).click()
        }
        // click the page, if it is visible in toc
        if ((await this.pageLocator.nth(pageNumber).isVisible()) === true) {
          await this.pageLocator.nth(pageNumber).click()
        } else {
          console.log('The page is not available')
        }
      }
      const titleAfterClick = this.page.locator('head title').textContent()
      if ((await titleAfterClick) != (await titleBeforeClick)) {
        return
      } else {
        sleep(2)
      }
    } else {
      console.log('The page number specified exceeds the total pages in the book')
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
    const toc = this.page.locator('nav[data-testid=toc]')
    const chapterLocator = toc.locator('[data-type=chapter]', {
      has: this.page.locator(`[href="${await this.CurrentPageSlug()}"]`),
    })
    const chapter = chapterLocator.locator('span[class*="SummaryTitle"]').first().textContent()
    return (await chapter).replace(/[\n\r]/g, '')
  }

  async UnitName() {
    // Return unit name of the current page
    const toc = this.page.locator('nav[data-testid=toc]')
    const unitLocator = toc
      .locator('css=[data-type=unit] >> a', {
        has: this.page.locator(`[href="${await this.CurrentPageSlug()}"]`),
      })
      .first()
    const unit = unitLocator.locator('.os-text').first().textContent()
    return await unit
  }

  async eocSectionHeading() {
    // Return end of chapter nesting level heading of the current page
    const toc = this.page.locator('nav[data-testid=toc]')
    const eocLocator = toc.locator('[data-type=eoc-dropdown]', {
      has: this.page.locator(`[href="${await this.CurrentPageSlug()}"]`),
    })
    const eocSectionHeading = eocLocator.locator('span[class*="SummaryTitle"]').first().textContent()
    return (await eocSectionHeading).replace(/[\n\r]/g, '')
  }

  async eobSectionHeading() {
    // Return end of book nesting level heading of the current page
    const toc = this.page.locator('nav[data-testid=toc]')
    const eobLocator = toc.locator('[data-type=eob-dropdown]', {
      has: this.page.locator(`[href="${await this.CurrentPageSlug()}"]`),
    })
    const eobSectionHeading = eobLocator.locator('span[class*="SummaryTitle"]').first().textContent()
    return (await eobSectionHeading).replace(/[\n\r]/g, '')
  }
}

export { TOC }
