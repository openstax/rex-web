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
  para: Locator
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

  // Return the highlight id from content page
  async highlight_id() {
    const paragraph = await this.paragraphs()
    const paraLocatorString = this.paragraph.toString()
    const paralocator = paraLocatorString.split('@')
    const highlight_id = await this.page.getAttribute(`${paralocator[1]} .highlight`, 'data-highlight-id')
    return highlight_id
  }

  // Return color of the highlighted content
  async contentHighlightColor(highlight_id) {
    const colorclass = await this.page.getAttribute(`[data-highlight-id="${highlight_id}"]`, 'class')
    const contentcolor = colorclass.split(' ')
    const colors = ['blue', 'green', 'pink', 'purple', 'yellow']
    for (const i of contentcolor) {
      for (const j of colors) {
        if (i === j) {
          return i
        }
      }
    }
  }

  // Select paragraph
  async paragraphs() {
    this.paragraph = this.page.locator('p[id=eip-535]')
    return
  }

  // Select text in the paragraph
  async selectText() {
    const paragraph = await this.paragraphs()
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
