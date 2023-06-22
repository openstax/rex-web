import { test, expect } from '@playwright/test'
import {
  ContentPage,
  Actions,
  KsModal,
  MHModal,
  MHHighlights,
  Action,
  randomNum,
  randomstring,
  rexUserSignup,
  rexUserSignout,
  sleep,
} from './helpers'

test('C651124 open keyboard shortcut modal using keyboard', async ({ browserName, page }) => {
  // GIVEN: Open Rex page
  const BookPage = new ContentPage(page)
  const path = '/books/business-ethics/pages/preface'
  await BookPage.open(path)

  // AND: Tab 3 times and hit Enter
  if (browserName === 'webkit') {
    await page.keyboard.press('Alt+Tab')
    await page.keyboard.press('Alt+Tab')
    await page.keyboard.press('Alt+Tab')
    await page.keyboard.press('Alt+Enter')
  } else {
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
  }

  // THEN: The KS modal is open
  await expect(page).toHaveURL('/books/business-ethics/pages/preface?modal=KS')

  const Modal = new KsModal(page)
  await expect(Modal.ksModal).toBeVisible()

  // WHEN: Hit Esc key
  await Modal.ksModal.press('Escape')

  // THEN: The KS modal is closed
  await expect(page).toHaveURL('/books/business-ethics/pages/preface')
  await expect(Modal.ksModal).toBeHidden()
})

test('C651123 open keyboard shortcut modal using hot keys', async ({ page }) => {
  // GIVEN: Open Rex page
  const BookPage = new ContentPage(page)
  const path = '/books/organizational-behavior/pages/preface'
  await BookPage.open(path)

  // AND: Open KS modal using Shift+? keys
  await page.keyboard.press('Shift+?')

  // THEN: The KS modal is open
  const ksModal = new KsModal(page)
  await expect(ksModal.ksModal).toBeVisible()
  await expect(page).toHaveURL('/books/organizational-behavior/pages/preface?modal=KS')

  // WHEN: Close the KS modal using X icon
  await ksModal.closeKsModal()

  // THEN: The KS modal is closed
  await expect(ksModal.ksModal).toBeHidden()
  await expect(page).toHaveURL('/books/organizational-behavior/pages/preface')
})

test('signup and highlight', async ({ page, isMobile }) => {
  test.skip(isMobile as boolean, 'test only desktop resolution')

  // GIVEN: Open Rex page
  const BookPage = new ContentPage(page)
  const path = '/books/introduction-anthropology/pages/7-introduction'
  await BookPage.open(path)

  // AND: Signup as a new user
  await rexUserSignup(page)
  await expect(page).toHaveURL('/books/introduction-anthropology/pages/7-introduction')

  // WHEN: Highlight any random paragraph
  const paracount = BookPage.paracount()
  const randomparanumber = randomNum(await paracount)
  await BookPage.highlightText('green', randomparanumber)

  // THEN: Text is highlighted
  const highlightcount = await BookPage.highlightCount()
  expect(highlightcount).toBe(1)

  // AND: Highlighted color in the content page is green
  const highlight_id = await BookPage.highlight_id(randomparanumber)
  const highlightColor = await BookPage.contentHighlightColor(highlight_id)
  expect(highlightColor).toBe('green')

  // WHEN: Log out the user
  await rexUserSignout(page)
  await expect(page.locator('[data-testid="nav-login"]')).toContainText('Log in')

  // THEN: The highlight is removed from the page
  expect(await BookPage.highlightNotPresent()).toBe(true)
})

