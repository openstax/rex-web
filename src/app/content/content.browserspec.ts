/** @jest-environment puppeteer */
import { page, url } from '../../test/utils';

describe('content', () => {

  beforeEach(async() => {
    await page.goto(url('/books/Ax2o07Ul/pages/M_qlK4M9'));
  });

  it('looks right', async() => {
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot();
  });
});
