/**
 * Keyboard tab-order of the highlight create/edit cards: the controls are reached with Tab and
 * Shift+Tab (WCAG 2.1.1), and focus returns to the highlight when a card is dismissed.
 *
 * CI does not run this suite. See "TypeScript Playwright suite" in e2e_tests/README.md for how to
 * run it. Auth uses rexUserSignup(), which registers a throwaway restmail.net account.
 */
import { expect } from '@playwright/test'
import { Page } from 'playwright'
import test from '../../src/fixtures/base'
import { ContentPage, randomNum, rexUserSignup } from './helpers'

// The local dev server is HTTPS with a self-signed cert; no effect against valid-cert envs.
test.use({ ignoreHTTPSErrors: true })

const BOOK_PAGE = '/books/introduction-anthropology/pages/7-introduction'

// Matches the focusable controls the card's Tab trap considers.
const FOCUSABLE =
  "button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[href],[tabindex]:not([tabindex='-1'])"

// The active card wrapper for the focused highlight/selection (edit card or display note).
const ACTIVE_CARD = '[data-highlight-card][data-active="true"]'

// Snapshot of document.activeElement, for assertions and readable manual logs.
async function activeElementInfo(page: Page) {
  return page.evaluate(() => {
    const a = document.activeElement as HTMLElement | null
    if (!a) {
      return {
        tag: null as string | null,
        inCard: false,
        isScreenReaderSpan: false,
        highlightId: null,
        testId: null,
        text: '',
      }
    }
    return {
      tag: a.tagName,
      inCard: Boolean(a.closest('[data-highlight-card]')),
      isScreenReaderSpan: a.hasAttribute('data-for-screenreaders'),
      highlightId: a.getAttribute('data-highlight-id'),
      testId: a.getAttribute('data-testid'),
      text: (a.textContent || '').trim().slice(0, 50),
    }
  })
}

// Focus falling back to <body> is the exact failure mode this routing exists to prevent, and it
// silently satisfies "not in the card" / "not the create button" style assertions, so every step
// that expects focus to move asserts it landed on a real element.
function expectRealFocusedElement(info: { tag: string | null }, label: string) {
  expect(info.tag, `${label}: focus is on a real element`).toBeTruthy()
  expect(info.tag, `${label}: focus did not fall to <body>`).not.toBe('BODY')
}

// Create a green highlight through the real UI flow: select text -> the "create highlight"
// button appears -> activate it to open the form -> choose a color (which saves the highlight).
async function createGreenHighlight(page: Page, bookPage: ContentPage, paraNumber: number) {
  await bookPage.selectText(paraNumber)
  await page.waitForSelector(ACTIVE_CARD, { timeout: 15000 })
  await page.locator(`${ACTIVE_CARD} button`).first().click()
  await page.locator('[aria-label="Apply green highlight"]').first().click()
  await page.waitForSelector('.highlight', { timeout: 15000 })
}

// Same flow, then types a note and saves it, so the highlight shows the note display card.
async function createAnnotatedHighlight(page: Page, bookPage: ContentPage, paraNumber: number, note: string) {
  await createGreenHighlight(page, bookPage, paraNumber)
  await page.locator(`${ACTIVE_CARD} textarea`).fill(note)
  await page.locator(`${ACTIVE_CARD} [data-testid="save"]`).click()
  await page.waitForSelector(`${ACTIVE_CARD} [data-testid="dot-menu-toggle"]`, { timeout: 15000 })
}

// Reloads so the highlight starts passive, then focuses its screen-reader start span.
async function reloadAndFocusHighlight(page: Page) {
  await page.reload()
  await page.waitForSelector('.highlight', { timeout: 20000 })
  const highlightId = await page.evaluate(
    () => document.querySelector('.highlight')?.getAttribute('data-highlight-id') ?? null,
  )
  expect(highlightId, 'the saved highlight loaded').toBeTruthy()

  await focusHighlightStartSpan(page, highlightId as string)
  await page.waitForSelector(ACTIVE_CARD, { timeout: 15000 })
  expect((await activeElementInfo(page)).isScreenReaderSpan, 'focus starts on the highlight span').toBe(true)
  return highlightId as string
}

async function focusHighlightStartSpan(page: Page, highlightId: string) {
  await page.evaluate((id) => {
    const span = document.querySelector(
      `span[data-for-screenreaders][data-highlight-id="${id}"][tabindex="0"]`,
    ) as HTMLElement | null
    span?.focus()
  }, highlightId)
}

