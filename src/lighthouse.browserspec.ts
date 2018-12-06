/** @jest-environment puppeteer */
import lighthouse from 'lighthouse';
import { url } from './test/browserutils';

const TEST_PAGE = '/books/testbook1-shortid/pages/testpage1-shortid';

describe('Lighthouse audits', () => {
  const checkLighthouse = async(urlPath: string) => {

    const port = (new URL(browser.wsEndpoint())).port
    const { lhr } = await lighthouse(url(urlPath), {port}, null);

    expect(lhr.categories.accessibility.score).toBeGreaterThanOrEqual(1);
    expect(lhr.categories.seo.score).toBeGreaterThanOrEqual(0.8);
    expect(lhr.categories.pwa.score).toBeGreaterThanOrEqual(0.5);
    expect(lhr.categories['best-practices'].score).toBeGreaterThanOrEqual(0.93);
    // This one depends on how fast chrome executes so maybe we should drop it
    expect(lhr.categories.performance.score).toBeGreaterThanOrEqual(0.4);
  };

  it('reports about the root page', async() => {
    await checkLighthouse('/');
  });

  it('reports about the test content page', async() => {
    await checkLighthouse(TEST_PAGE);
  });

});
