/** @jest-environment puppeteer */
import { checkLighthouse, finishRender, h1Content, navigate } from '../../test/browserutils';

const TEST_PAGE = '/books/book-slug-1/pages/Test-Page-1';
const TEST_LONG_PAGE = '/books/book-slug-1/pages/1-Test-Page-3';

describe('content', () => {
  beforeEach(async() => {
    await navigate(page, TEST_PAGE);
  });

  it('looks right', async() => {
    await finishRender(page);
    const screen = await page.screenshot({fullPage: true});
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('has SkipToContent link as the first tabbed-to element', async() => {
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

  it('a11y lighthouse check', async() => {
    await checkLighthouse(TEST_PAGE);
  });

  it(`when clicking a toc link:
    - it goes
    - scrolls the content to the top
    - doesn't scroll the sidebar at all
    - updates the selected toc element
    - and doesn't close the sidebar
  `, async() => {
    // assert initial state
    expect(await h1Content(page)).toBe('Test Book 1 / Test Page 1');
    expect(await isTocVisible()).toBe(true);
    expect(await getSelectedTocSection()).toBe(TEST_PAGE);
    expect(await getScrollTop()).toBe(0);
    expect(await getTocScrollTop()).toBe(0);

    // scroll down and make sure it worked
    await scrollDown();
    await scrollTocDown(20);
    expect(await getScrollTop()).not.toBe(0);
    expect(await getTocScrollTop()).toBe(20);

    // click toc link to another long page
    expect(await clickTocLink(TEST_LONG_PAGE)).toBe(true);
    expect(await h1Content(page)).toBe('Test Book 1 / Test Page 3');
    expect(await getScrollTop()).toBe(0);
    expect(await getTocScrollTop()).toBe(20);
    expect(await isTocVisible()).toBe(true);
    expect(await getSelectedTocSection()).toBe(TEST_LONG_PAGE);
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
