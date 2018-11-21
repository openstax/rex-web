/** @jest-environment puppeteer */
import { finishRender, navigate } from '../../test/browserutils';

describe('content', () => {
  beforeEach(async() => {
    await navigate(page, '/books/Ax2o07Ul/pages/M_qlK4M9');
    await finishRender(page);
  });

  it('looks right', async() => {
    const screen = await page.screenshot({fullPage: true});

    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 2,
        failureThresholdType: 'percent',
      },
    });
  });
});
