import puppeteer from 'puppeteer';
import url from './url';
import { checkLighthouse, ScoreTargets } from './lighthouse';

export { checkLighthouse, url };
export type { ScoreTargets };

// jest-puppeteer will expose the `page` and `browser` globals to Jest tests.
declare global {
  // Puppeteer v13.7.0 types forbid null, but runtime requires it to disable emulation.
  var page: puppeteer.Page & { emulateMediaType(type: string | null): Promise<void> };
  var browser: puppeteer.Browser;
  var puppeteerConfig: {server: {port: number}};
}

if (typeof(browser) === 'undefined' || typeof(page) === 'undefined') {
  throw new Error('Browser has not been started! Did you remember to specify `@jest-environment puppeteer`?');
}

const ignoreConsoleMessages = [
  '%c %c %c Pixi.js 3.0.10 - ✰ WebGL ✰  %c  %c  http://www.pixijs.com/  %c %c ♥%c♥%c♥',
  '%cDownload the React DevTools for a better development experience: https://fb.me/react-devtools font-weight:bold',
  '%cHowdy! If you want to help out, the source code can be found at https://github.com/openstax/rex-web font-weight:bold',
];

page.on('console', (consoleMessage) => {
  const text = consoleMessage.text();

  if (!ignoreConsoleMessages.find((message) => message.indexOf(text) === -1)) {
    console.log(text);

  }
});

// polyfill required for MathJax 4.0.0 in older chromium
page.evaluateOnNewDocument(() => {
  if (!(Object as any).hasOwn) {
    (Object as any).hasOwn = (obj: object, prop: PropertyKey): boolean =>
      Object.prototype.hasOwnProperty.call(obj, prop);
  }
});

if (process.env.CI) {
  // set default timeout to something quite large in CI
  page.setDefaultNavigationTimeout(60 * 1000);
} else {
  page.setDefaultNavigationTimeout(90 * 1000);
}

export const desktopWidth = 1400;
export const setWideDesktopViewport = (target: puppeteer.Page) =>
  target.setViewport({height: 1074, width: desktopWidth * 2});
export const setTallerDesktopViewport = (target: puppeteer.Page) =>
  target.setViewport({height: 1074, width: desktopWidth});
export const setDesktopViewport = (target: puppeteer.Page) => target.setViewport({height: 874, width: desktopWidth});
export const setMobileViewport = (target: puppeteer.Page) => target.setViewport({height: 731, width: 411});

const calmHooks = (target: puppeteer.Page) => target.evaluate(() => {
  if (window && window.__APP_ASYNC_HOOKS) {
    return window.__APP_ASYNC_HOOKS.calm();
  }
});

export const navigate = async(target: puppeteer.Page, path: string) => {
  await target.goto(url(path));
  await calmHooks(target);
};

export const finishRender = async(page: puppeteer.Page) => {
  await page.waitForSelector('body[data-rex-loaded="true"]');

  let lastScreen: Buffer | undefined;
  let newScreen: Buffer | undefined;

  const stillChanging = async() => {
    newScreen = await page.screenshot() as Buffer;
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

/**
 * Waits until the page's scrollTop settles.
 * Returns the scrollTop value.
 *
 * Options:
 *  - sampleInterval: milliseconds between samples (default 100)
 *  - settledCount: how many consecutive identical samples to consider settled (default 3)
 */
export const getScrollTop = async(target: puppeteer.Page, { sampleInterval = 100, settledCount = 3 } = {}) => {
  let lastScrollTop;
  let same = 0;

  while (same < settledCount) {
    await new Promise((resolve) => setTimeout(resolve, sampleInterval));
    const scrollTop = await target.evaluate('document.documentElement.scrollTop');
    if (scrollTop === lastScrollTop) {
      same += 1;
    } else {
      same = 0;
      lastScrollTop = scrollTop;
    }
  }

  return lastScrollTop;
};

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