test('new selection: Tab reaches the create button, which creates via the keyboard', async ({ page, isMobile }) => {
  test.skip(isMobile as boolean, 'desktop only: the card control is hidden on mobile')
  test.setTimeout(150000)

  // GIVEN: an authenticated user on a book page
  const bookPage = new ContentPage(page)
  await bookPage.open(BOOK_PAGE)
  await rexUserSignup(page)
  await expect(page).toHaveURL(BOOK_PAGE)

  // WHEN: text is selected (a pending "create" card appears; focus stays in the content)
  const paraNumber = randomNum(await bookPage.paracount())
  await bookPage.selectText(paraNumber)
  await page.waitForSelector(ACTIVE_CARD, { timeout: 15000 })
  const afterSelect = await activeElementInfo(page)
  console.log('after select:', afterSelect)
  expect(afterSelect.inCard, 'after selecting, focus is still in the content').toBe(false)

  // THEN: Tab moves focus onto the "create highlight" button (standard focus model)
  await page.keyboard.press('Tab')
  const onCreate = await activeElementInfo(page)
  console.log('after Tab:', onCreate)
  expect(onCreate.inCard, 'Tab moves focus into the create card').toBe(true)
  expect(onCreate.tag, 'the create control is a native button').toBe('BUTTON')

  // AND: activating it with the keyboard opens the note form (color picker + textarea)
  await page.keyboard.press('Enter')
  const afterEnter = await activeElementInfo(page)
  console.log('after Enter:', afterEnter)
  expect(afterEnter.inCard, 'the opened form is in the card').toBe(true)
  expect(afterEnter.tag, 'the form focuses the note textarea').toBe('TEXTAREA')

  // AND: choosing a color creates the highlight
  await page.locator('[aria-label="Apply green highlight"]').first().click()
  await page.waitForSelector('.highlight', { timeout: 15000 })
  expect(await page.locator('.highlight').count(), 'a highlight was created').toBeGreaterThan(0)
})

test('new selection: Tab past the create button leaves cleanly and discards the selection', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile as boolean, 'desktop only: the card control is hidden on mobile')
  test.setTimeout(150000)

  // GIVEN: an authenticated user with a pending (unsaved) selection and the create button focused
  const bookPage = new ContentPage(page)
  await bookPage.open(BOOK_PAGE)
  await rexUserSignup(page)
  await expect(page).toHaveURL(BOOK_PAGE)

  const paraNumber = randomNum(await bookPage.paracount())
  await bookPage.selectText(paraNumber)
  // Hold the element: the relation is checked after the DOM may have changed, so an index lookup could miss.
  const paragraph = await bookPage.paragraph.nth(paraNumber).elementHandle()
  await page.waitForSelector(ACTIVE_CARD, { timeout: 15000 })
  await page.keyboard.press('Tab')
  const onCreate = await activeElementInfo(page)
  expect(onCreate.inCard, 'focus is on the create button').toBe(true)
  expect(onCreate.tag).toBe('BUTTON')

  // WHEN: Tab again (declining to create)  THEN: focus leaves the card cleanly and the unsaved
  // selection is discarded — no bounce to an earlier highlight and back to the selected text.
  await page.keyboard.press('Tab')
  const afterTab = await activeElementInfo(page)
  console.log('after Tab past create button:', afterTab)

  expectRealFocusedElement(afterTab, 'Tab past the create button')
  expect(afterTab.inCard, 'focus left the card').toBe(false)
  expect(afterTab.text, 'focus is no longer on the create button').not.toContain('create highlight')

  const selectionCollapsed = await page.evaluate(() => {
    const s = window.getSelection()
    return !s || s.isCollapsed
  })
  expect(selectionCollapsed, 'the unsaved selection was discarded').toBe(true)
  expect(await page.locator('.highlight').count(), 'no highlight was created').toBe(0)

  // Focus continued *forward* (at/after the selection), rather than bouncing to the page top.
  const relation = await page.evaluate((para) => {
    const a = document.activeElement as HTMLElement | null
    if (!para || !a || a === document.body) {
      return { resolved: false, bouncedBackward: false }
    }
    const DOCUMENT_POSITION_PRECEDING = 2
    return {
      // eslint-disable-next-line no-bitwise
      bouncedBackward: Boolean(para.compareDocumentPosition(a) & DOCUMENT_POSITION_PRECEDING),
      resolved: true,
    }
  }, paragraph)
  console.log('tab-past-create relation:', relation)
  // Asserted unconditionally: an unresolvable comparison (no paragraph, or focus on <body>) is
  // itself a failure, not a reason to skip the check.
  expect(relation.resolved, 'the selected paragraph and the focused element both resolved').toBe(true)
  expect(relation.bouncedBackward, 'focus did not bounce to an element before the selection').toBe(false)
})

