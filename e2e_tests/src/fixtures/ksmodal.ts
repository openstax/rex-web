// Keyboard Shortcuts modal locators and functions
import { Locator, Page } from 'playwright'

class KsModal {
  ksModal: Locator
  ksModalCloseIcon: Locator
  page: Page

  constructor(page: Page) {
    this.page = page

    //locators for Keyboard shortcuts modal
    this.ksModal = page.locator('data-testid=keyboard-shortcuts-popup-wrapper')
    this.ksModalCloseIcon = page.locator('data-testid=close-keyboard-shortcuts-popup')
  }

  // Close Keyboard Shortcuts modal using x icon
  async closeKsModal() {
    await this.ksModalCloseIcon.click()
  }
}

export { KsModal }
