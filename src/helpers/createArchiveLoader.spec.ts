const mockFetch = (code: number, data: any) => jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(data),
  status: code,
  text: () => Promise.resolve(data),
}));

describe('archiveLoader', () => {
  const fetchBackup = fetch;

  afterEach(() => {
    jest.resetModules();
    (global as any).fetch = fetchBackup;
  });

  it('requests data from archive url', () => {
    (global as any).fetch = mockFetch(200, {some: 'data'});
    const archiveLoader = require('./createArchiveLoader').default('url/');

    archiveLoader('coolid');

    expect(fetch).toHaveBeenCalledWith('url/coolid');
  });

  it('memoizes requests', () => {
    (global as any).fetch = mockFetch(200, {some: 'data'});
    const archiveLoader = require('./createArchiveLoader').default('url/');

    archiveLoader('coolid');
    archiveLoader('coolid2');
    archiveLoader('coolid');
    archiveLoader('coolid1');
    archiveLoader('coolid');
    archiveLoader('coolid2');

    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('returns error', async() => {
    (global as any).fetch = mockFetch(404, 'not found');
    const archiveLoader = require('./createArchiveLoader').default('url/');

    let error: Error | null = null;

    try {
      await archiveLoader('coolid');
    } catch (e) {
      error = e;
    }

    if (error) {
      expect(error.message).toEqual('Error response from archive 404: not found');
    } else {
      expect(error).toBeTruthy();
    }
  });
});

export default undefined;
