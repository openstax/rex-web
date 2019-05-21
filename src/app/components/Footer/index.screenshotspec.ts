/** @jest-environment puppeteer */
import {
  finishRender,
  navigate,
  scrollDown,
  setDesktopViewport,
  setMobileViewport,
  setTallerDesktopViewport,
} from '../../../test/browserutils';

const TEST_PAGE_NAME = 'test-page-1';
const TEST_SIMPLE_PAGE = '1-test-page-4';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}`;
const TEST_SIMPLE_PAGE_URL = `/books/book-slug-1/pages/${TEST_SIMPLE_PAGE}`;

describe('content', () => {

  it('renders correctly next element on desktop without scroll', async() => {
    setTallerDesktopViewport(page);
    await navigate(page, TEST_SIMPLE_PAGE_URL);
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('renders correctly next element on mobile with scroll', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);
    await scrollDown(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });

  });

  it('renders correctly next element on desktop with scroll', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);
    await scrollDown(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

});
