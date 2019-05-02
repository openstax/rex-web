/** @jest-environment puppeteer */
import { finishRender, navigate, setDesktopViewport, setMobileViewport } from '../../../test/browserutils';

const TEST_PAGE_NAME = 'test-page-1';
const TEST_PAGE_LONG_NUMBER = '23-12-rlc-series-ac-circuits';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}`;
const TEST_PAGE_LONG_NUMBER_URL = `/books/book-slug-1/pages/${TEST_PAGE_LONG_NUMBER}`;

describe('Sidebar', () => {
  it('renders correctly on mobile', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);
    await scrollDown();
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
    await scrollDown();
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('renders correctly expanded chapter on mobile with long numbers', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_PAGE_LONG_NUMBER_URL);
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('renders correctly expanded chapter on desktop with long numbers', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_LONG_NUMBER_URL);
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

const scrollDown = () => page.evaluate(() => {
  return window && document && document.documentElement && window.scrollBy(0, document.documentElement.scrollHeight);
});
