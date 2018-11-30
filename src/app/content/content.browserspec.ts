/** @jest-environment puppeteer */
import { finishRender, navigate } from '../../test/browserutils';

const TEST_PAGE = '/books/testbook1-shortid/pages/testpage1-shortid';

describe('content', () => {
  beforeEach(async() => {
    await navigate(page, TEST_PAGE);
    await finishRender(page);
  });

  it('looks right', async() => {
    const screen = await page.screenshot({fullPage: true});
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });
});
