// Content page locators and functions
import { Locator, Page } from 'playwright'

class ContentPage {
  blue: Locator
  page: Page
  paragraph: Locator
  highlight: Locator
  constructor(page: Page) {
    this.page = page
    this.blue = page.locator('[aria-label="Apply blue highlight"]')
    this.highlight = this.page.locator(".highlight")

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

  // Highlight selected text
  async highlightText(){
    await this.selectText()
    await this.blue.click()
  }

  // Total number of highlights in a page
  async highlightCount(){
    let highlightcount = await this.highlight.count()
    return highlightcount
  }


  // Select text
  async selectText(){
    this.paragraph =  this.page.locator('id=eip-535')
    const boundary = await this.paragraph.boundingBox() 
    await this.page.mouse.move(boundary.x, boundary.y);
    await this.page.mouse.down()
    await this.page.mouse.move(boundary.width + boundary.x, boundary.y)
    await this.page.mouse.move(boundary.width + boundary.x, boundary.y + boundary.height)
    await this.page.mouse.move(boundary.x, boundary.y + boundary.height)
    await this.page.mouse.up()
  }
}

export { ContentPage }

