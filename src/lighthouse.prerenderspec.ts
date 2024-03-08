/** @jest-environment puppeteer */
import asyncPool from 'tiny-async-pool';
import { checkLighthouse } from './test/browserutils';

const TEST_PAGE_WITHOUT_MATH = '/books/book-slug-1/pages/2-test-page-3';
const TEST_PAGE_WITH_LINKS_NAME = '1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units';
const TEST_PAGE_WITH_LINKS = '/books/book-slug-1/pages/' + TEST_PAGE_WITH_LINKS_NAME;
const TEST_PAGE_WITH_FIGURE = '/books/book-slug-1/pages/test-page-for-generic-styles';
const DEFAULT_LIGHTHOUSE_PAGES = [ TEST_PAGE_WITHOUT_MATH, TEST_PAGE_WITH_LINKS, TEST_PAGE_WITH_FIGURE ];
const DEFAULT_LIGHTHOUSE_TARGETS = {
  accessibility: 0.97,
  'best-practices': 0.88,
  customAccessibility: 1,
  seo: 0.9,
};

describe('lighthouse', () => {
  it('matches or exceeds target scores', async() => {
    const testPages: string[] = process.env.LIGHTHOUSE_PAGES ? JSON.parse(process.env.LIGHTHOUSE_PAGES) :
                                                               DEFAULT_LIGHTHOUSE_PAGES;
    const baseReportPath = process.env.LIGHTHOUSE_BASE_REPORT_PATH;

    await asyncPool(1, testPages, async(pageUrl) => {
      const scoreTargets = baseReportPath ? `${baseReportPath}/${pageUrl.replace(/[^a-z0-9]+/gi, '-')}.json` :
                                            DEFAULT_LIGHTHOUSE_TARGETS;
      await checkLighthouse(browser, pageUrl, scoreTargets);
    });
  });
});