test('new selection: Shift+Tab off the create button goes to previous content, not the toolbar', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile as boolean, 'desktop only: the card control is hidden on mobile')
  test.setTimeout(150000)

  const bookPage = new ContentPage(page)
  await bookPage.open(BOOK_PAGE)
  await rexUserSignup(page)
  await expect(page).toHaveURL(BOOK_PAGE)

  // Select a paragraph in the latter half of the page so real content precedes the selection.
  const paraCount = await bookPage.paracount()
  const paraNumber = Math.max(1, paraCount - 1)
  await bookPage.selectText(paraNumber)
  // Hold the element: the relation is checked after the DOM may have changed, so an index lookup could miss.
  const paragraph = await bookPage.paragraph.nth(paraNumber).elementHandle()
  await page.waitForSelector(ACTIVE_CARD, { timeout: 15000 })
  await page.keyboard.press('Tab')
  expect((await activeElementInfo(page)).tag, 'focus is on the create button').toBe('BUTTON')

  // WHEN: Shift+Tab  THEN: focus goes to the previous tab stop before the selection (in the
  // content), NOT backward past the whole card layer into the toolbar; the selection is discarded.
  await page.keyboard.press('Shift+Tab')
  const afterShiftTab = await activeElementInfo(page)
  console.log('after Shift+Tab off create button:', afterShiftTab)

  expect(afterShiftTab.inCard, 'focus left the card').toBe(false)
  expect(afterShiftTab.text, 'focus is no longer on the create button').not.toContain('create highlight')
  const selectionCollapsed = await page.evaluate(() => {
    const s = window.getSelection()
    return !s || s.isCollapsed
  })
  expect(selectionCollapsed, 'the unsaved selection was discarded').toBe(true)

  const relation = await page.evaluate((para) => {
    const a = document.activeElement as HTMLElement | null
    if (!para || !a || a === document.body) {
      return { resolved: false, precedes: false, inMainContent: false }
    }
    const DOCUMENT_POSITION_PRECEDING = 2
    return {
      resolved: true,
      // eslint-disable-next-line no-bitwise
      precedes: Boolean(para.compareDocumentPosition(a) & DOCUMENT_POSITION_PRECEDING),
      inMainContent: Boolean(a.closest('#main-content')),
    }
  }, paragraph)
  console.log('shift-tab target relation:', relation)
  // Asserted unconditionally: an unresolvable comparison (no paragraph, or focus on <body>)
  // contradicts the requirement rather than excusing the check.
  expect(relation.resolved, 'the selected paragraph and the focused element both resolved').toBe(true)
  expect(relation.precedes, 'focus moved backward, to before the selection').toBe(true)
  expect(relation.inMainContent, 'focus stayed in the content, not the toolbar/card layer').toBe(true)
})

