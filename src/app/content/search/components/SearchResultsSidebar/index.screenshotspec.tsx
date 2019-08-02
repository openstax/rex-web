/** @jest-environment puppeteer */
import {
  finishRender,
  navigate,
  setDesktopViewport,
  setMobileViewport
} from '../../../../../test/browserutils';

const TEST_PAGE_NAME = 'test-page-1';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}`;
const openMobileSearchWrapper = '[data-testid="mobile-toggle"]';
const selectSearchInputMobile = '[data-testid="mobile-search-input"]';
const selectSearchInputDesktop = '[data-testid="desktop-search-input"]';
const clearSearchInputSelector = '[data-testid="desktop-clear-search"]';
const closeSearchSidebarDesktopSelector = '[aria-label="Close search sidebar"]';
const workingSearchText = 'moon\n';
const noResultsSearchText = 'laksdkd\n';

const openAndTriggerSearchMobile = async(text: string) => {
  await page.waitForSelector(openMobileSearchWrapper);
  await page.click(openMobileSearchWrapper);
  await finishRender(page);

  await page.waitForSelector(selectSearchInputMobile);
  await page.type(selectSearchInputMobile, text);
  await finishRender(page);
};

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

describe('Search sidebar', () => {
  it('renders correctly on mobile', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);

    await openAndTriggerSearchMobile(workingSearchText);

    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('renders correctly on desktop', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);

    await openAndTriggerSearchDesktop(workingSearchText);

    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('clears search input without affecting search results sidebar', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);

    await openAndTriggerSearchDesktop(workingSearchText);
    await clearSearchInputDesktop();

    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('closes the search results sidebar without affecting search input', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);

    await openAndTriggerSearchDesktop(workingSearchText);
    await closeSearchSidebarDesktop();

    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('renders correctly with no search results', async() => {
    setDesktopViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);

    await openAndTriggerSearchDesktop(noResultsSearchText);

    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('clicking on search icon opens a search bar in mobile', async() => {
    setMobileViewport(page);
    await navigate(page, TEST_PAGE_URL);
    await finishRender(page);

    await page.waitForSelector(openMobileSearchWrapper);
    await page.click(openMobileSearchWrapper);
    await finishRender(page);

    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

});
