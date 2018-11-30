/** @jest-environment puppeteer */
import { navigate } from '../../test/browserutils';

const TEST_PAGE = '/books/testbook1-shortid/pages/testpage1-shortid';

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

    const firstHTML = (await page.evaluate(getHtml))
    // i'm not sure why these comments are added during the build.
    // if there is no good reason for them to be there ideally
    // we would find a way to not have them.
      .replace(/<!--.*?-->/g, '');

    await page.setJavaScriptEnabled(true);
    await navigate(page, TEST_PAGE);

    const secondHTML = await page.evaluate(getHtml);

    expect(typeof(firstHTML)).toEqual('string');
    expect(secondHTML).toEqual(firstHTML);
  });

  it('adds content fonts to the head', async() => {
    await navigate(page, TEST_PAGE);
    const fonts: string[] = await page.evaluate(() => window ? window.__APP_SERVICES.fontCollector.fonts : []);

    await page.setJavaScriptEnabled(false);
    await navigate(page, TEST_PAGE);

    const links: string[] = await page.evaluate(() =>
      document
        ? Array.from(document.querySelectorAll('head link')).map((element) => element.getAttribute('href'))
        : []
    );

    expect(fonts.length).toBeGreaterThan(0);
    fonts.forEach((font) => expect(links).toContainEqual(font));
  });
});
