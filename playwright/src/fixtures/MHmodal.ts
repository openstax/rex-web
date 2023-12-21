// My Highlights modal locators and functions
import { Locator, Page } from 'playwright'
import { TOC, colorNumber } from '../../tests/rex-test/helpers'

class MHModal {
  // MH modal objects
  MHModal: Locator
  MHModalCloseIcon: Locator
  chapterDropdownLocator: Locator
  colorDropdownLocator: Locator
  checkBoxStatus: Locator
  page: Page

  constructor(page: Page) {
    this.page = page
    this.MHModal = page.locator('data-testid=highlights-popup-wrapper')
    this.MHModalCloseIcon = page.locator('data-testid=close-highlights-popup')
    this.chapterDropdownLocator = page.locator('[aria-label="Filter highlights by Chapter"]')
    this.colorDropdownLocator = page.locator('[aria-label="Filter highlights by Color"]')
    this.checkBoxStatus = page.locator('label[class*="Checkbox"]')
  }

  // Close My Highlights modal using x icon
  async closeMHModal() {
    await this.MHModalCloseIcon.click()
  }

  async waitForHighlights() {
    // Wait for the highlights to be loaded in MH modal
    await this.page.waitForSelector('[class*=HighlightOuterWrapper]')
  }

  async chapterDropdownCount() {
    // Total number of checkboxes in the chapter dropdown
    const Toc = new TOC(this.page)
    return (
      (await Toc.chapterCount()) +
      (await Toc.standalonePagesCount()) +
      (await Toc.unitIntroCount()) +
      (await Toc.eobDropdownCount())
    )
  }

  async chapterDropdownText(n: number) {
    // Chapter name listed under the chapter dropdown
    return await this.checkBoxStatus.nth(n).textContent()
  }

  async toggleChapterDropdown() {
    // Open the chapter dropdown filter
    await this.chapterDropdownLocator.click()
  }

  async toggleColorDropdown() {
    // Open the color dropdown filter
    await this.colorDropdownLocator.click()
  }

  async checkboxChecked(n: any) {
    // verify the checkbox status is checked in the chapter/color dropdown
    if (typeof n === 'string') {
      n = colorNumber(n)
    }
    const checkBoxHtml = await this.checkBoxStatus.nth(await n).innerHTML()
    if (checkBoxHtml.includes('type="checkbox" checked')) {
      return true
    }
  }

  async checkboxDisabled(n: any) {
    // verify the checkbox status is disabled in the chapter/color dropdown
    if (typeof n === 'string') {
      n = colorNumber(n)
    }
    const checkBoxHtml = await this.checkBoxStatus.nth(n).innerHTML()
    if (checkBoxHtml.includes('type="checkbox" disabled')) {
      return true
    }
  }

  async checkboxUnchecked(n: any) {
    // verify the checkbox status is unchecked and enabled in the chapter/color dropdown
    if (typeof n === 'string') {
      n = colorNumber(n)
    }
    const checkBoxHtml = await this.checkBoxStatus.nth(n).innerHTML()
    if (checkBoxHtml.includes('<input type="checkbox">')) {
      return true
    }
  }

  async chapterCheckedCount() {
    let chapterCheckedCounter = 0
    for (let i = 0; i < (await this.chapterDropdownCount()); i++) {
      const checkBoxHtml = await this.checkBoxStatus.nth(i).innerHTML()
      if (checkBoxHtml.includes('<input type="checkbox" checked')) {
        chapterCheckedCounter = chapterCheckedCounter + 1
      }
    }
    return chapterCheckedCounter
  }

  async colorCheckedCount() {
    let colorCheckedCounter = 0
    for (let i = 0; i < 5; i++) {
      const checkBoxHtml = await this.checkBoxStatus.nth(i).innerHTML()
      if (checkBoxHtml.includes('<input type="checkbox" checked')) {
        colorCheckedCounter = colorCheckedCounter + 1
      }
    }
    return colorCheckedCounter
  }

  async toggleCheckbox(n: any) {
    // enable/disable checkboxes in the chapter/color dropdown
    if (typeof n === 'string') {
      n = colorNumber(n)
    }
    await this.page.locator('label[class*="Checkbox"]').nth(n).click()
  }
}

class MHHighlights {
  // Highlights section in MH modal
  highlight: Locator
  MHContextMenu: Locator
  blue: Locator
  green: Locator
  pink: Locator
  purple: Locator
  yellow: Locator
  addNoteMenu: Locator
  cancelNote: Locator
  savelNote: Locator
  editNoteMenu: Locator
  deleteHighlight: Locator
  saveDelete: Locator
  cancelDelete: Locator
  noteTextBox: Locator
  page: Page
  highlightIdlocator: Locator
  colordiv: Locator
  noteIndicator: Locator
  noteTextLocator: Locator

