import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';
import * as lighthouseConfig from './audits';

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
  '%c %c %c Pixi.js 3.0.10 - ✰ WebGL ✰  %c  %c  http://www.pixijs.com/  %c %c ♥%c♥%c♥',
  '%cDownload the React DevTools for a better development experience: https://fb.me/react-devtools font-weight:bold',
  '%cHowdy! If you want to help out, the source code can be found at https://github.com/openstax/rex-web font-weight:bold', // tslint:disable-line:max-line-length
];

page.on('console', (consoleMessage) => {
  const text = consoleMessage.text();

  if (!ignoreConsoleMessages.find((message) => message.indexOf(text) === -1)) {
    console.log(text); // tslint:disable-line:no-console
  }
});

if (process.env.CI) {
  // set default timeout to something quite large in CI
  page.setDefaultNavigationTimeout(60 * 1000);
} else {
  page.setDefaultNavigationTimeout(90 * 1000);
}

export const setDesktopViewport = (target: puppeteer.Page) => target.setViewport({height: 874, width: 1200});
export const setMobileViewport = (target: puppeteer.Page) => target.setViewport({height: 731, width: 411});

export const url = (path: string) => `http://localhost:${puppeteerConfig.server.port}/${path.replace(/^\/+/, '')}`;

const calmHooks = (target: puppeteer.Page) => target.evaluate(() => {
  if (window && window.__APP_ASYNC_HOOKS) {
    return window.__APP_ASYNC_HOOKS.calm();
  }
});

export const setMaxViewport = async(target: puppeteer.Page) => {
  const width = await target.evaluate(() => document && document.body.offsetWidth);
  const height = await target.evaluate(() => document && document.body.offsetHeight);

  await target.setViewport({width, height});
};

export const navigate = async(target: puppeteer.Page, path: string) => {
  await target.goto(url(path));
  await calmHooks(target);
};

export const finishRender = async(target: puppeteer.Page) => {
  const {width, height} = target.viewport();
  await setMaxViewport(target);

  const screenshot = () => target.screenshot({fullPage: true});

  let lastScreen: Buffer | undefined;
  let newScreen: Buffer | undefined;

  const stillChanging = async() => {
    newScreen = await screenshot();
    return !lastScreen || !lastScreen.equals(newScreen);
  };

  while (await stillChanging()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    lastScreen = newScreen;
  }

  await target.setViewport({width, height});
};

export const fullPageScreenshot = async(target: puppeteer.Page) => {
  const {width, height} = target.viewport();
  await finishRender(target);
  await setMaxViewport(target);
  await finishRender(target);
  const screen = await target.screenshot({fullPage: true});

  await target.setViewport({width, height});

  return screen;
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

export const checkLighthouse = async(target: puppeteer.Browser, urlPath: string) => {

  const port = (new URL(target.wsEndpoint())).port;
  const { lhr } = await lighthouse(url(urlPath), {port}, lighthouseConfig);

  expect(lhr.categories.customAccessibility.score).toBeGreaterThanOrEqual(1);
  expect(lhr.categories.accessibility.score).toBeGreaterThanOrEqual(1);
  expect(lhr.categories.seo.score).toBeGreaterThanOrEqual(0.8);
  expect(lhr.categories['best-practices'].score).toBeGreaterThanOrEqual(0.93);
};
