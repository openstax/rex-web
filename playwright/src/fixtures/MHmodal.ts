// My Highlights modal locators and functions
import { Locator, Page } from 'playwright'
import { sleep } from '../utilities/utilities'

class MHModal {
  MHModal: Locator
  MHModalCloseIcon: Locator
  page: Page

  constructor(page: Page) {
    this.page = page

    //locators for My Highlights modal
    this.MHModal = page.locator('data-testid=highlights-popup-wrapper')
    this.MHModalCloseIcon = page.locator('data-testid=close-highlights-popup')
    
  }

  // Close My Highlights modal using x icon
  async closeMHModal() {
    await this.MHModalCloseIcon.click()
  }
}

class MyHighlights{
  // Toolbar options
  highlight: Locator
  page: Page

  constructor(page: Page) {
    this.page = page

     //locators for My Highlights modal
    this.highlight = page.locator('[class*="HighlightOuterWrapper"]')
}

  async highlightCount() {
    // Total number of highlights in MH page
    const highlightcount = await this.highlight.count()
    return highlightcount
  }

}

class EditHighlights extends MyHighlights{
  // Context menu options
  MHContextMenu: Locator


  constructor(page: Page) {
    super(page)
    //locators for the highlights region
    this.MHContextMenu = this.page.locator('[class*="MenuToggle"]')

  }
  
  async clickContextMenu(n: number){
    // Click context menu test
    await this.MHContextMenu.nth(n).click()
  }

}

export { MHModal, MyHighlights, EditHighlights }


