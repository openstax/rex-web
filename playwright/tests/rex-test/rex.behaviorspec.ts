import { test, expect } from '@playwright/test';

test('open rex page', async ({ page }) => {
    await page.goto('https://staging.openstax.org/books/physics/pages/preface');
    expect(page.url()).toBe('https://staging.openstax.org/books/physics/pages/preface');
  });



test('open keyboard shortcut modal', async ({ page }) => {
  await page.goto('https://staging.openstax.org/books/business-ethics/pages/preface');
 
  // Press Tab
  await page.locator('body').press('Tab');

  // Press Tab
  await page.locator('text=Skip to Content').press('Tab');
  // Press Tab
  await page.locator('text=Go to accessibility page').press('Tab');

    // Press Enter
    await page.locator('text=Keyboard shortcuts menu').press('Enter');

  // await Promise.all([
  //   page.waitForNavigation(/*{ url: 'https://staging.openstax.org/books/business-ethics/pages/preface?modal=KS' }*/),
  // ]);

  await expect(page).toHaveURL('https://staging.openstax.org/books/business-ethics/pages/preface?modal=KS');
  
  // Click [data-testid="close-keyboard-shortcuts-popup"]
  await page.locator('[data-testid="close-keyboard-shortcuts-popup"]').click();
  await expect(page).toHaveURL('https://staging.openstax.org/books/business-ethics/pages/preface');
});  
