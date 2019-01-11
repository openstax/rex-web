/** @jest-environment puppeteer */
import { navigate } from '../../test/browserutils';

const TEST_PAGE = '/books/book-slug-1/pages/test-Page-1';

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
      return root.innerHTML;
    };

    await page.setJavaScriptEnabled(false);
    await navigate(page, TEST_PAGE);

    const firstHTML = await page.evaluate(getHtml);

    await page.setJavaScriptEnabled(true);
    await navigate(page, TEST_PAGE);

    const secondHTML = await page.evaluate(getHtml);

    expect(typeof(firstHTML)).toEqual('string');
    expect(secondHTML).toEqual(firstHTML);
  });

  it('adds content fonts to the head', async() => {
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
});
