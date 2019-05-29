/** @jest-environment puppeteer */
import {
  finishRender,
  fullPageScreenshot,
  navigate,
  setDesktopViewport,
  setMobileViewport
} from '../../test/browserutils';

const CHEMISTRY_BOOK = '/books/chemistry-2e';
const SPLASH_IMAGE_FULL_WIDTH = `${CHEMISTRY_BOOK}/pages/6-introduction`;
/*const SPLASH_IMAGE_FULL_SIZE = `${CHEMISTRY_BOOK}/pages/6-5-periodic-variations-in-element-properties`;
const TABLE_SEPARATIONS = `${CHEMISTRY_BOOK}/pages/7-5-strengths-of-ionic-and-covalent-bonds`;
const INSIDER_PERSPECTIVE_PAGE = '/books/american-government-2e/pages/2-4-the-ratification-of-the-constitution#fs-id1166227577868';
const KEY_TERMS_BOLDED = '/books/business-ethics/pages/1-key-terms';*/

describe('content', () => {
  it('looks right', async() => {
    setDesktopViewport(page);
    await navigate(page, SPLASH_IMAGE_FULL_WIDTH);
    const screen = await fullPageScreenshot(page);
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });
});
