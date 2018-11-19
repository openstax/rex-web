/** @jest-environment puppeteer */
import { finishRender, navigate, page } from '../../test/browserutils';

describe('content', () => {
  beforeEach(async() => {
    await navigate(page, '/books/Ax2o07Ul/pages/M_qlK4M9');
    await finishRender(page);
  });

  it('looks right', async() => {
    await expect(page).toMatchScreenshot({
      CI: {
        failureThreshold: 2,
        failureThresholdType: 'percent',
      },
    });
  });
});
