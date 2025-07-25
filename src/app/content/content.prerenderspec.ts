/** @jest-environment puppeteer */
import equals from 'lodash/fp/equals';
import pretty from 'pretty';
import { finishRender, navigate } from '../../test/browserutils';

const TEST_PAGE_WITHOUT_MATH = '/books/book-slug-1/pages/2-test-page-3';
const TEST_PAGE_WITH_LINKS_NAME = '1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units';
const TEST_PAGE_WITH_LINKS = '/books/book-slug-1/pages/' + TEST_PAGE_WITH_LINKS_NAME;
const TEST_PAGE_WITH_FIGURE = '/books/book-slug-1/pages/test-page-for-generic-styles';

describe('content', () => {

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

  it('doesn\'t modify the markup on page load', async() => {
    const getHtml = () => {
      if (!document) {
        return 'no document';
      }
      const root = document.getElementById('root');

      if (!root) {
        return 'no root';
      }

      // these elements are intended to be changed on page load
      [
        '[class*="ManageCookiesLink"]',
        '[data-testid="user-nav"]',
        '[data-testid="nav-login"]',
        '[data-experiment]',
        '[data-async-content]',
      ].forEach((selector) => {
        root.querySelectorAll(selector).forEach((element) => {
          element.remove();
        });
      });

      // these attributes are intended to be changed on page load
      [
        ['[data-testid="toolbar"]', 'style'],
        ['[data-testid="toc"]', 'style'],
        ['[data-testid="search-results-sidebar"]', 'style'],
        ['[data-testid="loader"] path', 'style'],
        ['[data-testid="centered-content-row"]', 'style'],
        // img src is changed from data:image/svg+xml;base64... to static path
        ['[data-testid="navbar"] img', 'src'],
        ['[data-testid="topbar"] img', 'src'],
        // caused by DynamicContentStyles component
        ['#main-content', 'class'],
      ].forEach(([selector, attribute]) => {
        root.querySelectorAll(selector).forEach((element) =>
          element.removeAttribute(attribute)
        );
      });

      // react-dom and react-dom/server handle empty value attributes
      // inconsistently
      root.querySelectorAll('[value=""]').forEach((element) => {
        element.removeAttribute('value');
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

    expect(typeof (firstHTML)).toEqual('string');
    // With the use of RAC, new react-aria content is injected into the page
    expect(pretty(secondHTML)).not.toEqual(pretty(firstHTML));
  });

  it('updates content links in content', async() => {
    await page.setJavaScriptEnabled(false);
    await navigate(page, TEST_PAGE_WITH_LINKS);

    const links: string[] = await page.evaluate(() =>
      document
        ? Array.from(document.querySelectorAll('#main-content a'))
          .map((element) => element.getAttribute('href') as string)
        : []
    );

    expect(links).toEqual([
      'test-page-1',
    ]);
  });

  it('updates resource links in content', async() => {
    await page.setJavaScriptEnabled(false);
    await navigate(page, TEST_PAGE_WITH_FIGURE);

    const links: string[] = await page.evaluate(() =>
      document
        ? Array.from(document.querySelectorAll('#main-content img'))
          .map((element) => element.getAttribute('src') as string)
        : []
    );

    expect(links).toEqual([
      '/apps/image-cdn/v1/f=webp/apps/archive/codeversion/resources/c7cc4c5e00a4bc07cb74f29cac2fb3c6cd6d53b5',
    ]);
  });

  it('triggers google analytics pageview initially', async() => {
    await page.setJavaScriptEnabled(true);
    await navigate(page, TEST_PAGE_WITHOUT_MATH);

    const pendingEvents = await page.evaluate(() =>
      window?.__APP_ANALYTICS.googleAnalyticsClient.getPendingCommands()
    );

    expect(pendingEvents).toContainEqual({
      command: {
        eventName: 'page_view',
        name: 'event',
        payload: {
          page_path: '/books/book-slug-1/pages/2-test-page-3',
        },
      },
      savedAt: expect.anything(),
    });
  });

  it('triggers google analytics pageview after navigating again', async() => {
    await page.setJavaScriptEnabled(true);
    await navigate(page, TEST_PAGE_WITHOUT_MATH);

    const initialEvents = await page.evaluate(() =>
      window?.__APP_ANALYTICS.googleAnalyticsClient.getPendingCommands()
    );

    await page.click('a[data-analytics-label="next"]');
    await finishRender(page);

    const pendingEvents = await page.evaluate(() =>
      window?.__APP_ANALYTICS.googleAnalyticsClient.getPendingCommands()
    );

    const newEvents = pendingEvents.filter(
      (event: Event) => !initialEvents.find(equals(event))
    );

    expect(newEvents).toMatchObject([
      {
        command: {
          eventName: 'next',
          name: 'event',
          payload: {
            event_category: 'REX Link (prev-next)',
            event_label: '/books/book-slug-1/pages/2-test-page-3',
          },
        },
        savedAt: expect.anything(),
      },
      {
        command: {
          eventName: 'page_view',
          name: 'event',
          payload: {
            page_path: '/books/book-slug-1/pages/3-test-page-4',
          },
        },
        savedAt: expect.anything(),
      },
    ]);
  });
});
