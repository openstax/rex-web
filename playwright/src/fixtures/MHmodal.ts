// My Highlights modal locators and functions
import { Locator, Page } from 'playwright'
import { sleep } from '../utilities/utilities'

class MHModal {
  // MH modal objects
  MHModal: Locator
  MHModalCloseIcon: Locator
  page: Page

  constructor(page: Page) {
    this.page = page
    this.MHModal = page.locator('data-testid=highlights-popup-wrapper')
    this.MHModalCloseIcon = page.locator('data-testid=close-highlights-popup')
  }

  // Close My Highlights modal using x icon
  async closeMHModal() {
    await this.MHModalCloseIcon.click()
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
    return await this.highlight.count()
  }

  async highlightlist() {
    // List of highlights in MH
    const highlightList = []
    for (let i = 0; i < (await this.highlightCount()); i++) {
      highlightList.push(this.highlight.nth(i))
    }
    return highlightList
  }

  async clickContextMenu(n: number) {
    // Click context menu
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

  async clickDeleteHighlight(confirm: string) {
    // Delete a highlight
    // param: confirm - option to be selected in the Delete Confirmation modal
    // param values: - delete or cancel
    await this.deleteHighlight.click()
    if (confirm == 'delete') {
      this.saveDelete.click({ force: true })
    } else {
      this.cancelDelete.click()
    }
  }
}

export { MHModal, MHHighlights }
