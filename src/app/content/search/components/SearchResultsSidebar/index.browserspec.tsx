/** @jest-environment puppeteer */
import {
  finishRender,
  navigate,
  setDesktopViewport
} from '../../../../../test/browserutils';
import { receiveExperiments } from '../../../../featureFlags/actions';

const TEST_PAGE_NAME = 'test-page-1';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}`;

const selectSearchInputDesktop = '[data-testid="desktop-search-input"]';
const clearSearchInputSelector = '[data-testid="desktop-clear-search"]';
const closeSearchSidebarDesktopSelector = '[data-testid="close-search"]';
const searchSidebarSelector = '[aria-label="Search results sidebar"]';
const workingSearchText = 'moon\n';

const openAndTriggerSearchDesktop = async(text: string) => {
  await page.waitForSelector(selectSearchInputDesktop);
  await page.type(selectSearchInputDesktop, text);
  await finishRender(page);
};

const clearSearchInputDesktop = async() => {
  await page.waitForSelector(clearSearchInputSelector);
  await page.click(clearSearchInputSelector);
  await finishRender(page);
};

const closeSearchSidebarDesktop = async() => {
  await page.waitForSelector(closeSearchSidebarDesktopSelector);
  await page.click(closeSearchSidebarDesktopSelector);
  await finishRender(page);
};

describe('SearchResultsSidebar', () => {

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

  const setup = async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_URL);

    // Prevent search from moving to sidebar
    const action = receiveExperiments(['tpdEbFiARyarMQ-cx46QiQ', '0']);
    await page.evaluate((experimentsAction) =>
       window && window.__APP_STORE.dispatch(experimentsAction), action);

    await finishRender(page);
  };

  it('clears search input without affecting search results sidebar', async() => {
    await setup();
    await openAndTriggerSearchDesktop(workingSearchText);
    await clearSearchInputDesktop();

    expect(await page.waitForSelector(searchSidebarSelector, { visible: true })).toBeTruthy();

    const searchInput = await page.$(selectSearchInputDesktop);
    if (searchInput) {
      const inputValue = await (await searchInput.getProperty('value')).jsonValue();
      expect(inputValue).toBe('');
    }
  });

  it('closes the search results sidebar without affecting search input', async() => {
    await setup();
    await openAndTriggerSearchDesktop(workingSearchText);
    await closeSearchSidebarDesktop();

    expect(await page.waitForSelector(searchSidebarSelector, { hidden: true })).toBeTruthy();

    const searchInput = await page.$(selectSearchInputDesktop);
    if (searchInput) {
      const inputValue = await (await searchInput.getProperty('value')).jsonValue();
      expect(await inputValue).toBe('moon');
    }
  });
});
