/** @jest-environment puppeteer */
import {
  finishRender,
  fullPageScreenshot,
  navigate,
  setDesktopViewport,
  setMobileViewport
} from '../../test/browserutils';

const TEST_PAGE_NAME = 'test-page-1';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}`;
const TEST_SIMPLE_PAGE_URL = `/books/book-slug-1/pages/1-test-page-4`;

function addTests() {
  it('looks right', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_URL);
    const screen = await fullPageScreenshot(page);
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('short pages looks right', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_SIMPLE_PAGE_URL);
    const screen = await fullPageScreenshot(page);
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('looks right on mobile', async() => {
    setMobileViewport(page);
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
}

describe('content', () => {

  it('attribution looks right', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_SIMPLE_PAGE_URL);
    await page.click('details');
    const screen = await fullPageScreenshot(page);

    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  addTests();

  describe('Print mode', () => {
    beforeEach(async() => {
      await page.emulateMedia('print');
    });

    afterEach(async() => {
      await page.emulateMedia(null);
    });

    addTests();
  });
});
