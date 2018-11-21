/** @jest-environment puppeteer */
import { finishRender, navigate } from '../../test/browserutils';

describe('content', () => {
  beforeEach(async() => {
    await navigate(page, '/books/testbook1-shortid/pages/testpage1-shortid');
    await finishRender(page);
  });

  it('looks right', async() => {
    const screen = await page.screenshot({fullPage: true});
    expect(screen).toMatchImageSnapshot();
  });
});
