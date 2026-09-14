// Table of Contents locators and functions
import { Locator, Page } from 'playwright'
import { MobileNavigation, sleep } from '../utilities/utilities'

// The ToC is a react-aria Tree. Three things about it drive the code below:
//   1. Every entry is a `[role=row]` element inside nav[data-testid=toc], and the
//      rows are flat siblings — there is no DOM nesting to query through.
//   2. Depth is carried on `data-level`, so an entry's chapter/unit is found by
//      walking backwards to the closest preceding row at a shallower level.
//   3. Rows are rendered lazily. A collapsed dropdown contributes no rows at all,
//      so anything counting or indexing the whole book has to expand first.
const ROW = '[role=row]'
const COLLAPSED_ROW = '[role=row][data-has-child-items][aria-expanded="false"]'
const CURRENT_PAGE_LINK = 'a.toc-content-link[aria-current="page"]'

class TOC {
  page: Page
  tocLocator: Locator
  rowLocator: Locator
  pageLocator: Locator
  tocDropdownLocator: Locator
  collapsedDropdownLocator: Locator
  sectionNameLocator: Locator
  pageSlugLocator: Locator
  currentPageLocator: Locator

  constructor(page: Page) {
    this.page = page
    this.tocLocator = this.page.locator('nav[data-testid=toc]')
    this.rowLocator = this.tocLocator.locator(ROW)
    this.pageLocator = this.tocLocator.locator(`${ROW}[data-type="page"]`)
    this.tocDropdownLocator = this.tocLocator.locator('div.toc-summary-wrapper')
    this.collapsedDropdownLocator = this.tocLocator.locator(COLLAPSED_ROW)
    this.sectionNameLocator = this.page.locator('h1.book-banner-chapter')
    this.pageSlugLocator = this.tocLocator.locator(`${ROW}[data-type="page"] a.toc-content-link`)
    this.currentPageLocator = this.tocLocator.locator(CURRENT_PAGE_LINK)
  }

  async expandAll(maxExpansions = 500) {
    // Expanding one dropdown can reveal more collapsed ones, so keep going until
    // there are none left rather than iterating a snapshot of the list.
    //
    // dispatchEvent rather than click(): these counts are also read while the My
    // Highlights modal covers the ToC, where a real click cannot land. react-aria's
    // usePress treats a detail=0 click as a virtual (screen reader) press, and that
    // is what toggles the row — Playwright's dispatchEvent sends exactly that.
    for (let expansions = 0; expansions < maxExpansions; expansions++) {
      if ((await this.collapsedDropdownLocator.count()) === 0) {
        return
      }
      await this.collapsedDropdownLocator.first().dispatchEvent('click', { detail: 0 })
    }
    // Bail loudly: every caller below counts or indexes rows, and a partially expanded
    // ToC would silently produce wrong numbers instead of a failure anyone can read.
    throw new Error(`The ToC still had collapsed dropdowns after ${maxExpansions} expansions`)
  }

  async pageCount() {
    // Total number of pages in the book
    await this.expandAll()
    return await this.pageLocator.count()
  }

  async chapterCount() {
    // Total number of chapters in the book
    await this.expandAll()
    return await this.tocLocator.locator(`${ROW}[data-type=chapter]`).count()
  }

  async unitIntroCount() {
    // Total number of unit introduction pages in the book. A unit's introduction is
    // its first child, which in a flat row list is the row right after the unit.
    await this.expandAll()
    return await this.rowLocator.evaluateAll(
      (rows) =>
        rows.filter(
          (row, index) =>
            row.getAttribute('data-type') === 'page' &&
            index > 0 &&
            rows[index - 1].getAttribute('data-type') === 'unit',
        ).length,
    )
  }

  async eobDropdownCount() {
    // Total number of eob dropdowns in the book
    await this.expandAll()
    return await this.tocLocator.locator(`${ROW}[data-type=eob-dropdown]`).count()
  }

  async standalonePagesCount() {
    // Total number of pages in the book that are not contained in chapter or EOB or unit categories
    await this.expandAll()
    return await this.tocLocator.locator(`${ROW}[data-type="page"][data-level="1"]`).count()
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

    await this.rowLocator.first().waitFor()

    // Every page has to be rendered before nth() indexing means anything.
    if (pageNumber >= (await this.pageCount())) {
      console.log('The page number specified exceeds the total pages in the book')
      return
    }

    await this.pageSlugLocator.nth(pageNumber).click()

    const titleAfterClick = this.page.locator('head title').textContent()
    if ((await titleAfterClick) != (await titleBeforeClick)) {
      return
    } else {
      await sleep(2)
    }
  }

  async SectionName() {
    // Return the section name displayed in the BookBanner
    const SectionName = await this.sectionNameLocator.textContent()
    return SectionName
  }

  async CurrentPageSlug() {
    // Return the page slug of the current open page
    return await this.currentPageLocator.getAttribute('href')
  }

  async pageNumber(page_slug: string) {
    // Return the page number for the specified page slug
    await this.expandAll()
    const hrefs = await this.pageSlugLocator.evaluateAll((links) => links.map((link) => link.getAttribute('href')))
    const index = hrefs.indexOf(page_slug)
    return index === -1 ? undefined : index
  }

  private async ancestorText(dataType: string, innerSelector: string) {
    // Return the text of the closest ancestor of the current page with the given
    // data-type. Rows are flat, so the ancestor chain is found by scanning backwards
    // and taking each row shallower than the shallowest one seen so far.
    await this.expandAll()
    return await this.rowLocator.evaluateAll(
      (rows, [type, selector]) => {
        const currentIndex = rows.findIndex((row) => row.querySelector('a.toc-content-link[aria-current="page"]'))
        if (currentIndex === -1) {
          return null
        }

        let level = Number(rows[currentIndex].getAttribute('data-level'))
        for (let index = currentIndex - 1; index >= 0; index--) {
          const candidate = rows[index]
          const candidateLevel = Number(candidate.getAttribute('data-level'))
          if (candidateLevel >= level) {
            continue
          }
          level = candidateLevel
          if (candidate.getAttribute('data-type') === type) {
            const text = candidate.querySelector(selector)
            return text === null ? null : text.textContent
          }
        }
        return null
      },
      [dataType, innerSelector],
    )
  }

  async ChapterName() {
    // Return chapter name of the current page
    const chapter = await this.ancestorText('chapter', '.toc-summary-title')
    return chapter === null ? null : chapter.replace(/[\n\r]/g, '')
  }

  async UnitName() {
    // Return unit name of the current page
    return await this.ancestorText('unit', '.os-text')
  }

  async eocSectionHeading() {
    // Return end of chapter nesting level heading of the current page
    const heading = await this.ancestorText('eoc-dropdown', '.toc-summary-title')
    return heading === null ? null : heading.replace(/[\n\r]/g, '')
  }

  async eobSectionHeading() {
    // Return end of book nesting level heading of the current page
    const heading = await this.ancestorText('eob-dropdown', '.toc-summary-title')
    return heading === null ? null : heading.replace(/[\n\r]/g, '')
  }
}

export { TOC }
