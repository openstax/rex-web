import { test, expect} from '@playwright/test';
import KsmodalPage from '../../src/fixtures/Ksmodal.page';
import BasePage from '../../src/fixtures/Base.page';

test('open keyboard shortcut modal using keyboard @testrail id: C651124', async ({ browserName, page }) => {
  
  // GIVEN: Open Rex page
  const BookPage = new BasePage(page);
  const path = '/books/business-ethics/pages/preface';
  await BookPage.open(path);
 
  // AND: Tab 3 times and hit Enter
  if (browserName === "webkit"){
  await page.keyboard.press('Alt+Tab');
  await page.keyboard.press('Alt+Tab');
  await page.keyboard.press('Alt+Tab');
  await page.keyboard.press('Alt+Enter')
  }
  else { 
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  }

  // THEN: The KS modal is open
  await expect(page).toHaveURL('/books/business-ethics/pages/preface?modal=KS');

  const ksModal = page.locator('data-testid=keyboard-shortcuts-popup-wrapper')
  await expect(ksModal).toBeVisible();

  // WHEN: Hit Esc key
  await ksModal.press('Escape');

  // THEN: The KS modal is closed
  await expect(page).toHaveURL('/books/business-ethics/pages/preface');
  await expect(ksModal).toBeHidden();
});  


test('open keyboard test @testrail id: C651123', async ({ page }) => {
  
  // GIVEN: Open Rex page
  const ksmodalPage = new KsmodalPage(page);
  const path = '/books/organizational-behavior/pages/preface';
  await ksmodalPage.open(path);
  
  // AND: Open KS modal using Shift+? keys
  await page.keyboard.press('Shift+?');

  // THEN: The KS modal is open
  await expect(ksmodalPage.ksModal).toBeVisible();
  await expect(page).toHaveURL('/books/organizational-behavior/pages/preface?modal=KS');

  // WHEN: Close the KS modal using X icon
  await ksmodalPage.closeKsModal();

  // THEN: The KS modal is closed
  await expect(ksmodalPage.ksModal).toBeHidden();
  await expect(page).toHaveURL('/books/organizational-behavior/pages/preface');
});