test('Multiple highlights and MH modal edits', async ({ page, isMobile }) => {
  test.skip(isMobile as boolean, 'test only desktop resolution')

  // GIVEN: Open Rex page
  const BookPage = new ContentPage(page)
  const path = '/books/introduction-anthropology/pages/7-introduction'
  await BookPage.open(path)

  // AND: Signup as a new user
  await rexUserSignup(page)
  await expect(page).toHaveURL('/books/introduction-anthropology/pages/7-introduction')

  // WHEN: Highlight 2 random paragraphs
  const paracount = BookPage.paracount()
  const randomparanumber = randomNum(await paracount)
  await BookPage.highlightText('green', randomparanumber)

  const randomparanumber2 = randomNum(await paracount, randomparanumber)
  await BookPage.highlightText('yellow', randomparanumber2)

  // THEN: 2 paragraphs are highlighted in content page
  const highlightcount = await BookPage.highlightCount()
  expect(highlightcount).toBe(2)

  // AND: Navigate to next page
  await BookPage.clickNextPage()

  // WHEN: Highlight 2 random paragraphs
  const paracount3 = BookPage.paracount()
  const randomparanumber3 = randomNum(await paracount3)
  await BookPage.highlightText('green', randomparanumber3)

  const randomparanumber4 = randomNum(await paracount3, randomparanumber3)
  await BookPage.highlightText('yellow', randomparanumber4)

  // THEN: 2 paragraphs are highlighted in content page
  const highlightcount1 = await BookPage.highlightCount()
  expect(highlightcount1).toBe(2)

  // WHEN: Open MH modal
  await BookPage.openMHmodal()

  const Modal = new MHModal(page)
  await Modal.waitForHighlights()
  await expect(Modal.MHModal).toBeVisible()
  const Edithighlight = new MHHighlights(page)

  // THEN: MH page has all the highlights made in content page
  const MHhighlightcount = await Edithighlight.highlightCount()
  expect(MHhighlightcount).toBe(4)

  // WHEN: Change highlight color of 3rd highlight
  await Edithighlight.clickContextMenu(3)
  await Edithighlight.changeColor('purple')
  await Edithighlight.clickContextMenu(3)

  // THEN: The highlight changes to purple
  const highlightId = await Edithighlight.highlightIds()
  expect(await Edithighlight.highlightColor(highlightId[3])).toBe('purple')

  // WHEN: Add note to the 3rd highlight and cancel
  await Edithighlight.clickContextMenu(3)
  await Edithighlight.addNote(randomstring())
  await Edithighlight.clickCancel()

  // THEN: Note is not added to the 3rd highlight
  expect(await Edithighlight.noteAttached(highlightId[3])).toBe(false)

  // WHEN: Add note to the 0th highlight and save
  const noteText = randomstring()
  await Edithighlight.clickContextMenu(0)
  await Edithighlight.addNote(noteText)
  await Edithighlight.clickSave()

  // THEN: Note is added to the highlight
  expect(await Edithighlight.noteText(highlightId[0])).toBe(noteText)

  // WHEN: Edit note of 0th highlight and save
  const apendNote = randomstring(8)
  await Edithighlight.clickContextMenu(0)
  await Edithighlight.editNote(apendNote + ' ')
  await Edithighlight.clickSave()

  // THEN: Note is updated with new text
  expect(await Edithighlight.noteText(highlightId[0])).toBe(apendNote + ' ' + noteText)

  // WHEN: Delete 1st highlight and cancel
  await Edithighlight.clickContextMenu(1)
  await Edithighlight.clickDeleteHighlight(Action.Cancel)

  // WHEN: Delete a highlight and save
  await Edithighlight.clickContextMenu(1)
  await Edithighlight.clickDeleteHighlight(Action.Delete)

  // WHEN: Close the MH modal using X icon
  await Modal.closeMHModal()

  // THEN: The MH modal is closed
  await expect(Modal.MHModal).toBeHidden()

  const contentHighlightColor = await BookPage.contentHighlightColor(highlightId[3])
  expect(contentHighlightColor).toBe('purple')

  // Click Previous page
  await BookPage.clickPreviousPage()

  // THEN: Each note is attached to the corresponding highlight
  await BookPage.clickHighlight(highlightId[0])
  expect(await BookPage.noteText()).toBe(apendNote + ' ' + noteText)

  await BookPage.openMHmodal()
  const MHhighlightcount1 = await Edithighlight.highlightCount()
  expect(MHhighlightcount1).toBe(3)
})

