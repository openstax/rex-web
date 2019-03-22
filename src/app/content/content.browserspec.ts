/** @jest-environment puppeteer */
import { checkLighthouse, finishRender, fullPageScreenshot, h1Content, navigate } from '../../test/browserutils';

const TEST_PAGE_NAME = 'test-page-1';
const TEST_LONG_PAGE_NAME = '1-test-page-3';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}`;
const TEST_LONG_PAGE_URL = `/books/book-slug-1/pages/${TEST_LONG_PAGE_NAME}`;
const TEST_SIMPLE_PAGE_URL = `/books/book-slug-1/pages/1-test-page-4`;

describe('content', () => {
  it('looks right', async() => {
    await navigate(page, TEST_PAGE_URL);
    const screen = await fullPageScreenshot(page);
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('attribution looks right', async() => {
    await navigate(page, TEST_SIMPLE_PAGE_URL);
    await page.click('#main-content details');
    const screen = await fullPageScreenshot(page);

    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('looks right on mobile', async() => {
    page.setViewport({height: 731, width: 411});
    await navigate(page, TEST_PAGE_URL);
    page.click('[aria-label="Click to close the Table of Contents"]');
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('has SkipToContent link as the first tabbed-to element', async() => {
    await navigate(page, TEST_PAGE_URL);
    await page.keyboard.press('Tab');

    const isSkipToContentSelected = await page.evaluate(() => {
      if (document && document.activeElement) {
        const el = document.activeElement;
        const target = document.querySelector(`${el.getAttribute('href')}`);
        return !! ('Skip to Content' === el.textContent && el.tagName.toLowerCase() === 'a' && target);
      } else {
        return false;
      }
    });
    expect(isSkipToContentSelected).toBe(true);
  });

  // skipping because current design does not have an H1
  // TODO - add H1
  it('a11y lighthouse check', async() => {
    await navigate(page, TEST_PAGE_URL);
    await checkLighthouse(browser, TEST_LONG_PAGE_URL);
  });

  it(`when clicking a toc link:
    - it goes
    - scrolls the content to the top
    - doesn't scroll the sidebar at all
    - updates the selected toc element
    - and doesn't close the sidebar
  `, async() => {
    // set a viewport where the sidebar scrolls but "Test Page 3" is visible
    page.setViewport({height: 500, width: 1200});
    await navigate(page, TEST_PAGE_URL);

    // assert initial state
    expect(await h1Content(page)).toBe('Test Page 1');
    expect(await isTocVisible()).toBe(true);
    expect(await getSelectedTocSection()).toBe(TEST_PAGE_NAME);
    expect(await getScrollTop()).toBe(0);
    expect(await getTocScrollTop()).toBe(0);

    // scroll down and make sure it worked
    await scrollDown();
    await scrollTocDown(20);
    expect(await getScrollTop()).not.toBe(0);
    expect(await getTocScrollTop()).toBe(20);

    // click toc link to another long page
    expect(await clickTocLink(TEST_LONG_PAGE_NAME)).toBe(true);
    expect(await h1Content(page)).toBe('Test Page 3');
    expect(await getScrollTop()).toBe(0);
    expect(await getTocScrollTop()).toBe(20);
    expect(await isTocVisible()).toBe(true);
    expect(await getSelectedTocSection()).toBe(TEST_LONG_PAGE_NAME);
  });
});

// tslint:disable-next-line:no-shadowed-variable
const clickTocLink = (href: string) => page.evaluate(async(href) => {
  const tocHeader = document && Array.from(document.querySelectorAll('h2'))
    .find((node) => node.textContent === 'Table of Contents');

  const link = tocHeader && tocHeader.parentElement && tocHeader.parentElement.querySelector(`[href="${href}"]`);

  if (!link || !document || !window) {
    return false;
  }

  const event = document.createEvent('MouseEvent');
  event.initEvent('click', true, true);

  link.dispatchEvent(event);

  await window.__APP_ASYNC_HOOKS.calm();

  return true;
}, href);

const getSelectedTocSection = () => page.evaluate(() => {
  const tocHeader = document && Array.from(document.querySelectorAll('h2'))
    .find((node) => node.textContent === 'Table of Contents');

  const li = tocHeader && tocHeader.parentElement
    && tocHeader.parentElement.querySelector('li[aria-label="Current Page"]');

  const a = li && li.querySelector('a');
  const href = a && a.attributes.getNamedItem('href');

  return href && href.value;
});

const isTocVisible = () => page.evaluate(() => {
  const element = document && Array.from(document.querySelectorAll('h2'))
    .find((node) => node.textContent === 'Table of Contents');
  const style = element && window && window.getComputedStyle(element);
  return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
});

const getScrollTop = () => page.evaluate(() => {
  return document && document.documentElement && document.documentElement.scrollTop;
});

const getTocScrollTop = () => page.evaluate(() => {
  const tocHeader = document && Array.from(document.querySelectorAll('h2'))
    .find((node) => node.textContent === 'Table of Contents');

  return tocHeader && tocHeader.parentElement && tocHeader.parentElement.parentElement
    && tocHeader.parentElement.parentElement.scrollTop;
});

const scrollDown = () => page.evaluate(() => {
  return window && document && document.documentElement && window.scrollBy(0, document.documentElement.scrollHeight);
});

// tslint:disable-next-line:no-shadowed-variable
const scrollTocDown = (px: number) => page.evaluate((px) => {
  const tocHeader = document && Array.from(document.querySelectorAll('h2'))
    .find((node) => node.textContent === 'Table of Contents');

  const toc = tocHeader && tocHeader.parentElement && tocHeader.parentElement.parentElement;

  return toc && toc.scrollBy(0, px || toc.scrollHeight);
}, px);
