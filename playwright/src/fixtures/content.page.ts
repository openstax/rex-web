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

    // Add cookies to get rid of full page nudge
    let now = new Date()
    const current_date = now.toLocaleDateString()
    await this.page.context().addCookies([{name:"nudge_study_guides_counter", value:"1", url: this.page.url()}])
    await this.page.context().addCookies([{name:"nudge_study_guides_page_counter", value:"1", url: this.page.url()}])
    await this.page.context().addCookies([{name:"nudge_study_guides_date", value:current_date, url: this.page.url()}])
  }
}

export { ContentPage }