test('note in content page', async ({ page, isMobile }) => {
  test.skip(isMobile as boolean, 'test only desktop resolution')

  // GIVEN: Open Rex page
  const BookPage = new ContentPage(page)
  const path = '/books/introduction-anthropology/pages/7-introduction'
  await BookPage.open(path)

  // AND: Signup as a new user
  await rexUserSignup(page)
  await expect(page).toHaveURL('/books/introduction-anthropology/pages/7-introduction')

  // WHEN: Highlight 1 random paragraph
  const paracount = BookPage.paracount()
  const randomparanumber = randomNum(await paracount)
  await BookPage.highlightText('green', randomparanumber)

  // AND: Add note to the highlight and save
  const noteText = randomstring()
  const highlightId = await BookPage.highlight_id(randomparanumber)
  await BookPage.clickHighlight(highlightId)
  await BookPage.addNote(noteText)
  await BookPage.noteConfirmDialog(Actions.Save)

  // AND: Edit note to the highlight and save
  const editnoteText = randomstring()
  await BookPage.clickContextMenu(highlightId)
  await BookPage.editHighlight()
  await BookPage.editNote(editnoteText)
  await BookPage.noteConfirmDialog(Actions.Save)
  expect(await BookPage.noteText()).toBe(editnoteText + noteText)
})

test('multiple notes in content page', async ({ page, isMobile }) => {
  test.skip(isMobile as boolean, 'test only desktop resolution')

  // GIVEN: Open Rex page
  const BookPage = new ContentPage(page)
  const path = '/books/introduction-anthropology/pages/7-introduction'
  await BookPage.open(path)

  // AND: Signup as a new user
  await rexUserSignup(page)
  await expect(page).toHaveURL('/books/introduction-anthropology/pages/7-introduction')

  // WHEN: Highlight a random paragraph with note
  const paracount = BookPage.paracount()
  const randomparanumber0 = randomNum(await paracount)
  const noteText0 = randomstring()
  await BookPage.highlightText('green', randomparanumber0, noteText0)
  const highlightId0 = await BookPage.highlight_id(randomparanumber0)

  // AND: Highlight a random paragraph without note
  const randomparanumber1 = randomNum(await paracount, randomparanumber0)
  await BookPage.highlightText('yellow', randomparanumber1)
  const highlightId1 = await BookPage.highlight_id(randomparanumber1)

  // AND: Add note to the 2nd highlight and save
  await BookPage.clickHighlight(highlightId1)
  const noteText1 = randomstring()
  await BookPage.addNote(noteText1)
  await BookPage.noteConfirmDialog(Actions.Save)

  // THEN: Each note is attached to the corresponding highlight
  await BookPage.clickHighlight(highlightId0)
  expect(await BookPage.noteText()).toBe(noteText0)
  await BookPage.clickHighlight(highlightId1)
  expect(await BookPage.noteText()).toBe(noteText1)
})

test('C649726 MH modal stays open on reload', async ({ page, isMobile }) => {
  test.skip(isMobile as boolean, 'test only desktop resolution')

  // GIVEN: Open Rex page
  const BookPage = new ContentPage(page)
  const path = '/books/introduction-anthropology/pages/7-introduction'
  await BookPage.open(path)

  // AND: Signup as a new user
  await rexUserSignup(page)
  await expect(page).toHaveURL('/books/introduction-anthropology/pages/7-introduction')

  // AND: Highlight a random paragraph with note
  const paracount = BookPage.paracount()
  const randomparanumber0 = randomNum(await paracount)
  const noteText0 = randomstring()
  await BookPage.highlightText('green', randomparanumber0, noteText0)

  // WHEN: Open MH modal
  await BookPage.openMHmodal()

  // THEN: MH page has all the highlights made in content page
  const Modal = new MHModal(page)
  await Modal.waitForHighlights()
  await expect(Modal.MHModal).toBeVisible()
  const Edithighlight = new MHHighlights(page)

  const MHhighlightcount = await Edithighlight.highlightCount()
  expect(MHhighlightcount).toBe(1)

  // WHEN: Reload the browser
  await page.reload()
  await Modal.waitForHighlights()

  // THEN: MH modal stays open
  await expect(Modal.MHModal).toBeVisible()
  expect(MHhighlightcount).toBe(1)
})