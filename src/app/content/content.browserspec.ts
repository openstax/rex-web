/** @jest-environment puppeteer */
import { navigate, page } from '../../test/utils';

describe('content', () => {

  beforeEach(async() => {
    await navigate(page, '/books/Ax2o07Ul/pages/M_qlK4M9');
  });

  it('looks right', async() => {
    const screen = await page.screenshot({fullPage: true});
    expect(screen).toMatchImageSnapshot();
  });
});