test('new selection: Shift+Tab directly from the selection goes to previous content', async ({ page, isMobile }) => {
  test.skip(isMobile as boolean, 'desktop only: the card control is hidden on mobile')
  test.setTimeout(150000)

  const bookPage = new ContentPage(page)
  await bookPage.open(BOOK_PAGE)
  await rexUserSignup(page)
  await expect(page).toHaveURL(BOOK_PAGE)

  // Select a paragraph in the latter half of the page so real content precedes the selection.
  const paraCount = await bookPage.paracount()
  const paraNumber = Math.max(1, paraCount - 1)
  await bookPage.selectText(paraNumber)
  // Hold the element: the relation is checked after the DOM may have changed, so an index lookup could miss.
  const paragraph = await bookPage.paragraph.nth(paraNumber).elementHandle()
  await page.waitForSelector(ACTIVE_CARD, { timeout: 15000 })
  expect((await activeElementInfo(page)).inCard, 'focus is in the content at the selection').toBe(false)

  // WHEN: Shift+Tab straight from the selection (without first tabbing to the button)
  // THEN: focus goes backward to previous content — not forward into the card (Chromium) and not
  // via <body> (Firefox) — and the unsaved selection is discarded.
  await page.keyboard.press('Shift+Tab')
  const afterShiftTab = await activeElementInfo(page)
  console.log('select -> Shift+Tab:', afterShiftTab)

  expect(afterShiftTab.inCard, 'did not jump forward into the card').toBe(false)
  expect(afterShiftTab.tag, 'did not detour through <body>').not.toBe('BODY')
  expect(afterShiftTab.text, 'focus is not the create button').not.toContain('create highlight')
  const selectionCollapsed = await page.evaluate(() => {
    const s = window.getSelection()
    return !s || s.isCollapsed
  })
  expect(selectionCollapsed, 'the unsaved selection was discarded').toBe(true)

  const relation = await page.evaluate((para) => {
    const a = document.activeElement as HTMLElement | null
    if (!para || !a || a === document.body) {
      return { resolved: false, precedes: false, inMainContent: false }
    }
    const DOCUMENT_POSITION_PRECEDING = 2
    return {
      resolved: true,
      // eslint-disable-next-line no-bitwise
      precedes: Boolean(para.compareDocumentPosition(a) & DOCUMENT_POSITION_PRECEDING),
      inMainContent: Boolean(a.closest('#main-content')),
    }
  }, paragraph)
  console.log('select -> Shift+Tab relation:', relation)
  // Asserted unconditionally: an unresolvable comparison (no paragraph, or focus on <body>)
  // contradicts the requirement rather than excusing the check.
  expect(relation.resolved, 'the selected paragraph and the focused element both resolved').toBe(true)
  expect(relation.precedes, 'focus moved backward, to before the selection').toBe(true)
  expect(relation.inMainContent, 'focus stayed in the content, not the toolbar/card layer').toBe(true)
})

test('existing highlight: edit control is reachable via Tab / Shift+Tab', async ({ page, isMobile }) => {
  test.skip(isMobile as boolean, 'desktop only: the card control is hidden on mobile')
  test.setTimeout(150000)

  // GIVEN: an authenticated user with one saved highlight, on a freshly loaded page
  const bookPage = new ContentPage(page)
  await bookPage.open(BOOK_PAGE)
  await rexUserSignup(page)
  await expect(page).toHaveURL(BOOK_PAGE)
  await createGreenHighlight(page, bookPage, randomNum(await bookPage.paracount()))

  // Reload so the highlight starts in its passive (non-editing) state
  await page.reload()
  await page.waitForSelector('.highlight', { timeout: 20000 })
  const highlightId = await page.evaluate(
    () => document.querySelector('.highlight')?.getAttribute('data-highlight-id') ?? null,
  )
  expect(highlightId, 'the saved highlight loaded').toBeTruthy()

  // AND: focus is on the highlight (its injected screen-reader start span)
  await focusHighlightStartSpan(page, highlightId as string)
  await page.waitForSelector(ACTIVE_CARD, { timeout: 15000 })
  expect((await activeElementInfo(page)).isScreenReaderSpan, 'focus starts on the highlight span').toBe(true)

  // WHEN: Tab  THEN: focus moves INTO the card, onto a real button control
  await page.keyboard.press('Tab')
  const onControl = await activeElementInfo(page)
  console.log('after Tab (into card):', onControl)
  expect(onControl.inCard, 'Tab moves focus into the card').toBe(true)
  expect(onControl.tag, 'the card control is a native button').toBe('BUTTON')

  // WHEN: Shift+Tab  THEN: focus returns to the same highlight span
  await page.keyboard.press('Shift+Tab')
  const backOnHighlight = await activeElementInfo(page)
  console.log('after Shift+Tab (back to highlight):', backOnHighlight)
  expect(backOnHighlight.isScreenReaderSpan, 'Shift+Tab returns to the highlight').toBe(true)
  expect(backOnHighlight.highlightId, 'returns to the same highlight').toBe(highlightId)

  // WHEN: Tab into the card, then Tab again  THEN: focus leaves the card to the following content
  await page.keyboard.press('Tab')
  expect((await activeElementInfo(page)).inCard, 'Tab is back in the card').toBe(true)
  await page.keyboard.press('Tab')
  const afterCard = await activeElementInfo(page)
  console.log('after Tab (out of card to content):', afterCard)
  expect(afterCard.inCard, 'Tab past the last control leaves the card').toBe(false)
  expect(afterCard.tag, 'focus lands on a real content element, not <body>').not.toBe('BODY')

  // AND: Shift+Tab from the highlight span goes to the previous content, not back to the edit
  // button (which sits before the content in the DOM).
  await focusHighlightStartSpan(page, highlightId as string)
  await page.waitForSelector(ACTIVE_CARD, { timeout: 15000 })
  expect((await activeElementInfo(page)).isScreenReaderSpan, 'focus is back on the highlight span').toBe(true)
  await page.keyboard.press('Shift+Tab')
  const beforeHighlight = await activeElementInfo(page)
  console.log('after Shift+Tab from span (break out):', beforeHighlight)
  expect(beforeHighlight.inCard, 'Shift+Tab from the span leaves the card layer').toBe(false)
  expect(beforeHighlight.text, 'focus is not the edit button').not.toContain('edit highlight')
  expect(beforeHighlight.tag, 'focus landed on a real element, not <body>').not.toBe('BODY')
  const precedesHighlight = await page.evaluate((id) => {
    const mark = document.querySelector(`[data-highlight-id="${id}"]`)
    const a = document.activeElement as HTMLElement | null
    if (!mark || !a || a === document.body) {
      return false
    }
    const DOCUMENT_POSITION_PRECEDING = 2
    // eslint-disable-next-line no-bitwise
    return Boolean(mark.compareDocumentPosition(a) & DOCUMENT_POSITION_PRECEDING)
  }, highlightId)
  expect(precedesHighlight, 'focus moved backward, before the highlight').toBe(true)
})

