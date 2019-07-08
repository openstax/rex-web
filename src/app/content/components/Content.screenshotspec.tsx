/** @jest-environment puppeteer */
import { Page } from 'puppeteer';
import { finishRender, navigate, setDesktopViewport, setMobileViewport } from '../../../test/browserutils';
import { Config } from '../../../test/matchers/toMatchImageSnapshot';

const TEST_PAGE_NAME = 'test-page-for-generic-styles';
const TEST_ANCHOR = 'term103';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}#${TEST_ANCHOR}`;
const SNAPSHOT_OPTIONS: Config = {
  CI: {
    failureThreshold: 1.5,
    failureThresholdType: 'percent',
  },
};

describe('Content', () => {
  const testCases: { [testCase: string]: (target: Page) => Promise<void> } = {
    Desktop: setDesktopViewport, Mobile: setMobileViewport,
  };

  for (const testCase of Object.keys(testCases)) {
    describe(testCase, () => {
      beforeEach(() => {
        const setViewport = testCases[testCase];
        setViewport(page);
      });

      it('scrolls correctly to all elements', async() => {
        await navigate(page, TEST_PAGE_URL);
        await finishRender(page);
        expect(await page.screenshot()).toMatchImageSnapshot(SNAPSHOT_OPTIONS);

        const links = await page.$$('#table-of-links a');
        for (const link of links) {
          await link.click();
          await finishRender(page);

          expect(await page.screenshot()).toMatchImageSnapshot(SNAPSHOT_OPTIONS);
        }
      });
    });
  }
});