  constructor(page: Page) {
    this.page = page
    this.highlight = page.locator('[class*="HighlightOuterWrapper"]')
    this.MHContextMenu = this.page.locator('[class*="MenuToggle"]')
    this.blue = this.page.locator('[data-testid="show-myhighlights-body"] [aria-label="Apply blue highlight"]')
    this.green = this.page.locator('[data-testid="show-myhighlights-body"] [aria-label="Apply green highlight"]')
    this.pink = this.page.locator('[data-testid="show-myhighlights-body"] [aria-label="Apply pink highlight"]')
    this.purple = this.page.locator('[data-testid="show-myhighlights-body"] [aria-label="Apply purple highlight"]')
    this.yellow = this.page.locator('[data-testid="show-myhighlights-body"] [aria-label="Apply yellow highlight"]')
    this.addNoteMenu = this.page.locator('text=Add note')
    this.editNoteMenu = this.page.locator('text=Edit')
    this.cancelNote = this.page.locator('[data-testid="cancel"]')
    this.savelNote = this.page.locator('[data-testid="save"]')
    this.deleteHighlight = this.page.locator('text=Delete')
    this.saveDelete = this.page.locator('[data-testid="delete"]')
    this.cancelDelete = this.page.locator('[data-testid="cancel"]')
    this.noteTextBox = this.page.locator('[aria-label="Enter note\\\'s text"]')
  }

  async highlightCount() {
    // Total number of highlights in MH page
    await Promise.all([this.page.waitForSelector('[class*="HighlightOuterWrapper"]')])
    return await this.highlight.count()
  }

  async highlightIds() {
    // List of highlight Ids in MH

    const highlightIds = []
    for (let i = 0; i < (await this.highlightCount()); i++) {
      this.highlightIdlocator = this.highlight.nth(i).locator('div:nth-of-type(2) div')
      const highlightIdlocatorString = this.highlightIdlocator.toString().split('@')
      const highlight_id = await this.page.getAttribute(highlightIdlocatorString[1], 'data-highlight-id')
      highlightIds.push(highlight_id)
    }
    return highlightIds
  }

  async clickContextMenu(n: number) {
    // Click context menu of nth highlight
    await this.MHContextMenu.nth(n).click()
  }

  async changeColor(color: string) {
    // Change highlight color from MH modal
    // param: color - new color to be applied to the highlight
    if (color === 'blue') {
      return this.blue.click()
    } else if (color === 'green') {
      return this.green.click()
    } else if (color === 'pink') {
      return this.pink.click()
    } else if (color === 'purple') {
      return this.purple.click()
    } else if (color === 'yellow') {
      return this.yellow.click()
    } else if (color === '') {
      return this.yellow.click()
    } else {
      throw new Error('Color specified in the test does not match the Highlighter colors')
    }
  }

  async addNote(note: string) {
    // Add note to a highlight
    // param: note - text to be added as annotation
    await this.addNoteMenu.click()
    await this.noteTextBox.type(note)
  }

  async editNote(note: string) {
    // Edit existing note of a highlight. Appends text to beginning of existing annotation.
    // param: note - text to be appeneded as annotation
    await this.editNoteMenu.click()
    await this.noteTextBox.type(note)
  }

  async clickCancel() {
    // Click Cancel on note textbox
    await this.cancelNote.click()
  }

  async clickSave() {
    // Click Save on note textbox
    await this.savelNote.click()
  }

  async clickDeleteHighlight(confirm: Action) {
    // Delete a highlight
    // param: confirm - option to be selected in the Delete Confirmation modal
    // param values: - delete or cancel set in enum Action

    await this.deleteHighlight.click()
    if (confirm == 'delete') {
      this.saveDelete.click({ force: true })
    } else {
      this.cancelDelete.click()
    }
  }

  async highlightColor(highlight_id: string) {
    // Return color of the highlight in the MH modal
    // param: highlight_id - highlight id of the highlight in the MH modal
    this.colordiv = this.page.locator(`//div[@data-highlight-id="${highlight_id}"]/..`)
    const colordivsplit = this.colordiv.toString().split('Locator@')[1]
    const color = await this.page.getAttribute(colordivsplit, 'color')
    return color
  }

  async noteAttached(highlight_id: string) {
    // Check if note is attached to a highlight
    // param: highlight_id - highlight id of the highlight in the MH modal
    // rtype: boolean
    this.noteIndicator = this.page.locator(
      `//div[@data-highlight-id="${highlight_id}"]/following-sibling::div/span[contains(text(), 'Note:')]`,
    )
    return this.noteIndicator.isVisible()
  }

  async noteText(highlight_id: string) {
    // Return the text attached to the note of a highlight
    // param: highlight_id - highlight id of the highlight in the MH modal
    this.noteTextLocator = this.page.locator(`//div[@data-highlight-id="${highlight_id}"]/following-sibling::div/div`)
    return this.noteTextLocator.textContent()
  }
}

enum Action {
  Delete = 'delete',
  Cancel = 'cancel',
}
export { MHModal, MHHighlights, Action }