test('existing highlight: after Escape hides the card, Tab continues to the next content', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile as boolean, 'desktop only: the card control is hidden on mobile')
  test.setTimeout(150000)

  // GIVEN: an authenticated user with one saved highlight, focused on its screen-reader span
  const bookPage = new ContentPage(page)
  await bookPage.open(BOOK_PAGE)
  await rexUserSignup(page)
  await expect(page).toHaveURL(BOOK_PAGE)
  await createGreenHighlight(page, bookPage, randomNum(await bookPage.paracount()))

  await page.reload()
  await page.waitForSelector('.highlight', { timeout: 20000 })
  const highlightId = await page.evaluate(
    () => document.querySelector('.highlight')?.getAttribute('data-highlight-id') ?? null,
  )
  expect(highlightId, 'the saved highlight loaded').toBeTruthy()

  await focusHighlightStartSpan(page, highlightId as string)
  await page.waitForSelector(ACTIVE_CARD, { timeout: 15000 })
  expect((await activeElementInfo(page)).isScreenReaderSpan, 'focus starts on the highlight span').toBe(true)

  // WHEN: Escape hides the card (focus stays on the highlight); then Tab
  await page.keyboard.press('Escape')
  const afterEscape = await activeElementInfo(page)
  console.log('after Escape:', afterEscape)
  expect(afterEscape.isScreenReaderSpan, 'Escape keeps focus on the highlight span').toBe(true)

  // THEN: Tab moves forward to the following content instead of trying to focus into the
  // hidden card.
  await page.keyboard.press('Tab')
  const afterTab = await activeElementInfo(page)
  console.log('after Escape -> Tab:', afterTab)
  expect(afterTab.inCard, 'focus did not go into the hidden card').toBe(false)
  expect(afterTab.isScreenReaderSpan, 'focus advanced off the highlight span').toBe(false)
  expect(afterTab.tag, 'focus landed on a real content element, not <body>').not.toBe('BODY')

  const followsHighlight = await page.evaluate((id) => {
    const mark = document.querySelector(`[data-highlight-id="${id}"]`)
    const a = document.activeElement as HTMLElement | null
    if (!mark || !a || a === document.body) {
      return false
    }
    const DOCUMENT_POSITION_FOLLOWING = 4
    // eslint-disable-next-line no-bitwise
    return Boolean(mark.compareDocumentPosition(a) & DOCUMENT_POSITION_FOLLOWING)
  }, highlightId)
  expect(followsHighlight, 'focus moved forward, after the highlight').toBe(true)
})

