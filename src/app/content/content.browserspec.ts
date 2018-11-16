/** @jest-environment puppeteer */
import { finishRender, navigate, page } from '../../test/browserutils';

describe('content', () => {

  beforeEach(async() => {
    await navigate(page, '/books/Ax2o07Ul/pages/M_qlK4M9');
  });

  it('looks right', async() => {
    await finishRender(page);
    const screen = await page.screenshot({fullPage: true});
    const headingStyle = await page.evaluate(() => {
        if (window) {
            const headings = window.document.querySelectorAll('h1');
            if (headings.length !== 1) {
                throw new Error(`BUG: Expected exactly 1 <h1> element but found ${headings.length}`);
            }
            const compStyle = window.getComputedStyle(headings[0]);
            const styleMap: {[name: string]: string} = {};
            for (let index = 0; index < compStyle.length; index++) { // tslint:disable-line:prefer-for-of
                const styleName = compStyle[index];
                styleMap[styleName] = compStyle.getPropertyValue(styleName);
            }
            return styleMap;
        }
    });
    expect(headingStyle).toMatchSnapshot();
    expect(screen).toMatchImageSnapshot();
  });
});
