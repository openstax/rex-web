/** @jest-environment puppeteer */
import { checkLighthouse, navigate } from './test/browserutils';

const TEST_PAGE_NAME = '2-test-page-3';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}`;

describe('Browser sanity tests', () => {

  let consoleMessages: Array<{type: 'debug' | 'error' | 'info' | 'log' | 'warning', message: string}> = [];


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

  beforeEach(async() => {
    consoleMessages = [];

    page.on('console', (consoleMessage) => {
      const type = consoleMessage.type();
      const text = consoleMessage.text();

      switch (type) {
        case 'debug':
        case 'error':
        case 'info':
        case 'log':
        case 'warning':
          consoleMessages.push({type, message: text});
          break;
        default:
          throw new Error(`BUG: Unsupported console type: '${type}'`);
      }
    });

    await navigate(page, '/errors/404');
  });

  it('displays the "Hello developer" console text', async() => {
    const infoMessages = consoleMessages
      .filter(({type}) => type === 'info')
      .map(({message}) => message);

    const str = [
      '%cHowdy! If you want to help out, the source code can be found at ',
      'https://github.com/openstax/rex-web',
      ' font-weight:bold',
    ];
    expect(infoMessages).toContain(str.join(''));
  });
});

it('a11y lighthouse check', async() => {
  await checkLighthouse(browser, TEST_PAGE_URL, {
    accessibility: 0.97, // In the meantime we have RAC mocked
    'best-practices': 0.79,
    customAccessibility: 0.97, // In the meantime we have RAC mocked
    seo: 0.69,
  });
});