test('existing highlight: the open note form traps Tab, and Escape returns focus to the highlight', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile as boolean, 'desktop only: the card control is hidden on mobile')
  test.setTimeout(150000)

  // GIVEN: an authenticated user with one saved highlight, focused on its screen-reader span
  const bookPage = new ContentPage(page)
  await bookPage.open(BOOK_PAGE)
  await rexUserSignup(page)
  await expect(page).toHaveURL(BOOK_PAGE)
  await createGreenHighlight(page, bookPage, randomNum(await bookPage.paracount()))

  await page.reload()
  await page.waitForSelector('.highlight', { timeout: 20000 })
  const highlightId = await page.evaluate(
    () => document.querySelector('.highlight')?.getAttribute('data-highlight-id') ?? null,
  )
  expect(highlightId, 'the saved highlight loaded').toBeTruthy()

  await focusHighlightStartSpan(page, highlightId as string)
  await page.waitForSelector(ACTIVE_CARD, { timeout: 15000 })
  expect((await activeElementInfo(page)).isScreenReaderSpan, 'focus starts on the highlight span').toBe(true)

  // WHEN: Enter opens the note entry field, which takes focus
  await page.keyboard.press('Enter')
  await page.waitForSelector(`${ACTIVE_CARD} textarea`, { timeout: 15000 })
  const inNote = await activeElementInfo(page)
  console.log('after Enter (note field):', inNote)
  expect(inNote.inCard, 'Enter moved focus into the card').toBe(true)
  expect(inNote.tag, 'the note entry field is a textarea').toBe('TEXTAREA')

  // AND: the open form traps Tab. The cycle length depends on the browser's tab stops (the colour
  // radios form one stop, and the fieldset hands focus to the selected radio), so press Tab until
  // focus returns to the textarea, bounded by the number of focusable controls in the card.
  const stopCount = await page.locator(`${ACTIVE_CARD} ${FOCUSABLE}`).count()
  const visited: Array<string | null> = []
  for (let i = 0; i < stopCount; i++) {
    await page.keyboard.press('Tab')
    const info = await activeElementInfo(page)
    console.log(`after Tab #${i + 1} (trapped form):`, info)
    expect(info.inCard, `Tab #${i + 1} stays within the trapped form`).toBe(true)
    visited.push(info.tag)
    if (info.tag === 'TEXTAREA') {
      break
    }
  }
  expect(visited[visited.length - 1], `the cycle returns to the note textarea within ${stopCount} Tabs`).toBe(
    'TEXTAREA',
  )
  expect(visited.length, 'Tab visits other controls before returning').toBeGreaterThan(1)

  // WHEN: Escape closes the (empty) note field
  // THEN: focus returns to the highlight span rather than falling to <body>
  await page.keyboard.press('Escape')
  const afterEscape = await activeElementInfo(page)
  console.log('after Escape (from textarea):', afterEscape)
  expect(afterEscape.tag, 'Escape did not drop focus to <body>').not.toBe('BODY')
  expect(afterEscape.isScreenReaderSpan, 'Escape returns focus to the highlight span').toBe(true)
  expect(afterEscape.highlightId, 'focus is on the same highlight').toBe(highlightId)

  // AND: Shift+Tab now routes to the previous content and closes the card
  await page.keyboard.press('Shift+Tab')
  const afterShiftTab = await activeElementInfo(page)
  console.log('after Escape -> Shift+Tab:', afterShiftTab)
  expect(afterShiftTab.inCard, 'Shift+Tab left the card layer').toBe(false)
  expect(afterShiftTab.tag, 'focus landed on a real content element, not <body>').not.toBe('BODY')
  expect(await page.locator(ACTIVE_CARD).count(), 'the active card closed').toBe(0)

  const precedesHighlight = await page.evaluate((id) => {
    const mark = document.querySelector(`[data-highlight-id="${id}"]`)
    const a = document.activeElement as HTMLElement | null
    if (!mark || !a || a === document.body) {
      return false
    }
    const DOCUMENT_POSITION_PRECEDING = 2
    // eslint-disable-next-line no-bitwise
    return Boolean(mark.compareDocumentPosition(a) & DOCUMENT_POSITION_PRECEDING)
  }, highlightId)
  expect(precedesHighlight, 'focus moved backward, before the highlight').toBe(true)
})

