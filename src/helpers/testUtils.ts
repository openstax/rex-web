import puppeteer from 'puppeteer';

// jest-puppeteer will expose the `page` and `browser` globals to Jest tests.
const browser = (global as any).browser as puppeteer.Browser;
const page = (global as any).page as puppeteer.Page;

export {
  browser,
  page,
};

const DEV_SERVER_PORT = 8000;

export const url = (path: string) => `http://localhost:${DEV_SERVER_PORT}/${path}`;
