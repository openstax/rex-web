/** @jest-environment puppeteer */
import { Page } from 'puppeteer';
import {
  finishRender, getScrollTop, navigate, setDesktopViewport, setMobileViewport,
} from '../../../test/browserutils';
import { cookieNudge } from './NudgeStudyTools/constants';

const TEST_PAGE_NAME = 'test-page-for-generic-styles';
const TEST_ANCHOR = 'term103';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}#${TEST_ANCHOR}`;
const TEST_CASES: { [testCase: string]: (target: Page) => Promise<void> } = {
  Desktop: setDesktopViewport, Mobile: setMobileViewport,
};
// Allow some slack to account for OS differences and layout variations
const MAX_SCROLL_DIFF = 30;

/**
 * Helper to get the expected scroll position for an element dynamically.
 * This calculates where the element should be scrolled to based on its position
 * and the scroll-padding CSS property set by ScrollOffset component.
 *
 * @param isClickNavigation - If true, accounts for the additional offset applied by ScrollOffset
 *   component's click handler (needed because some browsers don't support scroll-padding properly)
 */
async function getExpectedScrollPosition(
  page: Page,
  elementSelector: string,
  isClickNavigation = false
): Promise<number> {
  const result = await page.evaluate((selector, isClick) => {
    const element = document!.querySelector(selector);

    if (!element) {
      return 0;
    }

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    // Get the element's position relative to the document
    const rect = element.getBoundingClientRect();
    const scrollTop = window!.pageYOffset || document!.documentElement!.scrollTop;
    const elementTop = rect.top + scrollTop;

    // The ScrollOffset component sets CSS variables --scroll-offset-desktop and --scroll-offset-mobile
    const root = document!.documentElement!;
    const rootStyles = window!.getComputedStyle(root);

    // Check if we're in mobile viewport (max-width: 75em / 1200px)
    const isMobile = window!.matchMedia('(max-width: 75em)').matches;
    const scrollOffsetVar = isMobile ? '--scroll-offset-mobile' : '--scroll-offset-desktop';
    const scrollOffsetValue = rootStyles.getPropertyValue(scrollOffsetVar) || '0rem';

    // Convert rem to pixels
    const rootFontSize = parseFloat(window!.getComputedStyle(document!.documentElement!).fontSize) || 16;
    const scrollOffsetRem = parseFloat(scrollOffsetValue);
    const scrollPadding = scrollOffsetRem * rootFontSize;

    // Expected scroll position is element top minus scroll padding
    let expectedPosition = Math.max(0, elementTop - scrollPadding);

    // When clicking links, ScrollOffset component applies an ADDITIONAL manual offset
    // via window.scrollBy() as a workaround for browsers that don't support scroll-padding
    // This causes a double-offset, so we need to account for it
    if (isClick) {
      expectedPosition = Math.max(0, expectedPosition - scrollPadding);
    }

    return expectedPosition;
  }, elementSelector, isClickNavigation);

  return result;
}

beforeAll(async() => {
  await page.setCookie({
    domain: 'localhost',
    name: cookieNudge.date,
    value: new Date().toString(),
  });
});

describe('Content', () => {
  const page = global.page;

  // Workaround until TS version and RAC work together
  beforeAll(async() => {
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

  for (const testCase of Object.keys(TEST_CASES)) {
    describe(testCase, () => {
      beforeEach(async() => {
        const setViewport = TEST_CASES[testCase];
        await setViewport(page);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      });

      it('scrolls correctly to all elements', async() => {
        await navigate(page, TEST_PAGE_URL);
        await finishRender(page);

        // scrolling on initial load doesn't work on the dev build
        if (process.env.SERVER_MODE === 'built') {
          // Loading page with anchor - verify it scrolled to the anchor element
          const anchorScrollTop = await getScrollTop(page);
          const expectedAnchorPosition = await getExpectedScrollPosition(page, `#${TEST_ANCHOR}`);
          expect(Math.abs(anchorScrollTop - expectedAnchorPosition)).toBeLessThanOrEqual(MAX_SCROLL_DIFF);
        }

        // Clicking links - dynamically calculate expected positions for each target
        const links = await page.$$('#table-of-links a');
        for (const link of links) {
          // Get the href before clicking to know what element we're scrolling to
          const href = await page.evaluate((el) => el.getAttribute('href'), link);
          const targetId = href?.replace(/^#/, '') || '';

          await link.click();
          await finishRender(page);

          // Wait additional time for ScrollOffset manual adjustment to complete
          await new Promise((resolve) => setTimeout(resolve, 500));

          const actualScrollTop = await getScrollTop(page);
          // Pass isClickNavigation=true because ScrollOffset applies additional offset for clicks
          const expectedScrollTop = await getExpectedScrollPosition(page, `#${targetId}`, true);

          expect(Math.abs(actualScrollTop - expectedScrollTop)).toBeLessThanOrEqual(MAX_SCROLL_DIFF);
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      });
    });
  }
});
