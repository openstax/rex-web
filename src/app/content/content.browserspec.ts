/** @jest-environment puppeteer */
import {
  checkLighthouse,
  desktopWidth,
  finishRender,
  h1Content,
  navigate,
} from '../../test/browserutils';
import { cookieNudge } from './components/NudgeStudyTools/constants';

const TEST_PAGE_NAME = 'test-page-1';
const TEST_LONG_PAGE_NAME = '2-test-page-3';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}`;
const TEST_LONG_PAGE_URL = `/books/book-slug-1/pages/${TEST_LONG_PAGE_NAME}`;

beforeAll(async() => {
  await page.setCookie({
    domain: 'localhost',
    name: cookieNudge.date,
    value: new Date().toString(),
  });
});

describe('content', () => {

  // Workaround until TS version and RAC work together
  beforeEach(async() => {
    await page.evaluateOnNewDocument(() => {
      // eslint-disable-next-line no-extend-native
      Object.defineProperty(Array.prototype, 'at', {
        configurable: true,
        writable: true,
        value(n: number) {
          n = Math.trunc(n) || 0;
          if (n < 0) n += this.length;
          if (n < 0 || n >= this.length) return undefined;
          return this[n];
        },
      });
    });
  });

  it('has SkipToContent link as the first tabbed-to element', async() => {
    await navigate(page, TEST_LONG_PAGE_URL);
    await finishRender(page);
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
    await checkLighthouse(browser, TEST_LONG_PAGE_URL, {
      accessibility: 0.97, // In the meantime we have RAC mocked
      'best-practices': 0.88,
      customAccessibility: 0.97, // In the meantime we have RAC mocked
      seo: 1,
    });
  });

  it(`when clicking a toc link:
    - it goes
    - scrolls the content to the top
    - doesn't scroll the sidebar at all
    - updates the selected toc element
    - and doesn't close the sidebar
  `, async() => {
    // set a viewport where the sidebar scrolls but "Test Page 3" is visible
    page.setViewport({height: 400, width: desktopWidth});
    await navigate(page, TEST_PAGE_URL);

    // assert initial state
    expect(await h1Content(page)).toBe('Test Page 1');
    expect(await isTocVisible()).toBe(true);
    expect(await getSelectedTocSection()).toBe(TEST_PAGE_NAME);
    expect(await getScrollTop()).toBe(0);
    expect(await getTocScrollTop()).toBe(0);

    // scroll down and make sure it worked
    await scrollDown();
    expect(await getScrollTop()).not.toBe(0);

    // click toc link to another long page
    expect(await clickTocLink(TEST_LONG_PAGE_NAME)).toBe(true);
    expect(await h1Content(page)).toBe('Test Page 3');
    expect(await getScrollTop()).toBe(0);
    expect(await isTocVisible()).toBe(true);
    expect(await getSelectedTocSection()).toBe(TEST_LONG_PAGE_NAME);
  });
});

// tslint:disable-next-line:no-shadowed-variable
const clickTocLink = (href: string) => page.evaluate(async(href) => {
  const link = document && document.querySelector(`a[href="${href}"]`);

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
  const toc = document && document.querySelector('[data-testid="toc"]');

  const a = toc && toc.querySelector('a[aria-label$="Current Page"]');
  const href = a && a.attributes.getNamedItem('href');

  return href && href.value;
});

const isTocVisible = () => page.evaluate(() => {
  const element = document && document.querySelector('[data-testid="toc"]');
  const style = element && window && window.getComputedStyle(element);
  return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
});

const getScrollTop = () => page.evaluate(() => {
  return document && document.documentElement && document.documentElement.scrollTop;
});

const getTocScrollTop = () => page.evaluate(() => {
  const scrollyTocNav = document && document.querySelector('[data-testid="toc"] > div');
  return scrollyTocNav && scrollyTocNav.scrollTop;
});

const scrollDown = () => page.evaluate(() => {
  return window && document && document.documentElement && window.scrollBy(0, document.documentElement.scrollHeight);
});
