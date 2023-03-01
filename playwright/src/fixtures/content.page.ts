// Content page locators and functions
import { Locator, Page } from 'playwright'
import { sleep } from '../utilities/utilities'
import { test } from '@playwright/test'

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
  body: Locator
  myhighlights: Locator
  next: Locator
  // browsername: string
  constructor(page: Page) {
    this.page = page
    this.blue = this.page.locator('[aria-label="Apply blue highlight"]')
    this.green = this.page.locator('[aria-label="Apply green highlight"]')
    this.pink = this.page.locator('[aria-label="Apply pink highlight"]')
    this.purple = this.page.locator('[aria-label="Apply purple highlight"]')
    this.yellow = this.page.locator('[aria-label="Apply yellow highlight"]')
    this.highlight = this.page.locator('.highlight')
    this.myhighlights = this.page.locator('[aria-label="Highlights"]')
    this.next = this.page.locator('[aria-label="Next Page"]')
    this.paragraph = this.page.locator('p[id*=para]')
    this.body = this.page.locator('[class*="page-content"]')
  }

  async open(path: string) {
    // Open a Rex page with base url
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

  async colorLocator(color: string) {
    // Return locator of the color
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

  async highlightText(color: string, randomparanumber: number)  {
    // Highlight selected text
    // param: highlight color
    // param: randomparanumber - paragraph number of the content to be highlighted

    await Promise.all([this.selectText(randomparanumber)])

    // select highlight color from the visible notecard in the page
    this.colorlocator = await this.colorLocator(color)
    const colorLocatorCount = await this.colorlocator.count()
    if (colorLocatorCount > 1) {
      for (let i = 0; i < colorLocatorCount; i++) {
        const colorLocatorVisibility = await this.colorlocator.nth(i).evaluate((e: Element) => {
          return window.getComputedStyle(e).getPropertyValue('visibility')
        })
        if (colorLocatorVisibility === 'visible') {
          await this.colorlocator.nth(i).click()
        }
      }
    } else {
      await this.colorlocator.click()
    }

    // click outside the highlighted paragraph to close the notecard
    // Otherwise, the notecard can block other elements like next/previous links
    await this.scrolltotop()
  }

  async highlightCount() {
    // Total number of highlights in a page
    const highlightcount = await this.highlight.count()
    return highlightcount
  }

  async highlight_id(randomparanumber: number) {
    // Return highlight id of the specified paragraph from content page
    // param: randomparanumber - paragraph number of the highlighted content
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

  async contentHighlightColor(highlight_id: string) {
    // Return color of the highlighted content
    // param: highlight_id - highlight id of the highlighted content
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

  async clickNext() {
    // Click Next link
    await this.next.click()
  }

  // Open My Highlights modal
  async openMHmodal() {
    await this.myhighlights.click()
  }

  async paracount() {
    // Number of paragraphs in the page
    const paracount = this.paragraph
    return await paracount.count()
  }

  async scrolltotop() {
    // Scroll to top of content area and click

    const x1 = this.page.context().browser().browserType
    console.log(x1)
    
    // console.log(test.info.name)
    
    await this.page.reload()
  
    await this.page.waitForSelector('[data-highlighted="true"]')

    
    // const body = await this.body.boundingBox()
    // await this.page.mouse.wheel(body.x, body.y)
    // await this.page.mouse.click(body.x - 100, body.y + 100)
  
  }

  async selectText(randomparanumber: number) {
    // Select text in a paragraph
    // param: randomparanumber - paragraph number to be selected
    await this.paragraph.nth(randomparanumber).scrollIntoViewIfNeeded()
    const boundary = await this.paragraph.nth(randomparanumber).boundingBox()
    if (boundary) {
      await this.page.mouse.move(boundary.x, boundary.y)
      await this.page.mouse.down()
      await this.page.mouse.move(boundary.width - 20 + boundary.x, boundary.y + boundary.height - 10)
      await this.page.mouse.up()
    }
  }
}

export { ContentPage }

