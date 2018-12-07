import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';

// jest-puppeteer will expose the `page` and `browser` globals to Jest tests.
declare global {
  var page: puppeteer.Page;
  var browser: puppeteer.Browser;
  var puppeteerConfig: {server: {port: number}};
}

if (typeof(browser) === 'undefined' || typeof(page) === 'undefined') {
  throw new Error('Browser has not been started! Did you remember to specify `@jest-environment puppeteer`?');
}

const ignoreConsoleMessages = [
  '%cDownload the React DevTools for a better development experience: https://fb.me/react-devtools font-weight:bold',
  '%cHowdy! If you want to help out, the source code can be found at https://github.com/openstax/books-web font-weight:bold', // tslint:disable-line:max-line-length
];

page.on('console', (consoleMessage) => {
  const text = consoleMessage.text();
  if (ignoreConsoleMessages.indexOf(text) === -1) {
    console.log(text); // tslint:disable-line:no-console
  }
});

// set default timeout to something quite large in CI
if (process.env.CI) {
  page.setDefaultNavigationTimeout(60000);
}

export const url = (path: string) => `http://localhost:${puppeteerConfig.server.port}/${path.replace(/^\/+/, '')}`;

export const navigate = async(target: puppeteer.Page, path: string) => {
  await target.goto(url(path));

  await target.evaluate(async() => {
    if (window && window.__APP_ASYNC_HOOKS) {
      await window.__APP_ASYNC_HOOKS.calm();
    }
  });
};

export const finishRender = async(_: puppeteer.Page) => {
  // HACK - there is no convenient way to tell if chrome is finished rendering,
  // we should investigate inconvenient possibilities.
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

// tslint:disable-next-line:no-shadowed-variable
export const getComputedStyleMap = (target: puppeteer.Page, selector: string) => target.evaluate((selector) => {
  if (window) {
    const element = window.document.querySelector(selector);
    if (!element) {
      throw new Error('BUG: element not found');
    }
    const compStyle = window.getComputedStyle(element);
    const styleMap: {[name: string]: string} = {};
    for (let index = 0; index < compStyle.length; index++) { // tslint:disable-line:prefer-for-of
      const styleName = compStyle[index];
      styleMap[styleName] = compStyle.getPropertyValue(styleName);
    }
    return styleMap;
  }
}, selector);

export const getComputedStyle = (
  target: puppeteer.Page,
  style: string,
  selector: string,
  pseudoElt: string | undefined = undefined
// tslint:disable-next-line:no-shadowed-variable
) => target.evaluate((style, selector, pseudoElt) => {
  if (window) {
    const element = window.document.querySelector(selector);
    if (!element) {
      throw new Error('BUG: element not found');
    }
    const compStyle = window.getComputedStyle(element, pseudoElt);
    return compStyle.getPropertyValue(style);
  }
}, style, selector, pseudoElt);

export const h1Content = (target: puppeteer.Page) => target.evaluate(() => {
  const h1 = document && document.querySelector('h1');
  return h1 && h1.textContent;
});

export const checkLighthouse = async(urlPath: string) => {

  const port = (new URL(browser.wsEndpoint())).port;
  const { lhr } = await lighthouse(url(urlPath), {port}, null);

  expect(lhr.categories.accessibility.score).toBeGreaterThanOrEqual(1);
  expect(lhr.categories.seo.score).toBeGreaterThanOrEqual(0.8);
  expect(lhr.categories.pwa.score).toBeGreaterThanOrEqual(0.5);
  expect(lhr.categories['best-practices'].score).toBeGreaterThanOrEqual(0.93);
  // This one depends on how fast chrome executes so maybe we should drop it
  expect(lhr.categories.performance.score).toBeGreaterThanOrEqual(0.4);
};
