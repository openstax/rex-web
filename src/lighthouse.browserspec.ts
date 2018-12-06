/** @jest-environment puppeteer */
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { url } from './test/browserutils';

const TEST_PAGE = '/books/testbook1-shortid/pages/testpage1-shortid';

describe('Lighthouse audits', () => {
  let chrome: chromeLauncher.LaunchedChrome | undefined;

  const checkLighthouse = async(urlPath: string) => {
    if (!chrome) {
      return expect(chrome).toBeTruthy();
    }

    const { lhr } = await lighthouse(url(urlPath), {port: chrome.port}, null);

    expect(lhr.categories.accessibility.score).toBeGreaterThanOrEqual(1);
    expect(lhr.categories.seo.score).toBeGreaterThanOrEqual(0.8);
    expect(lhr.categories.pwa.score).toBeGreaterThanOrEqual(0.5);
    expect(lhr.categories['best-practices'].score).toBeGreaterThanOrEqual(0.93);
    // This one depends on how fast chrome executes so maybe we should drop it
    expect(lhr.categories.performance.score).toBeGreaterThanOrEqual(0.4);
  };

  beforeAll(async() => {

    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless'],
    });

    // Connect to puppeteer
    // const resp = await fetch(`http://localhost:${chrome.port}/json/version`);
    // const { webSocketDebuggerUrl } = await resp.json();
    // browser = await puppeteer.connect({browserWSEndpoint: webSocketDebuggerUrl});
  });

  afterAll(async() => {
    return chrome && await chrome.kill();
  });

  it('reports about the root page', async() => {
    await checkLighthouse('/');
  });

  it('reports about the test content page', async() => {
    await checkLighthouse(TEST_PAGE);
  });

});
