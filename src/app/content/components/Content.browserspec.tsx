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

/* eslint-disable @typescript-eslint/no-non-null-assertion */

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
  console.info('*** getExpectedScrollPosition called with selector:', elementSelector); // eslint-disable-line
  const result = await page.evaluate((selector, isClick) => {
    console.info('*** Inside page.evaluate - Selector:', selector); // eslint-disable-line

    const element = document!.querySelector(selector);
    console.info('*** Element found?', Boolean(element)); // eslint-disable-line

    if (!element) {
      console.info('*** Element is null! Available IDs:', // eslint-disable-line
        Array.from(document!.querySelectorAll('[id]'))
          .map((el) => el.id)
          .slice(0, 20)
          .join(', ')
      );
      return 0;
    }

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

    console.info('*** SCROLL OFFSET VAR:', scrollOffsetVar, '=', scrollOffsetValue); // eslint-disable-line
    console.info('*** SCROLL PADDING (px):', scrollPadding); // eslint-disable-line

    // Expected scroll position is element top minus scroll padding
    let expectedPosition = Math.max(0, elementTop - scrollPadding);

    // When clicking links, ScrollOffset component applies an ADDITIONAL manual offset
    // via window.scrollBy() as a workaround for browsers that don't support scroll-padding
    // This causes a double-offset, so we need to account for it
    if (isClick) {
      expectedPosition = Math.max(0, expectedPosition - scrollPadding);
    }

    console.info('*** EXPECTED POSITION:', expectedPosition); // eslint-disable-line

    return expectedPosition;
  }, elementSelector, isClickNavigation);

  console.info('*** getExpectedScrollPosition result:', result); // eslint-disable-line
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

        /* eslint-disable no-console */
        // Debug: Log all link hrefs before clicking any
        const allHrefs = await page.evaluate(() => {
          const linkElements = Array.from(document!.querySelectorAll('#table-of-links a'));
          return linkElements.map(el => ({
            text: el.textContent?.trim(),
            href: el.getAttribute('href'),
          }));
        });
        console.info('*** All link hrefs in table:', JSON.stringify(allHrefs, null, 2));
        /* eslint-enable no-console */

        for (const link of links) {
          // Get the href before clicking to know what element we're scrolling to
          const href = await page.evaluate((el) => el.getAttribute('href'), link);
          // Extract just the hash part (after the # symbol) from href
          // href might be "#main-content" or "page-slug#main-content"
          const hashMatch = href?.match(/#(.+)$/);
          const targetId = hashMatch ? hashMatch[1] : '';

          /* eslint-disable no-console */
          console.info('*** Clicking link with href:', href, 'targetId:', targetId);
          /* eslint-enable no-console */

          await link.click();
          await finishRender(page);

          // Wait additional time for ScrollOffset manual adjustment to complete
          await new Promise((resolve) => setTimeout(resolve, 500));

          /* eslint-disable no-console */
          const currentUrl = await page.url();
          console.info('*** Current URL after click:', currentUrl);
          /* eslint-enable no-console */

          const actualScrollTop = await getScrollTop(page);
          // Pass isClickNavigation=true because ScrollOffset applies additional offset for clicks
          const expectedScrollTop = await getExpectedScrollPosition(page, `#${targetId}`, true);

          /* eslint-disable no-console */
          console.info('*** ACTUAL SCROLL TOP', actualScrollTop);

          expect(Math.abs(actualScrollTop - expectedScrollTop)).toBeLessThanOrEqual(MAX_SCROLL_DIFF);
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      });
    });
  }
});
