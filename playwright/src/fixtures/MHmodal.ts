// My Highlights modal locators and functions
import { Locator, Page } from 'playwright'
import { sleep } from '../utilities/utilities'

class MHModal {
  // MH modal objects
  MHModal: Locator
  MHModalCloseIcon: Locator
  page: Page

  constructor(page: Page) {
    this.page = page
    this.MHModal = page.locator('data-testid=highlights-popup-wrapper')
    this.MHModalCloseIcon = page.locator('data-testid=close-highlights-popup')
  }

  // Close My Highlights modal using x icon
  async closeMHModal() {
    await this.MHModalCloseIcon.click()
  }
}

class MHHighlights {
  // Highlights section in MH modal
  highlight: Locator
  MHContextMenu: Locator
  page: Page

  constructor(page: Page) {
    this.page = page
    this.highlight = page.locator('[class*="HighlightOuterWrapper"]')
    this.MHContextMenu = this.page.locator('[class*="MenuToggle"]')
  }


  async highlightCount() {
    // Total number of highlights in MH page
    return await this.highlight.count()
  }

  async highlightlist() {
    // List of highlights in MH
    const highlightList = []
    for (let i = 0; i < (await this.highlightCount()); i++) {
      highlightList.push(this.highlight.nth(i))
    }
    return highlightList
  }

  async clickContextMenu(n: number) {
    // Click context menu
    await this.MHContextMenu.nth(n).click()
  }
}

export { MHModal, MHHighlights }
