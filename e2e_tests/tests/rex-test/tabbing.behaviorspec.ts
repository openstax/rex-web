/**
 * CORE-1485 — Highlight create/edit control keyboard tab-order.
 *
 * Verifies, in a live browser, that the highlight edit/create control participates in the
 * standard keyboard focus model (WCAG 2.1.1) — the control is reached with Tab/Shift+Tab,
 * not with a non-standard focus key:
 *
 *   New selection (create):
 *     text selection          --Tab-->        the "create highlight" button
 *     the create button       --Enter-->      the note form (keyboard activation) -> pick color -> created
 *
 *   Existing highlight (edit):
 *     highlight span          --Tab-->        the "edit highlight" button
 *     the edit button         --Shift+Tab-->  back to the highlight span
 *     the edit button         --Tab-->        the following content control (focus leaves the card)
 *
 * WHERE TO RUN — these assertions describe the FIXED behavior on this branch. staging.openstax.org
 * does NOT have the fix, so the default run fails the "Tab moves into the card" step (that is the
 * bug). Point the run at an environment built from this branch:
 *
 *   # Local dev server from this branch (HTTPS/self-signed; proxies accounts+highlights to
 *   # dev.openstax.org, so signup + highlighting work with no extra setup):
 *   #   ../start-dev.sh                       # boots this branch on :3001 (slow first boot)
 *   #   npx playwright install chromium       # once, if not already present
 *   cd e2e_tests && URL=https://localhost:3001 \
 *     npx playwright test tests/rex-test/tabbing.behaviorspec.ts --project="Desktop Chrome"
 *
 *   # Or a Heroku review app for this PR:
 *   cd e2e_tests && URL=https://rex-web-<review-app>.herokuapp.com \
 *     npx playwright test tests/rex-test/tabbing.behaviorspec.ts --project="Desktop Chrome"
 *
 * Auth uses rexUserSignup(), which registers a throwaway restmail.net account, so the target
 * env needs accounts + highlights (every full REX environment qualifies).
 */
import { expect } from '@playwright/test'
import { Page } from 'playwright'
import test from '../../src/fixtures/base'
import { ContentPage, randomNum, rexUserSignup } from './helpers'

// The local dev server is HTTPS with a self-signed cert; no effect against valid-cert envs.
test.use({ ignoreHTTPSErrors: true })

const BOOK_PAGE = '/books/introduction-anthropology/pages/7-introduction'

// The active card wrapper for the focused highlight/selection (edit card or display note).
const ACTIVE_CARD = '[data-highlight-card][data-active="true"]'

// Snapshot of document.activeElement, for assertions and readable manual logs.
async function activeElementInfo(page: Page) {
  return page.evaluate(() => {
    const a = document.activeElement as HTMLElement | null
    if (!a) {
      return { tag: null as string | null, inCard: false, isScreenReaderSpan: false, highlightId: null, text: '' }
    }
    return {
      tag: a.tagName,
      inCard: Boolean(a.closest('[data-highlight-card]')),
      isScreenReaderSpan: a.hasAttribute('data-for-screenreaders'),
      highlightId: a.getAttribute('data-highlight-id'),
      text: (a.textContent || '').trim().slice(0, 50),
    }
  })
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

async function focusHighlightStartSpan(page: Page, highlightId: string) {
  await page.evaluate((id) => {
    const span = document.querySelector(
      `span[data-for-screenreaders][data-highlight-id="${id}"][tabindex="0"]`,
    ) as HTMLElement | null
    span?.focus()
  }, highlightId)
}

test('CORE-1485 new selection: Tab reaches the create button, which creates via the keyboard', async ({
  page,
  isMobile,
}) => {
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

test('CORE-1485 new selection: Tab past the create button leaves cleanly and discards the selection', async ({
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

  expect(afterTab.inCard, 'focus left the card').toBe(false)
  expect(afterTab.text, 'focus is no longer on the create button').not.toContain('create highlight')

  const selectionCollapsed = await page.evaluate(() => {
    const s = window.getSelection()
    return !s || s.isCollapsed
  })
  expect(selectionCollapsed, 'the unsaved selection was discarded').toBe(true)
  expect(await page.locator('.highlight').count(), 'no highlight was created').toBe(0)

  // Focus continued *forward* (at/after the selection), rather than bouncing to the page top.
  const bouncedBackward = await page.evaluate((n) => {
    const para = document.querySelectorAll('p[id*=para]')[n]
    const a = document.activeElement as HTMLElement | null
    if (!para || !a || a === document.body) {
      return false
    }
    const DOCUMENT_POSITION_PRECEDING = 2
    // eslint-disable-next-line no-bitwise
    return Boolean(para.compareDocumentPosition(a) & DOCUMENT_POSITION_PRECEDING)
  }, paraNumber)
  expect(bouncedBackward, 'focus did not bounce to an element before the selection').toBe(false)
})

test('CORE-1485 new selection: Shift+Tab off the create button goes to previous content, not the toolbar', async ({
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

  const relation = await page.evaluate((n) => {
    const para = document.querySelectorAll('p[id*=para]')[n]
    const a = document.activeElement as HTMLElement | null
    if (!para || !a || a === document.body) {
      return { checked: false, precedes: false, inMainContent: false }
    }
    const DOCUMENT_POSITION_PRECEDING = 2
    return {
      checked: true,
      // eslint-disable-next-line no-bitwise
      precedes: Boolean(para.compareDocumentPosition(a) & DOCUMENT_POSITION_PRECEDING),
      inMainContent: Boolean(a.closest('#main-content')),
    }
  }, paraNumber)
  console.log('shift-tab target relation:', relation)
  if (relation.checked) {
    expect(relation.precedes, 'focus moved backward, to before the selection').toBe(true)
    expect(relation.inMainContent, 'focus stayed in the content, not the toolbar/card layer').toBe(true)
  }
})

test('CORE-1485 existing highlight: edit control is reachable via Tab / Shift+Tab', async ({ page, isMobile }) => {
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
})
