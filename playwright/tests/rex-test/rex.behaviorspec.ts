import { test, expect } from '@playwright/test'
import {
  ContentPage,
  Actions,
  KsModal,
  MHModal,
  TOC,
  MHHighlights,
  Action,
  randomNum,
  randomstring,
  rexUserSignup,
  rexUserSignout,
  sleep,
} from './helpers'

test('C651124 open keyboard shortcut modal using keyboard', async ({ browserName, page, isMobile }) => {
  test.skip(isMobile as boolean, 'test only desktop resolution')
  // GIVEN: Open Rex page
  const bookPage = new ContentPage(page)
  const path = '/books/business-ethics/pages/preface'
  await bookPage.open(path)

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

test('C651123 open keyboard shortcut modal using hot keys', async ({ page, isMobile }) => {
  test.skip(isMobile as boolean, 'test only desktop resolution')
  // GIVEN: Open Rex page
  const bookPage = new ContentPage(page)
  const path = '/books/organizational-behavior/pages/preface'
  await bookPage.open(path)

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
  const bookPage = new ContentPage(page)
  const path = '/books/introduction-anthropology/pages/7-introduction'
  await bookPage.open(path)

  // AND: Signup as a new user
  await rexUserSignup(page)
  await expect(page).toHaveURL('/books/introduction-anthropology/pages/7-introduction')

  // WHEN: Highlight any random paragraph
  const paracount = bookPage.paracount()
  const randomparanumber = randomNum(await paracount)
  await bookPage.highlightText('green', randomparanumber)

  // THEN: Text is highlighted
  const highlightcount = await bookPage.highlightCount()
  expect(highlightcount).toBe(1)

  // AND: Highlighted color in the content page is green
  const highlight_id = await bookPage.highlight_id(randomparanumber)
  const highlightColor = await bookPage.contentHighlightColor(highlight_id)
  expect(highlightColor).toBe('green')

  // WHEN: Log out the user
  await rexUserSignout(page)
  await expect(page.locator('[data-testid="nav-login"]')).toContainText('Log in')

  // THEN: The highlight is removed from the page
  expect(await bookPage.highlightNotPresent()).toBe(true)
})

test('Multiple highlights and MH modal edits', async ({ page, isMobile }) => {
  test.skip(isMobile as boolean, 'test only desktop resolution')

  // GIVEN: Open Rex page
  const bookPage = new ContentPage(page)
  const path = '/books/introduction-anthropology/pages/7-introduction'
  await bookPage.open(path)

  // AND: Signup as a new user
  await rexUserSignup(page)
  await expect(page).toHaveURL('/books/introduction-anthropology/pages/7-introduction')

  // WHEN: Highlight 2 random paragraphs
  const paracount = bookPage.paracount()
  const randomparanumber = randomNum(await paracount)
  await bookPage.highlightText('green', randomparanumber)

  const randomparanumber2 = randomNum(await paracount, randomparanumber)
  await bookPage.highlightText('yellow', randomparanumber2)

  // THEN: 2 paragraphs are highlighted in content page
  const highlightcount = await bookPage.highlightCount()
  expect(highlightcount).toBe(2)

  // AND: Navigate to next page
  await bookPage.clickNextPage()

  // WHEN: Highlight 2 random paragraphs
  const paracount3 = bookPage.paracount()
  const randomparanumber3 = randomNum(await paracount3)
  await bookPage.highlightText('green', randomparanumber3)

  const randomparanumber4 = randomNum(await paracount3, randomparanumber3)
  await bookPage.highlightText('yellow', randomparanumber4)

  // THEN: 2 paragraphs are highlighted in content page
  const highlightcount1 = await bookPage.highlightCount()
  expect(highlightcount1).toBe(2)

  // WHEN: Open MH modal
  await bookPage.openMHmodal()

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

  const contentHighlightColor = await bookPage.contentHighlightColor(highlightId[3])
  expect(contentHighlightColor).toBe('purple')

  // Click Previous page
  await bookPage.clickPreviousPage()

  // THEN: Each note is attached to the corresponding highlight
  await bookPage.clickHighlight(highlightId[0])
  expect(await bookPage.noteText()).toBe(apendNote + ' ' + noteText)

  await bookPage.openMHmodal()
  const MHhighlightcount1 = await Edithighlight.highlightCount()
  expect(MHhighlightcount1).toBe(3)
})

test('note in content page', async ({ page, isMobile }) => {
  test.skip(isMobile as boolean, 'test only desktop resolution')

  // GIVEN: Open Rex page
  const bookPage = new ContentPage(page)
  const path = '/books/introduction-anthropology/pages/7-introduction'
  await bookPage.open(path)

  // AND: Signup as a new user
  await rexUserSignup(page)
  await expect(page).toHaveURL('/books/introduction-anthropology/pages/7-introduction')

  // WHEN: Highlight 1 random paragraph
  const paracount = bookPage.paracount()
  const randomparanumber = randomNum(await paracount)
  await bookPage.highlightText('green', randomparanumber)

  // AND: Add note to the highlight and save
  const noteText = randomstring()
  const highlightId = await bookPage.highlight_id(randomparanumber)
  await bookPage.clickHighlight(highlightId)
  await bookPage.addNote(noteText)
  await bookPage.noteConfirmDialog(Actions.Save)

  // AND: Edit note to the highlight and save
  const editnoteText = randomstring()
  await bookPage.clickContextMenu(highlightId)
  await bookPage.editHighlight()
  await bookPage.editNote(editnoteText)
  await bookPage.noteConfirmDialog(Actions.Save)
  expect(await bookPage.noteText()).toBe(editnoteText + noteText)
})

test('multiple notes in content page', async ({ page, isMobile }) => {
  test.skip(isMobile as boolean, 'test only desktop resolution')

  // GIVEN: Open Rex page
  const bookPage = new ContentPage(page)
  const path = '/books/introduction-anthropology/pages/7-introduction'
  await bookPage.open(path)

  // AND: Signup as a new user
  await rexUserSignup(page)
  await expect(page).toHaveURL('/books/introduction-anthropology/pages/7-introduction')

  // WHEN: Highlight a random paragraph with note
  const paracount = bookPage.paracount()
  const randomparanumber0 = randomNum(await paracount)
  const noteText0 = randomstring()
  await bookPage.highlightText('green', randomparanumber0, noteText0)
  const highlightId0 = await bookPage.highlight_id(randomparanumber0)

  // AND: Highlight a random paragraph without note
  const randomparanumber1 = randomNum(await paracount, randomparanumber0)
  await bookPage.highlightText('yellow', randomparanumber1)
  const highlightId1 = await bookPage.highlight_id(randomparanumber1)

  // AND: Add note to the 2nd highlight and save
  await bookPage.clickHighlight(highlightId1)
  const noteText1 = randomstring()
  await bookPage.addNote(noteText1)
  await bookPage.noteConfirmDialog(Actions.Save)

  // THEN: Each note is attached to the corresponding highlight
  await bookPage.clickHighlight(highlightId0)
  expect(await bookPage.noteText()).toBe(noteText0)
  await bookPage.clickHighlight(highlightId1)
  expect(await bookPage.noteText()).toBe(noteText1)
})

test('C649726 MH modal stays open on reload', async ({ page, isMobile }) => {
  test.skip(isMobile as boolean, 'test only desktop resolution')

  // GIVEN: Open Rex page
  const bookPage = new ContentPage(page)
  const path = '/books/introduction-anthropology/pages/7-introduction'
  await bookPage.open(path)

  // AND: Signup as a new user
  await rexUserSignup(page)
  await expect(page).toHaveURL('/books/introduction-anthropology/pages/7-introduction')

  // AND: Highlight a random paragraph with note
  const paracount = bookPage.paracount()
  const randomparanumber0 = randomNum(await paracount)
  const noteText0 = randomstring()
  await bookPage.highlightText('green', randomparanumber0, noteText0)

  // WHEN: Open MH modal
  await bookPage.openMHmodal()

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

test('C660045 click unit introduction page', async ({ page, isMobile }, testinfo) => {
  // GIVEN: Open Rex page
  const bookPage = new ContentPage(page)
  const path = '/books/writing-guide/pages/preface'
  await bookPage.open(path)

  // AND: Signup as a new user
  await rexUserSignup(page)

  const Toc = new TOC(page)
  await Toc.pageClick(1)
  await expect(page).toHaveURL('/books/writing-guide/pages/1-unit-introduction')
  expect(await Toc.SectionName()).toBe('1 Unit Introduction')
  expect(await Toc.UnitName()).toBe('The Things We Carry: Experience, Culture, and Language')

  // WHEN: Open MH modal and open chapter dropdown
  await bookPage.openMHmodal()
  const Modal = new MHModal(page)
  await Modal.toggleChapterDropdown()
  expect(await Modal.chapterDropdownText(1)).toBe('1 Unit Introduction')

  // Validate total number of chapters in the chapter dropdown is 26
  const chapterDropdownCount = await Modal.chapterDropdownCount()
  expect(chapterDropdownCount).toBe(26)
})

test('C483595 click pages on book with no units', async ({ page, isMobile }, testinfo) => {
  // GIVEN: Open Rex page
  const bookPage = new ContentPage(page)
  const path = '/books/college-algebra-2e/pages/preface'
  await bookPage.open(path)

  // AND: Signup as a new user
  await rexUserSignup(page)

  // click chapter page
  const Toc = new TOC(page)
  await Toc.pageClick(28)
  await expect(page).toHaveURL('/books/college-algebra-2e/pages/3-2-domain-and-range')
  expect(await Toc.SectionName()).toBe('3.2 Domain and Range')
  expect(await Toc.ChapterName()).toBe('3         Functions')

  // click eoc page
  await Toc.pageClick(11)
  await expect(page).toHaveURL('/books/college-algebra-2e/pages/1-review-exercises')
  expect(await Toc.SectionName()).toBe('Review Exercises')
  expect(await Toc.ChapterName()).toBe('1         Prerequisites')
  expect(await Toc.eocSectionHeading()).toBe('Exercises')

  // click eob page
  await Toc.pageClick(120)
  await expect(page).toHaveURL('/books/college-algebra-2e/pages/chapter-8')
  expect(await Toc.SectionName()).toBe('Chapter 8')
  expect(await Toc.eobSectionHeading()).toBe('Answer Key')

  // WHEN: Open MH modal and open chapter dropdown
  await bookPage.openMHmodal()
  const Modal = new MHModal(page)
  await Modal.toggleChapterDropdown()
  console.log(await Modal.chapterDropdownText(1))
  expect(await Modal.chapterDropdownText(1)).toBe('1\n     \n    Prerequisites')

  // Validate total number of chapters in the chapter dropdown is 12
  const chapterDropdownCount = await Modal.chapterDropdownCount()
  expect(chapterDropdownCount).toBe(12)
})

test('C483594 click pages on book with units', async ({ page, isMobile }, testinfo) => {
  // GIVEN: Open Rex page
  const bookPage = new ContentPage(page)
  const path = '/books/university-physics-volume-1/pages/preface'
  await bookPage.open(path)

  // AND: Signup as a new user
  await rexUserSignup(page)

  // click chapter page (special character present in section name)
  const Toc = new TOC(page)
  await Toc.pageClick(57)
  await expect(page).toHaveURL('/books/university-physics-volume-1/pages/5-2-newtons-first-law')
  expect(await Toc.SectionName()).toBe("5.2 Newton's First Law")
  expect(await Toc.ChapterName()).toBe("5         Newton's Laws of Motion")
  expect(await Toc.UnitName()).toBe('Mechanics')

  // click eoc page
  await Toc.pageClick(200)
  await expect(page).toHaveURL('/books/university-physics-volume-1/pages/15-summary')
  expect(await Toc.SectionName()).toBe('Summary')
  expect(await Toc.ChapterName()).toBe('15         Oscillations')
  expect(await Toc.UnitName()).toBe('Waves and Acoustics')
  expect(await Toc.eocSectionHeading()).toBe('Chapter Review')

  // click eob page
  await Toc.pageClick(245)
  await expect(page).toHaveURL('/books/university-physics-volume-1/pages/chapter-4')
  expect(await Toc.SectionName()).toBe('Chapter 4')
  expect(await Toc.eobSectionHeading()).toBe('Answer Key')

  // WHEN: Open MH modal and open chapter dropdown
  await bookPage.openMHmodal()
  const Modal = new MHModal(page)
  await Modal.toggleChapterDropdown()
  expect(await Modal.chapterDropdownText(1)).toBe('1\n     \n    Units and Measurement')

  // Validate total number of chapters in the chapter dropdown is 27
  const chapterDropdownCount = await Modal.chapterDropdownCount()
  expect(chapterDropdownCount).toBe(27)
})

test('C242991 special characters are escaped in slug', async ({ page, isMobile }, testinfo) => {
  // GIVEN: Open Rex page
  const bookPage = new ContentPage(page)
  const path = '/books/psychologia-polska/pages/przedmowa'
  await bookPage.open(path)

  // WHEN: click chapter page with special character present in section name
  const Toc = new TOC(page)
  await Toc.pageClick(12)

  // THEN: Special characters are escaped in the url
  await expect(page).toHaveURL('/books/psychologia-polska/pages/2-1-dlaczego-badania-sa-wazne')
  expect(await Toc.SectionName()).toBe('2.1 Dlaczego badania są ważne?')
  expect(await Toc.ChapterName()).toBe('2         Prowadzenie badań')
})

test('MH page dropdown filters', async ({ page, isMobile }) => {
  test.skip(isMobile as boolean, 'test only desktop resolution')

  // GIVEN: Open Rex page
  const bookPage = new ContentPage(page)
  const path = '/books/introduction-anthropology/pages/7-introduction'
  await bookPage.open(path)

  // AND: Signup as a new user
  await rexUserSignup(page)
  await expect(page).toHaveURL('/books/introduction-anthropology/pages/7-introduction')

  // AND: Highlight a random paragraph with note
  const paracount = bookPage.paracount()
  const randomparanumber0 = randomNum(await paracount)
  const noteText0 = randomstring()
  await bookPage.highlightText('green', randomparanumber0, noteText0)
  const highlightId0 = await bookPage.highlight_id(randomparanumber0)

  // AND: Highlight a random paragraph without note
  const randomparanumber1 = randomNum(await paracount, randomparanumber0)
  await bookPage.highlightText('yellow', randomparanumber1)
  const highlightId1 = await bookPage.highlight_id(randomparanumber1)

  const Toc = new TOC(page)
  await Toc.pageClick(24)

  // AND: Highlight a random paragraph with note
  const paracount1 = bookPage.paracount()
  const randomparanumber2 = randomNum(await paracount1)
  const noteText2 = randomstring()
  await bookPage.highlightText('pink', randomparanumber2, noteText2)
  const highlightId2 = await bookPage.highlight_id(randomparanumber2)

  // AND: Highlight a random paragraph without note
  const randomparanumber3 = randomNum(await paracount1, randomparanumber2)
  await bookPage.highlightText('blue', randomparanumber3)
  const highlightId3 = await bookPage.highlight_id(randomparanumber3)

  // AND: Open MH modal
  await bookPage.openMHmodal()
  const Modal = new MHModal(page)
  await Modal.waitForHighlights()

  // AND: Verify all the highlights are listed in the modal
  const Edithighlight = new MHHighlights(page)
  const MHhighlightcount = await Edithighlight.highlightCount()
  expect(MHhighlightcount).toBe(4)

  // WHEN: Open color dropdown
  await Modal.toggleColorDropdown()

  // Assert pink color is checked
  expect(await Modal.checkboxChecked('pink')).toBeTruthy()
  // verify 4 highlight colors are checked
  expect(await Modal.colorCheckedCount()).toBe(4)
  // Assert purple color is disabled
  expect(await Modal.checkboxDisabled('purple')).toBeTruthy()

  // AND: Uncheck pink color
  await Modal.toggleCheckbox('pink')

  // THEN: Verify the pink highlight is removed from the Highlights frame
  const MHhighlightcount1 = await Edithighlight.highlightCount()
  expect(MHhighlightcount1).toBe(3)

  // Close & open color dropdown to verify pink color is unchecked
  // In realtime, the dropdown unchecks immediately but playwright is not updating
  // the checkbox status in the html unless its closed & reopened
  await Modal.toggleColorDropdown()
  await Modal.toggleColorDropdown()
  expect(await Modal.checkboxUnchecked('pink')).toBeTruthy()
  await Modal.toggleColorDropdown()

  // WHEN: Open chapter dropdown filter
  await Modal.toggleChapterDropdown()

  // Validate total number of chapters in the chapter dropdown is 22
  const chapterDropdownCount = await Modal.chapterDropdownCount()
  expect(chapterDropdownCount).toBe(22)

  // verify 2 chapters are checked
  expect(await Modal.chapterCheckedCount()).toBe(2)
  // Assert chapter 7 is checked
  expect(await Modal.checkboxChecked(7)).toBeTruthy()
  // Assert chapter 9 is disabled
  expect(await Modal.checkboxDisabled(9)).toBeTruthy()

  // AND: Uncheck chapter 7
  await Modal.toggleCheckbox(7)

  // THEN: Verify highlights from ch 7 is removed from the Highlights frame
  const MHhighlightcount2 = await Edithighlight.highlightCount()
  expect(MHhighlightcount2).toBe(1)

  // Close & open chapter dropdown to verify chapter 7 is unchecked
  // In realtime, the dropdown unchecks immediately but playwright is not updating
  // the checkbox status in the html unless its closed & reopened
  await Modal.toggleChapterDropdown()
  await Modal.toggleChapterDropdown()
  expect(await Modal.checkboxUnchecked(7)).toBeTruthy()
  expect(await Modal.chapterCheckedCount()).toBe(1)
  await Modal.toggleChapterDropdown()

  // Validate the color dropdown filters are unaffected by changes to chapter filters
  await Modal.toggleColorDropdown()
  expect(await Modal.checkboxChecked('green')).toBeTruthy()
  expect(await Modal.checkboxChecked('yellow')).toBeTruthy()
  expect(await Modal.colorCheckedCount()).toBe(3)
  await Modal.toggleColorDropdown()

  // Close the MH modal using X icon
  await Modal.closeMHModal()
  await expect(Modal.MHModal).toBeHidden()

  // The highlights in content page are unaffected
  const contentHighlightColor = await bookPage.contentHighlightColor(highlightId2)
  expect(contentHighlightColor).toBe('pink')

  const highlightcount = await bookPage.highlightCount()
  expect(highlightcount).toBe(2)
})


test('C543224 canonicals for books with no shared content', async ({ page, isMobile, browserName }) => {
  test.skip(isMobile as boolean, 'test only desktop resolution')
  test.skip(browserName == 'webkit', 'test only chrome')
  test.skip(browserName == 'firefox', 'test only chrome')

  // GIVEN: Open Rex page
  const bookPage = new ContentPage(page)
  const path = '/books/chemistry-2e/pages/1-1-chemistry-in-context'
  await bookPage.open(path)

  // THEN: Canonical page points to itself
  expect(await bookPage.canonical()).toBe('https://openstax.org/books/chemistry-2e/pages/1-1-chemistry-in-context')

  // WHEN: click EOC page
  const Toc = new TOC(page)
  await Toc.pageClick(9)
  // THEN: Canonical page points to itself
  expect(await bookPage.canonical()).toBe('https://openstax.org/books/chemistry-2e/pages/1-key-equations')

  // WHEN: Click EOB page
  await Toc.pageClick(221)
  // THEN: Canonical page points to itself
  expect(await bookPage.canonical()).toBe('https://openstax.org/books/chemistry-2e/pages/e-water-properties')

  // WHEN: click nested EOB page
  await Toc.pageClick(230)
  // THEN: Canonical page points to itself
  expect(await bookPage.canonical()).toBe('https://openstax.org/books/chemistry-2e/pages/chapter-1')
})


test('C543225 canonicals for pages derived from another book', async ({ page, isMobile, browserName }) => {
  test.skip(isMobile as boolean, 'test only desktop resolution')
  test.skip(browserName == 'webkit', 'test only chrome')
  test.skip(browserName == 'firefox', 'test only chrome')

  // GIVEN: Open Rex page derived from another book
  const bookPage = new ContentPage(page)
  const path = '/books/preparing-for-college-success/pages/2-1-why-college'
  await bookPage.open(path)

  // THEN: Canonical page points to original content
  expect(await bookPage.canonical()).toBe('https://openstax.org/books/college-success-concise/pages/1-1-why-college')

  // WHEN: click EOC page from a chapter derived from another book
  const Toc = new TOC(page)
  await Toc.pageClick(14)
  // THEN: Canonical page points to itself
  expect(await bookPage.canonical()).toBe('https://openstax.org/books/preparing-for-college-success/pages/2-summary')


  // WHEN: Open page unique to this book
  await Toc.pageClick(3)
  // THEN: Canonical page points to itself
  expect(await bookPage.canonical()).toBe('https://openstax.org/books/preparing-for-college-success/pages/1-2-your-academic-journey-and-personal-story')

  // WHEN: Open EOC page from the chapter unique to this book
  await Toc.pageClick(6)
  // THEN: Canonical page points to itself
  expect(await bookPage.canonical()).toBe('https://openstax.org/books/preparing-for-college-success/pages/1-family-friends-matter')
  
  // WHEN: Open EOB page from the chapter unique to this book
  await Toc.pageClick(71)
  // THEN: Canonical page points to itself
  expect(await bookPage.canonical()).toBe('https://openstax.org/books/preparing-for-college-success/pages/index')
})

test('C543225 canonicals for old editions point to the latest edition', async ({ page, isMobile, browserName }) => {
  test.skip(isMobile as boolean, 'test only desktop resolution')
  test.skip(browserName == 'webkit', 'test only chrome')
  test.skip(browserName == 'firefox', 'test only chrome')

  // GIVEN: Open older edition of Rex page derived from another book
  const bookPage = new ContentPage(page)
  const path = '/books/principles-macroeconomics-2e/pages/1-introduction'
  await bookPage.open(path)
  // THEN: Canonical page points to latest edition of the original content
  expect(await bookPage.canonical()).toBe('https://openstax.org/books/principles-economics-3e/pages/1-introduction')

  // WHEN: Open older edition of EOC page of a book derived from another book
  const Toc = new TOC(page)
  await Toc.pageClick(7)
  // THEN: Canonical page points to itself 
  expect(await bookPage.canonical()).toBe('https://openstax.org/books/principles-macroeconomics-2e/pages/1-key-concepts-and-summary')

  // WHEN: Open older edition of nested EOB page of a book derived from another book
  await Toc.pageClick(243)
  // THEN: Canonical page points to itself 
  expect(await bookPage.canonical()).toBe('https://openstax.org/books/principles-macroeconomics-2e/pages/chapter-2')


  // WHEN: Open older edition of appendix page of a book derived from another book
  await Toc.pageClick(241)
  // THEN: Canonical page points to latest edition of the original content
  expect(await bookPage.canonical()).toBe('https://openstax.org/books/principles-economics-3e/pages/d-the-expenditure-output-model')
})