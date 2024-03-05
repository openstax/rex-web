/** @jest-environment puppeteer */
import asyncPool from 'tiny-async-pool';
import { checkLighthouse, ScoreTargets } from './test/browserutils';

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
    const scoreTargets: ScoreTargets = process.env.LIGHTHOUSE_TARGETS ? JSON.parse(process.env.LIGHTHOUSE_TARGETS) :
                                                                        DEFAULT_LIGHTHOUSE_TARGETS;

    await asyncPool(1, testPages, async(pageUrl) => {
      await checkLighthouse(browser, pageUrl, scoreTargets);
    });
  });
});
