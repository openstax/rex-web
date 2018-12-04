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

  it('requests data from archive url for book', () => {
    (global as any).fetch = mockFetch(200, {some: 'data'});
    const archiveLoader = require('./createArchiveLoader').default('url/');

    archiveLoader.book('coolid');

    expect(fetch).toHaveBeenCalledWith('url/coolid');
  });

  it('requests data from archive url for page', () => {
    (global as any).fetch = mockFetch(200, {some: 'data'});
    const archiveLoader = require('./createArchiveLoader').default('url/');

    archiveLoader.page('coolid', 'coolpageid');

    expect(fetch).toHaveBeenCalledWith('url/coolid:coolpageid');
  });

  it('returns cached book data', async() => {
    (global as any).fetch = mockFetch(200, {some: 'data'});
    const archiveLoader = require('./createArchiveLoader').default('url/');

    const one = await archiveLoader.book('coolid');
    const two = archiveLoader.cachedBook('coolid');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(two).toBe(one);
  });

  it('returns cached page data', async() => {
    (global as any).fetch = mockFetch(200, {some: 'data'});
    const archiveLoader = require('./createArchiveLoader').default('url/');

    const one = await archiveLoader.page('coolid', 'coolpageid');
    const two = archiveLoader.cachedPage('coolid', 'coolpageid');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(two).toBe(one);
  });

  it('memoizes requests', () => {
    (global as any).fetch = mockFetch(200, {some: 'data'});
    const archiveLoader = require('./createArchiveLoader').default('url/');

    archiveLoader.book('coolid');
    archiveLoader.book('coolid2');
    archiveLoader.book('coolid');
    archiveLoader.book('coolid1');
    archiveLoader.book('coolid');
    archiveLoader.book('coolid2');

    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('returns error', async() => {
    (global as any).fetch = mockFetch(404, 'not found');
    const archiveLoader = require('./createArchiveLoader').default('url/');

    let error: Error | null = null;

    try {
      await archiveLoader.book('coolid');
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
