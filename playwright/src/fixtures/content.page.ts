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
    this.paragraph = this.page.locator('p[id*=para]')
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
  // param: randomparanumber - paragraph number of the content to be highlioghted
  async highlightText(color: string, randomparanumber: number) {
    await this.selectText(randomparanumber)
    this.colorlocator = await this.colorLocator(color)
    await this.colorlocator.click()
  }

  // Total number of highlights in a page
  async highlightCount() {
    const highlightcount = await this.highlight.count()
    return highlightcount
  }

  // Return highlight id of the specified paragraph from content page
  // param: randomparanumber - paragraph number of the highlighted content
  async highlight_id(randomparanumber: number) {
    const paraLocatorString = this.paragraph.toString()
    const paralocators = paraLocatorString.split('@')
    const paralocator = paralocators[1]
    const paranumber = Number(`${randomparanumber}`) + 1
    const highlight_id = await this.page.getAttribute(
      `${paralocator}:nth-child(${paranumber}) .highlight`,
      'data-highlight-id',
    )
    return highlight_id
  }

  // Return color of the highlighted content
  // param: highlight_id - highlight id of the highlighted content
  async contentHighlightColor(highlight_id: string) {
    const colorclass = await this.page.getAttribute(`[data-highlight-id="${highlight_id}"]`, 'class')
    const contentcolors = colorclass.split(' ')
    const colors = ['blue', 'green', 'pink', 'purple', 'yellow']
    for (const contentcolor of contentcolors) {
      for (const color of colors) {
        if (contentcolor === color) {
          return contentcolor
        }
      }
    }
  }

  // Number of paragraphs in the page
  async paracount() {
    const paracount = this.paragraph
    return await paracount.count()
  }

  // Select text in a paragraph
  // param: randomparanumber - nth paragraph to be selected
  async selectText(randomparanumber) {
    await this.paragraph.nth(randomparanumber).scrollIntoViewIfNeeded()
    const boundary = await this.paragraph.nth(randomparanumber).boundingBox()
    if (boundary) {
      await this.page.mouse.move(boundary.x, boundary.y)
      await this.page.mouse.down()
      await this.page.mouse.move(boundary.width + boundary.x - 1, boundary.y + boundary.height - 1)
      await this.page.mouse.up()
    }
  }
}

export { ContentPage }
