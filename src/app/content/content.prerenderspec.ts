/** @jest-environment puppeteer */
import equals from 'lodash/fp/equals';
import pretty from 'pretty';
import { finishRender, navigate } from '../../test/browserutils';

const TEST_PAGE_WITHOUT_MATH = '/books/book-slug-1/pages/2-test-page-3';
const TEST_PAGE_WITH_LINKS_NAME = '1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units';
const TEST_PAGE_WITH_LINKS = '/books/book-slug-1/pages/' + TEST_PAGE_WITH_LINKS_NAME;

describe('content', () => {
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
        '[data-testid="user-nav"]',
        '[data-testid="nav-login"]',
        '[data-experiment]',
      ].forEach((selector) => {
        const element = root.querySelector(selector);
        if (element) {
          element.remove();
        }
      });

      // these attributes are intended to be changed on page load
      [
        ['[data-testid="toc"]', 'style'],
        ['[data-testid="search-results-sidebar"]', 'style'],
        ['[data-testid="loader"] path', 'style'],
        // img src is changed from data:image/svg+xml;base64... to static path
        ['[data-testid="navbar"] img', 'src'],
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

    expect(typeof(firstHTML)).toEqual('string');
    expect(pretty(secondHTML)).toEqual(pretty(firstHTML));
  });

  it('updates links in content', async() => {
    await page.setJavaScriptEnabled(false);
    await navigate(page, TEST_PAGE_WITH_LINKS);

    const links: string[] = await page.evaluate(() => {
      console.log('doc: ', document);
      if (document) {
        console.log('array: ', Array.from(document.querySelectorAll('#main-content a')))
      }

      return document
        ? Array.from(document.querySelectorAll('#main-content a'))
          .map((element) => element.getAttribute('href') as string)
        : [];
      }
    );

    expect(links).toEqual([
      'test-page-1',
    ]);
  });

  it('triggers google analytics pageview initially', async() => {
    await page.setJavaScriptEnabled(true);
    await navigate(page, TEST_PAGE_WITHOUT_MATH);

    const pendingEvents = await page.evaluate(() =>
      window!.__APP_ANALYTICS.googleAnalyticsClient.getPendingCommands()
    );

    expect(pendingEvents).toContainEqual({
      command: {
        name: 'send',
        payload: {
          hitType: 'pageview',
          page: '/books/book-slug-1/pages/2-test-page-3',
        },
      },
      savedAt: expect.anything(),
    });
  });

  it('triggers google analytics pageview after navigating again', async() => {
    await page.setJavaScriptEnabled(true);
    await navigate(page, TEST_PAGE_WITHOUT_MATH);

    const initialEvents = await page.evaluate(() =>
      window!.__APP_ANALYTICS.googleAnalyticsClient.getPendingCommands()
    );

    await page.click('a[data-analytics-label="next"]');

    const pendingEvents = await page.evaluate(() =>
      window!.__APP_ANALYTICS.googleAnalyticsClient.getPendingCommands()
    );

    const newEvents = pendingEvents.filter(
      (event: any) => !initialEvents.find(equals(event))
    );

    expect(newEvents).toContainEqual({
      command: {
        name: 'send',
        payload: {
          eventAction: 'next',
          eventCategory: 'REX Link (prev-next)',
          eventLabel: '/books/book-slug-1/pages/2-test-page-3',
          hitType: 'event',
          transport: 'beacon',
        },
      },
      savedAt: expect.anything(),
    });

    expect(newEvents).toContainEqual({
      command: {
        name: 'send',
        payload: {
          hitType: 'pageview',
          page: '/books/book-slug-1/pages/3-test-page-4',
        },
      },
      savedAt: expect.anything(),
    });
  });
});
