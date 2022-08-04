// Content page locators and functions
import { Page } from 'playwright'

class ContentPage {
  page: Page
  constructor(page: Page) {
    this.page = page
  }

  // Open a Rex page with base url
  async open(path: string) {
    await this.page.goto(path)
  }
}

export { ContentPage }
