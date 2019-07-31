/** @jest-environment puppeteer */
import {
  finishRender,
  navigate,
  setDesktopViewport,
  setMobileViewport
} from '../../../../../test/browserutils';

const TEST_PAGE_NAME = 'test-page-1';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}`;
const openMobileSearchWrapper = '[data-testid="mobile-toggle"]';
const selectSearchInput = '[data-testid="mobile-search-input"]';

const openAndTriggerSearchMobile = async() => {
  await page.waitForSelector(openMobileSearchWrapper);
  await page.click(selectSearchInput);
  await finishRender(page);

  await page.waitForSelector(selectSearchInput);
  await page.type(selectSearchInput, 'test\n' );
  await finishRender(page);
};

/*const triggerSearchDesktop = async() => {

};*/

describe('Search sidebar', () => {
  it('renders correctly on mobile', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);

    await openAndTriggerSearchMobile();

    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('renders correctly on desktop', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });
});
