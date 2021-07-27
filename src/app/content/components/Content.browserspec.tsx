/** @jest-environment puppeteer */
import { Page } from 'puppeteer';
import { finishRender, navigate, setDesktopViewport, setMobileViewport } from '../../../test/browserutils';

const TEST_PAGE_NAME = 'test-page-for-generic-styles';
const TEST_ANCHOR = 'term103';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}#${TEST_ANCHOR}`;
const TEST_CASES: { [testCase: string]: (target: Page) => Promise<void> } = {
  Desktop: setDesktopViewport, Mobile: setMobileViewport,
};
const EXPECTED_SCROLL_TOPS: { [testCase: string]: number[] } = {
  Desktop: [242, 90, 122, 242, 365, 622, 715, 1216, 1560],
  Mobile: [239, 66, 96, 239, 523, 1148, 1287, 1636, 2004],
};

describe('Content', () => {
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
          const anchorScrollTop = await page.evaluate('document.documentElement.scrollTop');
          expect(anchorScrollTop).toEqual(expectedScrollTops[0]);
        }

        // Clicking links
        const links = await page.$$('#table-of-links a');
        for (const [index, link] of links.entries()) {
          await link.click();
          await finishRender(page);

          const linkScrollTop = await page.evaluate('document.documentElement.scrollTop');
          expect(linkScrollTop).toEqual(expectedScrollTops[index + 1]);
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      });
    });
  }
});
