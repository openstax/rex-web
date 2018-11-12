const mockFetch = (code: number, data: any) => jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(data),
  status: code,
  text: () => Promise.resolve(data),
}));

describe('archiveLoader', () => {
  const fetchBackup = fetch;
  const archiveUrlBackup = process.env.REACT_APP_ARCHIVE_URL;

  afterEach(() => {
    jest.resetModules();
    (global as any).fetch = fetchBackup;
    process.env.REACT_APP_ARCHIVE_URL = archiveUrlBackup;
  });

  it('requests data from archive url', () => {
    process.env.REACT_APP_ARCHIVE_URL = 'url/';
    (global as any).fetch = mockFetch(200, {some: 'data'});
    const archiveLoader = require('./utils').archiveLoader;

    archiveLoader('coolid');

    expect(fetch).toHaveBeenCalledWith('url/coolid');
  });

  it('memoizes requests', () => {
    process.env.REACT_APP_ARCHIVE_URL = 'url/';
    (global as any).fetch = mockFetch(200, {some: 'data'});
    const archiveLoader = require('./utils').archiveLoader;

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
    const archiveLoader = require('./utils').archiveLoader;

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
