/** @jest-environment puppeteer */
import { finishRender, h1Content, navigate } from '../../test/browserutils';

const TEST_PAGE = '/books/testbook1-shortid/pages/testpage1-shortid';
const TEST_NEXT_PAGE = '/books/testbook1-shortid/pages/testpage2-shortid';

describe('content', () => {
  beforeEach(async() => {
    await navigate(page, TEST_PAGE);
  });

  it('looks right', async() => {
    await finishRender(page);
    const screen = await page.screenshot({fullPage: true});
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });
  });

  it('has SkipToContent link as the first tabbed-to element', async() => {
    await page.keyboard.press('Tab');

    const isSkipToContentSelected = await page.evaluate(() => {
      if (document && document.activeElement) {
        const el = document.activeElement;
        const target = document.querySelector(`${el.getAttribute('href')}`);
        return !! ('Skip to Content' === el.textContent && el.tagName.toLowerCase() === 'a' && target);
      } else {
        return false;
      }
    });
    expect(isSkipToContentSelected).toBe(true);
  });

  it('ToC navigation navigates', async() => {
    // assert initial state
    expect(await h1Content(page)).toBe('Test Book 1 / Test Page 1');
    expect(await isTocVisible()).toBe(true);
    expect(await getSelectedTocSection()).toBe(TEST_PAGE);

    // click toc link
    expect(await clickTocLink(TEST_NEXT_PAGE)).toBe(true);

    // assert second page state
    expect(await h1Content(page)).toBe('Test Book 1 / Test Page 2');
    expect(await isTocVisible()).toBe(true);
    expect(await getSelectedTocSection()).toBe(TEST_NEXT_PAGE);
  });
});

// tslint:disable-next-line:no-shadowed-variable
const clickTocLink = (href: string) => page.evaluate(async(href) => {
  const tocHeader = document && Array.from(document.querySelectorAll('h2'))
    .find((node) => node.textContent === 'Table of Contents');

  const link = tocHeader && tocHeader.parentElement && tocHeader.parentElement.querySelector(`[href="${href}"]`);

  if (!link || !document || !window) {
    return false;
  }

  const event = document.createEvent('MouseEvent');
  event.initEvent('click', true, true);

  link.dispatchEvent(event);

  await window.__APP_ASYNC_HOOKS.calm();

  return true;
}, href);

const getSelectedTocSection = () => page.evaluate(() => {
  const tocHeader = document && Array.from(document.querySelectorAll('h2'))
    .find((node) => node.textContent === 'Table of Contents');

  const li = tocHeader && tocHeader.parentElement &&
    Array.from(tocHeader.parentElement.querySelectorAll('li'))
      .find((search) => '">"' === (window && window.getComputedStyle(search, 'before').getPropertyValue('content')));

  const a = li && li.querySelector('a');
  const href = a && a.attributes.getNamedItem('href');

  return href && href.value;
});

const isTocVisible = () => page.evaluate(() => {
  const element = document && Array.from(document.querySelectorAll('h2'))
    .find((node) => node.textContent === 'Table of Contents');
  const style = element && window && window.getComputedStyle(element);
  return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
});