test('annotated highlight: the note card menu button is reachable via Tab / Shift+Tab', async ({ page, isMobile }) => {
  test.skip(isMobile as boolean, 'desktop only: the card control is hidden on mobile')
  test.setTimeout(150000)

  // GIVEN: an authenticated user with a saved highlight that has a note
  const bookPage = new ContentPage(page)
  await bookPage.open(BOOK_PAGE)
  await rexUserSignup(page)
  await expect(page).toHaveURL(BOOK_PAGE)
  await createAnnotatedHighlight(page, bookPage, randomNum(await bookPage.paracount()), 'tab order note')
  const highlightId = await reloadAndFocusHighlight(page)

  // WHEN: Tab  THEN: focus moves into the note card, onto its menu button (not an edit button)
  await page.keyboard.press('Tab')
  const onMenu = await activeElementInfo(page)
  console.log('after Tab (note card):', onMenu)
  expect(onMenu.inCard, 'Tab moves focus into the card').toBe(true)
  expect(onMenu.testId, 'the first control is the menu button').toBe('dot-menu-toggle')

  // WHEN: Shift+Tab  THEN: focus returns to the same highlight span
  await page.keyboard.press('Shift+Tab')
  const backOnHighlight = await activeElementInfo(page)
  expect(backOnHighlight.isScreenReaderSpan, 'Shift+Tab returns to the highlight').toBe(true)
  expect(backOnHighlight.highlightId, 'returns to the same highlight').toBe(highlightId)

  // WHEN: Tab into the card, then Tab again  THEN: focus leaves the card to the following content
  await page.keyboard.press('Tab')
  expect((await activeElementInfo(page)).inCard, 'Tab is back in the card').toBe(true)
  await page.keyboard.press('Tab')
  const afterCard = await activeElementInfo(page)
  console.log('after Tab (out of note card):', afterCard)
  expect(afterCard.inCard, 'Tab past the last control leaves the card').toBe(false)
  expect(afterCard.tag, 'focus lands on a real content element, not <body>').not.toBe('BODY')
})

test('annotated highlight: Escape in the emptied note form closes it and returns focus to the highlight', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile as boolean, 'desktop only: the card control is hidden on mobile')
  test.setTimeout(150000)

  // GIVEN: an authenticated user with a saved highlight that has a note, focused on its span
  const note = 'tab order note'
  const bookPage = new ContentPage(page)
  await bookPage.open(BOOK_PAGE)
  await rexUserSignup(page)
  await expect(page).toHaveURL(BOOK_PAGE)
  await createAnnotatedHighlight(page, bookPage, randomNum(await bookPage.paracount()), note)
  const highlightId = await reloadAndFocusHighlight(page)

  // WHEN: the menu is opened and Edit is chosen with the keyboard
  await page.keyboard.press('Tab')
  expect((await activeElementInfo(page)).testId, 'Tab reaches the menu button').toBe('dot-menu-toggle')
  await page.keyboard.press('Enter')
  const onEdit = await activeElementInfo(page)
  console.log('after Enter (menu open):', onEdit)
  expect(onEdit.inCard, 'the open menu takes focus in the card').toBe(true)
  expect(onEdit.text, 'focus is on the Edit item').toBe('Edit')
  await page.keyboard.press('Enter')

  // THEN: the note form opens with the saved note
  const textarea = page.locator(`${ACTIVE_CARD} textarea`)
  await expect(textarea).toHaveValue(note)

  // WHEN: the note is emptied and Escape is pressed. Activating Edit currently leaves focus on
  // <body>, so fill() is what puts focus in the field.
  await textarea.fill('')
  await page.keyboard.press('Escape')

  // THEN: focus returns to the highlight, and the form is closed rather than left open
  const afterEscape = await activeElementInfo(page)
  console.log('after Escape (emptied note):', afterEscape)
  expect(afterEscape.isScreenReaderSpan, 'Escape returns focus to the highlight span').toBe(true)
  expect(afterEscape.highlightId, 'focus is on the same highlight').toBe(highlightId)
  expect(await page.locator('[data-highlight-card] textarea').count(), 'the note form closed').toBe(0)

  // AND: Tab goes to the collapsed note card's menu button, not back into a note form
  await page.keyboard.press('Tab')
  const afterTab = await activeElementInfo(page)
  console.log('after Escape -> Tab:', afterTab)
  expect(afterTab.testId, 'Tab reaches the note card menu button').toBe('dot-menu-toggle')
  expect(await page.locator('[data-highlight-card] textarea').count(), 'no note form is open').toBe(0)
})
