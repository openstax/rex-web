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

export const desktopWidth = 1250;
export const setWideDesktopViewport = (target: puppeteer.Page) =>
  target.setViewport({height: 1074, width: desktopWidth * 2});
export const setTallerDesktopViewport = (target: puppeteer.Page) =>
  target.setViewport({height: 1074, width: desktopWidth});
export const setDesktopViewport = (target: puppeteer.Page) => target.setViewport({height: 874, width: desktopWidth});
export const setMobileViewport = (target: puppeteer.Page) => target.setViewport({height: 731, width: 411});

export const url = (path: string) => `http://localhost:${puppeteerConfig.server.port}/${path.replace(/^\/+/, '')}`;

const calmHooks = (target: puppeteer.Page) => target.evaluate(() => {
  if (window && window.__APP_ASYNC_HOOKS) {
    return window.__APP_ASYNC_HOOKS.calm();
  }
});

export const navigate = async(target: puppeteer.Page, path: string) => {
  await target.goto(url(path));
  await calmHooks(target);
};

export const finishRender = async(target: puppeteer.Page) => {
  const screenshot = (): Buffer => target.screenshot() as unknown as Buffer;

  let lastScreen: Buffer | undefined;
  let newScreen: Buffer | undefined;

  const stillChanging = async() => {
    newScreen = await screenshot();
    return !lastScreen || !lastScreen.equals(newScreen);
  };

  while (await stillChanging()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    lastScreen = newScreen;
  }
};

export const scrollDown = (target: puppeteer.Page) => target.evaluate(() => {
  return window && window.scrollBy(0, window.innerHeight);
});
export const scrollUp = (target: puppeteer.Page) => target.evaluate(() => {
  return window && window.scrollBy(0, -1 * window.innerHeight);
});

export const fullPageScreenshot = async(target: puppeteer.Page) => {
  await finishRender(target);
  await scrollUp(target);

  const bodyHandle = await target.$('body');

  if (!bodyHandle) {
    throw new Error('couldn\'t find page body');
  }

  const box = await bodyHandle.boundingBox();

  if (!box) {
    throw new Error('couldn\'t find bounding box for body');
  }

  const { width, height } = box;
  const screen = await target.screenshot({
    clip: {
      height,
      width,
      x: 0,
      y: 0,
    },
  });
  await bodyHandle.dispose();

  return screen;
};

export const h1Content = (target: puppeteer.Page) => target.evaluate(() => {
  const h1 = document && document.querySelector('h1');
  return h1 && h1.textContent;
});

export const checkLighthouse = async(target: puppeteer.Browser, urlPath: string) => {

  const port = Number((new URL(target.wsEndpoint())).port);
  const { lhr } = await lighthouse(url(urlPath), {port}, lighthouseConfig);

  expect(lhr.categories.customAccessibility.score).toBeGreaterThanOrEqual(1);
  expect(lhr.categories.accessibility.score).toBeGreaterThanOrEqual(1);
  expect(lhr.categories.seo.score).toBeGreaterThanOrEqual(0.69);
  expect(lhr.categories['best-practices'].score).toBeGreaterThanOrEqual(0.79);
};
