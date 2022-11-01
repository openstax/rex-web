import { test, expect } from '@playwright/test'
import { ContentPage, KsModal, rexUserSignup, rexUserSignout, sleep } from './helpers'

test('S487 C651124 open keyboard shortcut modal using keyboard', async ({ browserName, page }) => {
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

test('S487 C651123 open keyboard shortcut modal using hot keys', async ({ page }) => {
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
  // await expect(page).toHaveURL('/books/introduction-intellectual-property/pages/1-5-what-the-u-s-patent-system-wrought')

  // WHEN: Highlight some text
  await BookPage.highlightText('green')

  // THEN: Text is highlighted
  let highlightcount = await BookPage.highlightCount()
  expect(highlightcount).toBe(1)

  // AND: Highlighted color in the content page is green
  const highlight_id = await BookPage.highlight_id()
  const highlightColor = await BookPage.contentHighlightColor(highlight_id)
  expect(highlightColor).toBe('green')

  // WHEN: Log out the user
  await rexUserSignout(page)
  await expect(page.locator('[data-testid="nav-login"]')).toContainText('Log in')

  // THEN: The highlight is removed from the page
  highlightcount = await BookPage.highlightCount()
  expect(highlightcount).toBe(0)
})


test('paragraphs', async ({ page, isMobile }) => {
  test.skip(isMobile as boolean, 'test only desktop resolution')

  // GIVEN: Open Rex page
  const BookPage = new ContentPage(page)
  const path = '/books/introduction-intellectual-property/pages/1-5-what-the-u-s-patent-system-wrought'
  await BookPage.open(path)

  // AND: Signup as a new user
  // await rexUserSignup(page)
  // await expect(page).toHaveURL('/books/introduction-intellectual-property/pages/1-5-what-the-u-s-patent-system-wrought')
  sleep(5)
  // WHEN: Highlight some text
  let count = await BookPage.paragraphs()
  // console.log(count)
  expect(count).toBe(1)
})
