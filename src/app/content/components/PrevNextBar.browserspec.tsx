/** @jest-environment puppeteer */
import { finishRender, navigate, setDesktopViewport, setMobileViewport } from '../../../test/browserutils';

const TEST_PAGE_NAME = 'test-page-1';
const TEST_NEXT_PAGE_LINK = '1-test-page-2';
const NEXT_PAGE_ARIA_LABEL = 'Next Page';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}`;

describe('PrevNextBar', () => {
  it('renders correctly next element in mobile', async() => {
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

  it('renders correctly next element on desktop', async() => {
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

  it('renders correctly prev and next elements on desktop', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);
    await scrollDown();
    expect(await clickNextLink(TEST_NEXT_PAGE_LINK, NEXT_PAGE_ARIA_LABEL)).toBe(true);
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

// tslint:disable-next-line:no-shadowed-variable
const clickNextLink = (href: string, elementToClick: string) => page.evaluate(async(href, elementToClick) => {
  const link = document && document.querySelector(`[aria-label="${elementToClick}"] [href="${href}"]`);

  if (!link || !document || !window) {
    return false;
  }

  const event = document.createEvent('MouseEvent');
  event.initEvent('click', true, true);

  link.dispatchEvent(event);

  await window.__APP_ASYNC_HOOKS.calm();

  return true;
}, href);
