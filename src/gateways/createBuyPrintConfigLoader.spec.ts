import Sentry from '../helpers/Sentry';
import createBuyPrintConfigLoader from './createBuyPrintConfigLoader';

jest.mock('../helpers/Sentry');

const mockFetch = (code: number, data: any) =>
  jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(data),
      status: code,
      text: () => Promise.resolve(data),
    })
  );

describe('buyPrintConfigLoader', () => {
  const fetchBackup = fetch;
  let buyPrintConfigLoader: ReturnType<typeof createBuyPrintConfigLoader>;

  beforeEach(() => {
    buyPrintConfigLoader = createBuyPrintConfigLoader('url');
  });

  afterEach(() => {
    (global as any).fetch = fetchBackup;
  });

  it('gets config', async() => {
    (global as any).fetch = mockFetch(200, {buy_urls: []});

    const config = await buyPrintConfigLoader.load({slug: 'asdf'});
    expect(fetch).toHaveBeenCalledWith('url/asdf.json');
    expect(config).toEqual({buy_urls: []});
  });

  it('gets cached config', async() => {
    (global as any).fetch = mockFetch(200, {buy_urls: []});

    await buyPrintConfigLoader.load({slug: 'qwer'});
    await buyPrintConfigLoader.load({slug: 'qwer'});

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('returns default buyPrintResponse on response error', async() => {
    (global as any).fetch = mockFetch(500, 'unexpected error');

    const response = await buyPrintConfigLoader.load({slug: 'zxcv'});

    const mockBuyPrintResponse = {
      buy_urls: [{
        allows_redirects: true,
        disclosure: null,
        provider: 'openstax_fallback',
        url: 'url/zxcv',
      }],
    };

    expect(Sentry.captureException).toHaveBeenCalledWith(
      new Error('Error response from BuyPrint 500: unexpected error')
    );
    expect(response).toEqual(mockBuyPrintResponse);
  });
});
