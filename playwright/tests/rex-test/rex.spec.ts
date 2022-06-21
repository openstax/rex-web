import { test, expect } from '@playwright/test';

test('open rex page', async ({ page }) => {
    await page.goto('https://staging.openstax.org/books/physics/pages/preface');
    expect(page.url()).toBe('https://staging.openstax.org/books/physics/pages/preface');
  });