/** @jest-environment puppeteer */
import asyncPool from 'tiny-async-pool';
import { checkLighthouse } from './test/browserutils';

const TEST_PAGE_WITHOUT_MATH = '/books/book-slug-1/pages/2-test-page-3';
const TEST_PAGE_WITH_LINKS_NAME = '1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units';
const TEST_PAGE_WITH_LINKS = '/books/book-slug-1/pages/' + TEST_PAGE_WITH_LINKS_NAME;
const TEST_PAGE_WITH_FIGURE = '/books/book-slug-1/pages/test-page-for-generic-styles';
const LIGHTHOUSE_PAGES = [ TEST_PAGE_WITHOUT_MATH, TEST_PAGE_WITH_LINKS, TEST_PAGE_WITH_FIGURE ];
const LIGHTHOUSE_TARGETS = {
  accessibility: 0.97,
  'best-practices': 0.88,
  customAccessibility: 1,
  seo: 0.9,
};

describe('lighthouse', () => {
  it('matches or exceeds target scores', async() => {
    await asyncPool(1, LIGHTHOUSE_PAGES, async(pageUrl) => {
      await checkLighthouse(browser, pageUrl, LIGHTHOUSE_TARGETS);
    });
  });
});
