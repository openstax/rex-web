/** @jest-environment puppeteer */
import { finishRender, navigate } from '../../test/browserutils';

const TEST_PAGE = '/books/book-slug-1/pages/test-page-1';
const TEST_PAGE_WITHOUT_MATH = '/books/book-slug-1/pages/2-test-page-3';
const TEST_PAGE_WITH_LINKS_NAME = '1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units';
const TEST_PAGE_WITH_LINKS = '/books/book-slug-1/pages/' + TEST_PAGE_WITH_LINKS_NAME;

describe('content', () => {
  it('doesn\'t modify the markup on page load', async() => {
    const getHtml = () => {
      if (!document) {
        return null;
      }
      const root = document.getElementById('root');

      if (!root) {
        return null;
      }

      // these elements are intended to be changed on page load
      [
        '[data-testid="user-nav"]',
        '[data-testid="nav-login"]',
      ].forEach((selector) => {
        const element = root.querySelector(selector);
        if (element) {
          element.remove();
        }
      });

      // these attributes are intended to be changed on page load
      [
        ['[data-testid="toc"]', 'style'],
      ].forEach(([selector, attribute]) => {
        const element = root.querySelector(selector);
        if (element) {
          element.removeAttribute(attribute);
        }
      });

      return root.innerHTML;
    };

    await page.setJavaScriptEnabled(false);
    await navigate(page, TEST_PAGE_WITHOUT_MATH);

    const firstHTML = await page.evaluate(getHtml);

    await page.setJavaScriptEnabled(true);
    await navigate(page, TEST_PAGE_WITHOUT_MATH);
    await finishRender(page);

    const secondHTML = await page.evaluate(getHtml);

    expect(typeof(firstHTML)).toEqual('string');
    expect(secondHTML).toEqual(firstHTML);
  });

  it.skip('adds content fonts to the head', async() => {
    await page.setJavaScriptEnabled(false);
    await navigate(page, TEST_PAGE);

    const links: string[] = await page.evaluate(() =>
      document
        ? Array.from(document.querySelectorAll('head link')).map((element) => element.getAttribute('href'))
        : []
    );

    expect(links).toContainEqual(
      'https://fonts.googleapis.com/css?family=Noto+Sans:400,400i,700,700i|Roboto+Condensed:300,300i,400,400i,700,700i'
    );
  });

  it('updates links in content', async() => {
    await page.setJavaScriptEnabled(false);
    await navigate(page, TEST_PAGE_WITH_LINKS);

    const links: string[] = await page.evaluate(() =>
      document
        ? Array.from(document.querySelectorAll('#main-content a'))
          .map((element) => element.getAttribute('href'))
        : []
    );

    expect(links).toEqual([
      '/books/book-slug-1/pages/test-page-1',
    ]);
  });
});
