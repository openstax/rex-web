// Content page locators and functions
import { Locator, Page } from 'playwright'
import { sleep } from '../utilities/utilities'

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
    this.paragraph = this.page.locator('p[id*=para]')
    this.body = this.page.locator('[class*="page-content"]')
    this.MHbodyLoaded = this.page.locator('[data-testid="show-myhighlights-body"]')
    this.contentHighlightsLoaded = this.page.locator('[class*="HighlightsWrapper"]')
    // this.noteTextBox = this.page.locator('textarea')
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

  async highlightText(color: string, randomparanumber: number) {
    // Highlight selected text
    // param: highlight color
    // param: randomparanumber - paragraph number of the content to be highlighted

    await this.selectText(randomparanumber)

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

    // The notecard stays open after making a highlight,
    // which prevents click actions on other elements like next/previous
    // links underneath the highlighter. So close the notecard.
    await this.CloseNoteCard()
  }

  async clickHighlight(n: number) {
    // Click on a highlight
    // param: n - nth highlight on the content page
    this.highlight.nth(n).click()
  }

  async clickContextMenu(n: number) {
    // Click context menu of a highlight
    // param: n - nth highlight on the content page
    this.clickHighlight(n)
    this.contextMenu.click()
  }

  async editHighlight() {
    // Click the Edit option from a highlight's context menu
    this.editHighlightLocator.click()
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

  async addNote(note: string) {
    // Add note to a highlight
    // param: note - text to be added as annotation

    const EditBoxCount = await this.textarea.count()
    
    if (EditBoxCount > 1) {
   
    for (let i = 0; i < EditBoxCount; i++) {
      // await this.textarea.nth(i).waitFor() 
      const textarea = await this.textarea.nth(i).evaluate((e: Element) => {
        return window.getComputedStyle(e).getPropertyValue('visibility')
      
      })
      if (textarea === 'visible') {
        await this.noteTextBox.nth(i).focus()
        await this.noteTextBox.nth(i).click()
        await this.noteTextBox.nth(i).type(note)
        break
          }
        }
      }
      else {
        await this.noteTextBox.click()
        await this.noteTextBox.type(note)
      }
    
    await this.saveNote.click()
  }


  async activeNotecard() {
    const EditBoxCount = await this.textarea.count()
    for (let i = 0; i < EditBoxCount; i++) {
      const textarea = await this.textarea.nth(i).evaluate((e: Element) => {
        return window.getComputedStyle(e).getPropertyValue('visibility')
      
      })
      if (textarea === 'visible') {
        console.log(i)
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
    // Return the text present in the note attached to a highlight
    return this.noteTextLocator.textContent()
  }

  async clickNext() {
    // Click Next link
    await this.next.click()
  }

  async openMHmodal() {
    // Open My Highlights modal
    await this.myHighlights.click()
    await Promise.all([this.MHbodyLoaded.waitFor()])
  }

  async paracount() {
    // Number of paragraphs in the page
    const paracount = this.paragraph
    return await paracount.count()
  }

  async paraclick(randomparanumber: number) {
    // Number of paragraphs in the page
  
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
    await Promise.race([this.contentHighlightsLoaded.waitFor()])
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
