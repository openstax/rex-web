/** @jest-environment puppeteer */
import { finishRender, navigate, page } from '../../test/browserutils';

describe('content', () => {

  beforeEach(async() => {
    await navigate(page, '/books/Ax2o07Ul/pages/M_qlK4M9');
  });

  it('looks right', async() => {
    await finishRender(page);
    const screen = await page.screenshot({fullPage: true});
    expect(screen).toMatchImageSnapshot();
  });
});
