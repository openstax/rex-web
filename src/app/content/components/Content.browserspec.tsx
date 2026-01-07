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
// Allow some slack to account for OS differences
const MAX_SCROLL_DIFF = 10;
const EXPECTED_SCROLL_TOPS: { [testCase: string]: number[] } = {
  Desktop: [242, 90, 122, 242, 365, 668, 761, 1268, 1612],
  Mobile: [239, 66, 96, 239, 523, 1263, 1402, 1756, 2123],
};

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
        const expectedScrollTops = EXPECTED_SCROLL_TOPS[testCase];

        await navigate(page, TEST_PAGE_URL);
        await finishRender(page);
        // scrolling on initial load doesn't work on the dev build
        if (process.env.SERVER_MODE === 'built') {
          // Loading page with anchor
          const anchorScrollTop = await getScrollTop(page);
          expect(Math.abs(anchorScrollTop - expectedScrollTops[0])).toBeLessThanOrEqual(MAX_SCROLL_DIFF);
        }

        // Clicking links
        const links = await page.$$('#table-of-links a');
        for (const [index, link] of links.entries()) {
          await link.click();
          await finishRender(page);

          const linkScrollTop = await getScrollTop(page);
          expect(Math.abs(linkScrollTop - expectedScrollTops[index + 1])).toBeLessThanOrEqual(MAX_SCROLL_DIFF);
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      });
    });
  }
});
