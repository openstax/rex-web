// My Highlights modal locators and functions
import { Locator, Page } from 'playwright'

class MHModal {
  MHModal: Locator
  MHModalCloseIcon: Locator
  MHedithighlight: Locator
  MHaddnote: Locator
  MHnotebox: Locator
  MHsavenote: Locator
  MHcancelnote: Locator
  page: Page

  constructor(page: Page) {
    this.page = page

    //locators for My Highlights modal
    this.MHModal = page.locator('data-testid=highlights-popup-wrapper')
    this.MHModalCloseIcon = page.locator('data-testid=close-highlights-popup')
    // this.MHedithighlight = page.locator()
    // this.MHaddnote = page.locator()
    // this.MHnotebox = page.locator()
    // this.MHsavenote = page.locator()
    // this.MHcancelnote = page.locator()
  }

  // Close My Highlights modal using x icon
  async closeMHModal() {
    await this.MHModalCloseIcon.click()
  }
}


class Highlights {
  MHedithighlight: Locator
  MHaddnote: Locator
  MHnotebox: Locator
  MHsavenote: Locator
  MHcancelnote: Locator
  page: Page

  constructor(page: Page) {
    this.page = page

    //locators for the highlights region
    // this.MHedithighlight = page.locator()
    // this.MHaddnote = page.locator()
    // this.MHnotebox = page.locator()
    // this.MHsavenote = page.locator()
    // this.MHcancelnote = page.locator()
  }


}

export { MHModal, Highlights }