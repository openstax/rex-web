// Content page locators and functions
import { Locator, Page } from 'playwright'

class ContentPage {
  blue: Locator
  green: Locator
  pink: Locator
  purple: Locator
  yellow: Locator
  page: Page
  paragraph: Locator
  highlight: Locator
  colorlocator: any
  constructor(page: Page) {
    this.page = page
    this.blue = this.page.locator('[aria-label="Apply blue highlight"]')
    this.green = this.page.locator('[aria-label="Apply green highlight"]')
    this.pink = this.page.locator('[aria-label="Apply pink highlight"]')
    this.purple = this.page.locator('[aria-label="Apply purple highlight"]')
    this.yellow = this.page.locator('[aria-label="Apply yellow highlight"]')
    this.highlight = this.page.locator('.highlight')
  }

  // Open a Rex page with base url
  async open(path: string) {
    await this.page.goto(path)

    // Add cookies to get rid of full page nudge
    const now = new Date()
    const current_date = now.toLocaleDateString()
    await this.page.context().addCookies([{ name: 'nudge_study_guides_counter', value: '1', url: this.page.url() }])
    await this.page
      .context()
      .addCookies([{ name: 'nudge_study_guides_page_counter', value: '1', url: this.page.url() }])
    await this.page
      .context()
      .addCookies([{ name: 'nudge_study_guides_date', value: current_date, url: this.page.url() }])
  }

  // Return locator of the color
  async colorLocator(color: string) {
    if (color === 'blue') {
      return this.blue
    } else if (color === 'green') {
      return this.green
    } else if (color === 'pink') {
      return this.pink
    } else if (color === 'purple') {
      return this.purple
    } else if (color === 'yellow') {
      return this.yellow
    } else if (color === '') {
      return this.yellow
    }
  }

  // Highlight selected text
  async highlightText(color: string) {
    await this.selectText()
    this.colorlocator = await this.colorLocator(color)
    await this.colorlocator.click()
  }

  // Total number of highlights in a page
  async highlightCount() {
    const highlightcount = await this.highlight.count()
    return highlightcount
  }

  // Select text
  async selectText() {
    this.paragraph = this.page.locator('id=eip-535')
    const boundary = await this.paragraph.boundingBox()
    if (boundary) {
      await this.page.mouse.move(boundary.x, boundary.y)
      await this.page.mouse.down()
      await this.page.mouse.move(boundary.width + boundary.x, boundary.y)
      await this.page.mouse.move(boundary.width + boundary.x, boundary.y + boundary.height)
      await this.page.mouse.move(boundary.x, boundary.y + boundary.height)
      await this.page.mouse.up()
    }
  }
}

export { ContentPage }
