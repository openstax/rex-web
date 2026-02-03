// Content page locators and functions
import { Locator, Page } from 'playwright'
import { MobileNavigation } from '../utilities/utilities'

class ContentPage {
  colorlocator: any
  blue: Locator
  green: Locator
  pink: Locator
  purple: Locator
  yellow: Locator
  page: Page
  paragraph: Locator
  para: Locator
  highlight: Locator
  body: Locator
  myHighlights: Locator
  next: Locator
  previous: Locator
  MHbodyLoaded: Locator
  contentHighlightsLoaded: Locator
  noteTextBox: Locator
  saveNote: Locator
  cancelNote: Locator
  contextMenu: Locator
  editHighlightLocator: Locator
  noteTextLocator: Locator
  noteEditCard: Locator
  textarea: Locator
  highlightIdlocator: Locator
  highlightIndicator: Locator

  constructor(page: Page) {
    this.page = page
    this.blue = this.page.locator('[aria-label="Apply blue highlight"]')
    this.green = this.page.locator('[aria-label="Apply green highlight"]')
    this.pink = this.page.locator('[aria-label="Apply pink highlight"]')
    this.purple = this.page.locator('[aria-label="Apply purple highlight"]')
    this.yellow = this.page.locator('[aria-label="Apply yellow highlight"]')
    this.highlight = this.page.locator('.highlight')
    this.myHighlights = this.page.locator('[aria-label="Highlights"]')
    this.next = this.page.locator('[aria-label="Next Page"]')
    this.previous = this.page.locator('[aria-label="Previous Page"]')
    this.paragraph = this.page.locator('p[id*=para]')
    this.body = this.page.locator('[class*="page-content"]')
    this.MHbodyLoaded = this.page.locator('[data-testid="show-myhighlights-body"]')
    this.contentHighlightsLoaded = this.page.locator('[class*="HighlightsWrapper"]')
    this.noteTextBox = this.page.locator('[data-analytics-region="edit-note"]')
    this.saveNote = this.page.locator('[data-testid="save"]')
    this.cancelNote = this.page.locator('[data-testid="cancel"]')
    this.contextMenu = this.page.locator('[class*=MenuToggle]')
    this.editHighlightLocator = this.page.locator('[data-testid="card"] >> text=Edit')
    this.noteTextLocator = this.page.locator('[class*=TruncatedText]')
    this.noteEditCard = this.page.locator('form[data-analytics-region="edit-note"]')
    this.textarea = this.page.locator('textarea[class*="TextArea"]')
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

  async canonical() {
    // Return canonical link of the current page
    let canonicalPageSelector = await this.page.$('[rel="canonical"]')
    const canonicalPage = await canonicalPageSelector.evaluate((e) => e.getAttribute('href'))
    return canonicalPage
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
    } else {
      throw new Error('Color specified in the test does not match the Highlighter colors')
    }
  }

  async highlightText(color: string, randomparanumber: number, note?: string) {
    // Highlight selected text
    // param: highlight color
    // param: randomparanumber - paragraph number of the content to be highlighted
    // param: note - optional note to be added to the highlight

    await this.selectText(randomparanumber)

    // select highlight color & add note from the visible notecard in the page (if multiple highlights are present in the page)
    this.colorlocator = await this.colorLocator(color)
    const colorLocatorCount = await this.colorlocator.count()
    if (colorLocatorCount > 1) {
      for (let i = 0; i < colorLocatorCount; i++) {
        const colorLocatorVisibility = await this.colorlocator.nth(i).evaluate((e: Element) => {
          return window.getComputedStyle(e).getPropertyValue('visibility')
        })
        if (colorLocatorVisibility === 'visible') {
          await this.colorlocator.nth(i).check()
          if (typeof note !== 'undefined') {
            await this.noteTextBox.nth(i).click()
            await this.noteTextBox.nth(i).type(note)
            await this.saveNote.click()
          }
        }
      }
    }
    // select the highlight color & add note from the available notecard in the page (first highlight on the page)
    else {
      await this.colorlocator.check()
      if (typeof note !== 'undefined') {
        await this.noteTextBox.click()
        await this.noteTextBox.type(note)
        await this.saveNote.click()
      }
    }

    // The notecard stays open after making a highlight,
    // which prevents click actions on other elements like next/previous
    // links underneath the highlighter. So close the notecard.
    await this.CloseNoteCard()
  }

  async clickHighlight(highlight_id: string) {
    // Click on a highlight
    // param: highlight_id of the highlight to be clicked
    await this.page.waitForSelector('.highlight')
    const highlightIdlocator = await this.page.$$(`[data-highlight-id="${highlight_id}"][data-highlighted="true"]`)

    // When a highlight is broken into multiple pieces due to content styling, select the first highlight block
    await highlightIdlocator[0].click()
  }

  async clickContextMenu(highlight_id: string) {
    // Click context menu of a highlight
    // param: highlight_id
    this.clickHighlight(highlight_id)
    this.contextMenu.dispatchEvent('click')
  }

  async editHighlight() {
    // Click the Edit option from a highlight's context menu
    this.editHighlightLocator.click()
  }

