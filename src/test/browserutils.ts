import puppeteer from 'puppeteer';

// jest-puppeteer will expose the `page` and `browser` globals to Jest tests.
const browser = (global as any).browser as puppeteer.Browser;
const page = (global as any).page as puppeteer.Page;

if (!browser || !page) {
  throw new Error('Browser has not been started! Did you remember to specify `@jest-environment puppeteer`?');
}

export {
  browser,
  page,
};

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

const DEV_SERVER_PORT = 8000;

export const url = (path: string) => `http://localhost:${DEV_SERVER_PORT}/${path.replace(/^\/+/, '')}`;

export const navigate = async(target: puppeteer.Page, path: string) => {
  await target.goto(url(path));
  await target.evaluate(async() => {
    if (window) {
      await window.__APP_ASYNC_HOOKS.calm();
    }
  });
};

export const finishRender = async(_: puppeteer.Page) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
};
