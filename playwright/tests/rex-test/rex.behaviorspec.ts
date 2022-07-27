import { test, expect} from '@playwright/test';
import KsmodalPage from './Ksmodal.page';

test('open keyboard shortcut modal using keyboard @testrail id: C651124', async ({ page }) => {
  
  // GIVEN: Open Rex page and tab 3 times 
  await page.goto('/books/business-ethics/pages/preface');
  await page.locator('body').press('Tab');
  await page.locator('text=Skip to Content').press('Tab');
  await page.locator('text=Go to accessibility page').press('Tab');

  // WHEN: Press Enter to open the Keyboard Shortcuts modal
  await page.locator('text=Keyboard shortcuts menu').press('Enter');

  // THEN: The KS modal is open
  await expect(page).toHaveURL('https://staging.openstax.org/books/business-ethics/pages/preface?modal=KS');

  const ksModal = page.locator('data-testid=keyboard-shortcuts-popup-wrapper')
  await expect(ksModal).toBeVisible();

  // WHEN: Hit Esc key
  await ksModal.press('Escape');

  // THEN: The KS modal is closed
  await expect(page).toHaveURL('https://staging.openstax.org/books/business-ethics/pages/preface');
  await expect(ksModal).toBeHidden();
});  


test('open keyboard test @testrail id: C651123', async ({ page }) => {
  
  // GIVEN: Open Rex page
  const ksmodalPage = new KsmodalPage(page);
  await ksmodalPage.navigate();
  
  // AND: Open KS modal using Shift+? keys
  await page.keyboard.press('Shift+?');

  // THEN: The KS modal is open
  await expect(ksmodalPage.ksModal).toBeVisible();
  await expect(page).toHaveURL('https://staging.openstax.org/books/business-ethics/pages/preface?modal=KS');

  // WHEN: Close the KS modal using X icon
  await ksmodalPage.closeKsModal();

  // THEN: The KS modal is closed
  await expect(ksmodalPage.ksModal).toBeHidden();
  await expect(page).toHaveURL('https://staging.openstax.org/books/business-ethics/pages/preface');
});