  async highlightCount() {
    // Total number of highlights in a page

    await this.page.waitForSelector('.highlight')
    const highlightIds = []
    const highlightLocatorCount = await this.highlight.count()

    // When a highlight is broken into multiple pieces due to content styling, count only the unique highlight ids
    for (let i = 0; i < highlightLocatorCount; i++) {
      const highlightIdlocatorString = this.highlight.nth(i).toString().split('@')
      const highlight_id = await this.page.getAttribute(highlightIdlocatorString[1], 'data-highlight-id')
      highlightIds.push(highlight_id)
    }
    return new Set(highlightIds).size
  }

  async highlightNotPresent() {
    // Verify highlights are not present in a page
    this.highlightIndicator = this.page.locator('.highlight')
    return this.highlightIndicator.isHidden()
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

  async addNote(note: string) {
    // Add note to a highlight
    // param: note - text to be added as annotation

    const EditBoxCount = await this.textarea.count()

    if (EditBoxCount > 1) {
      const i = await this.activeNotecard()
      await this.noteTextBox.nth(i).focus()
      await this.noteTextBox.nth(i).click()
      await this.noteTextBox.nth(i).type(note)
    } else {
      await this.noteTextBox.click()
      await this.noteTextBox.type(note)
    }
  }

  async editNote(note: string) {
    // Edit the note on a highlight
    // param: note - text to be updated in the annotation
    const noteLength = (await this.noteTextBox.textContent()).length
    const EditBoxCount = await this.textarea.count()

    if (EditBoxCount > 1) {
      // When there are multiple highlights in a page,
      // edit the active notecard
      const i = await this.activeNotecard()
      await this.noteTextBox.nth(i).focus()
      await this.noteTextBox.nth(i).click()

      // Move cursor to the beginning of the existing note
      let j: number
      for (j = 0; j < noteLength; j++) {
        await this.page.keyboard.press('ArrowLeft')
      }
      await this.noteTextBox.nth(i).type(note)
    } else {
      // When there is only one highlight in a page,
      // edit the available notecard
      await this.noteTextBox.focus()
      await this.noteTextBox.click()

      // Move cursor to the beginning of the existing note
      let j: number
      for (j = 0; j < noteLength; j++) {
        await this.page.keyboard.press('ArrowLeft')
      }
      await this.noteTextBox.type(note)
    }
  }

  async activeNotecard() {
    // Find the active notecard that is visible in the content page
    const EditBoxCount = await this.textarea.count()
    for (let i = 0; i < EditBoxCount; i++) {
      const textarea = await this.textarea.nth(i).evaluate((e: Element) => {
        return window.getComputedStyle(e).getPropertyValue('visibility')
      })
      if (textarea === 'visible') {
        return i
      }
    }
  }

  async noteConfirmDialog(confirm: Actions) {
    // Save or Cancel the note added in notebox
    // param: confirm - option to be selected in the Note Confirmation box
    // param values: - save or cancel set in enum Actions
    if (confirm == 'save') {
      this.saveNote.click()
    } else {
      this.cancelNote.click()
    }
    await this.noteEditCard.waitFor({ state: 'hidden' })
  }

  async noteText() {
    // Return the text present in the active notecard
    const NoteCardCount = await this.noteTextLocator.count()

    if (NoteCardCount > 1) {
      // When there are multiple notecards in a page,
      // return note text of the active notecard
      for (let i = 0; i < NoteCardCount; i++) {
        const noteText = await this.noteTextLocator.nth(i).evaluate((e: Element) => {
          return window.getComputedStyle(e).getPropertyValue('display')
        })
        if (noteText === 'block') {
          return await this.noteTextLocator.nth(i).textContent()
        }
      }
    } else {
      // When there is only one notecard in a page,
      // return note text of the available notecard
      const noteText = await this.noteTextLocator.evaluate((e: Element) => {
        return window.getComputedStyle(e).getPropertyValue('display')
      })
      if (noteText === 'block') {
        return await this.noteTextLocator.textContent()
      }
    }
  }

  async clickNextPage() {
    // Click Next link
    await this.next.click()
  }

  async clickPreviousPage() {
    // Click Previous link
    await this.previous.click()
  }

  async openMHmodal() {
    // Open My Highlights modal

    const mobileNav = new MobileNavigation(this.page)
    const browserAgent = await this.page.evaluate(() => navigator.userAgent)

    if (browserAgent.includes('Mobile') && browserAgent.includes('iPad')) {
      await mobileNav.openBigMobileMenu('MH')
    } else if (browserAgent.includes('Mobile')) {
      await mobileNav.openMobileMenu('MH')
    } else {
      await this.myHighlights.click()
      await Promise.all([this.MHbodyLoaded.waitFor()])
    }
  }

  async paracount() {
    // Number of paragraphs in the page
    const paracount = this.paragraph
    return await paracount.count()
  }

  async paraclick(randomparanumber: number) {
    // Click on nth paragraph in the page
    // param: randomparanumber - paragraph number to be clicked
    return this.paragraph.nth(randomparanumber).click()
  }

  async CloseNoteCard() {
    // Close the notecard
    // Chrome & safari - click somewhere outside the highlighted text.
    // Firefox - reload the page since the method used for other browsers is not working here.
    const browser = this.page.context().browser().browserType().name()
    if (browser === 'firefox') {
      await this.page.reload()
    } else {
      const body = await this.body.boundingBox()
      await this.page.mouse.wheel(body.x, body.y)
      await this.page.mouse.click(body.x - 100, body.y + 100)
    }
    await Promise.all([this.contentHighlightsLoaded.waitFor()])
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

enum Actions {
  Save = 'save',
  Cancel = 'cancel',
}

export { ContentPage, Actions }
