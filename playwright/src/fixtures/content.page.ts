// Content page locators and functions
import { Locator, Page } from 'playwright'

class ContentPage {
  page: Page
  paragraph: Locator
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

  // Select text
  async selecttext(){
    this.paragraph =  this.page.locator('id=eip-692')
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
