import { AppServices } from '../app/types';
import { resetModules } from '../test/utils';

const mockFetch = (code: number, data: any) => jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(data),
  status: code,
  text: () => Promise.resolve(data),
}));

describe('archiveLoader', () => {
  const fetchBackup = fetch;
  let archiveLoader: AppServices['archiveLoader'];

  beforeEach(() => {
    archiveLoader = require('./createArchiveLoader').default('url');
  });

  afterEach(() => {
    resetModules();
    (global as any).fetch = fetchBackup;
  });

  describe('book loader', () => {
    describe('when successful', () => {
      beforeEach(() => {
        (global as any).fetch = mockFetch(200, {some: 'data'});
      });

      it('requests data from archive url for book', () => {
        archiveLoader.book('coolid', 'version').load();

        expect(fetch).toHaveBeenCalledWith('url/contents/coolid@version.json');
      });

      it('requests data from archive url for page', () => {
        archiveLoader.book('coolid', 'version').page('coolpageid').load();

        expect(fetch).toHaveBeenCalledWith('url/contents/coolid@version:coolpageid.json');
      });

      it('returns cached book data', async() => {
        const one = await archiveLoader.book('coolid', 'version').load();
        const two = archiveLoader.book('coolid', 'version').cached();

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(two).toBe(one);
      });

      it('returns cached page data', async() => {
        const one = await archiveLoader.book('coolid', 'version').page('coolpageid').load();
        const two = archiveLoader.book('coolid', 'version').page('coolpageid').cached();

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(two).toBe(one);
      });

      it('returns versioned book data', async() => {
        await archiveLoader.book('coolid', 'version').load();

        expect(fetch).toHaveBeenCalledWith('url/contents/coolid@version.json');
      });

      it('returns versioned page data', async() => {
        await archiveLoader.book('coolid', 'version').page('pageid').load();

        expect(fetch).toHaveBeenCalledWith('url/contents/coolid@version:pageid.json');
      });

      it('memoizes requests', async() => {
        await archiveLoader.book('coolid', 'version').load();
        await archiveLoader.book('coolid2', 'version').load();
        await archiveLoader.book('coolid', 'version').load();
        await archiveLoader.book('coolid1', 'version').load();
        await archiveLoader.book('coolid', 'version').load();
        await archiveLoader.book('coolid2', 'version').load();

        expect(fetch).toHaveBeenCalledTimes(3);
      });

      it('returns original content url', async() => {
        expect(archiveLoader.book('coolid', 'version').page('pageid').url())
          .toEqual('url/contents/coolid@version:pageid.json');
      });
    });

    it('returns error', async() => {
      (global as any).fetch = mockFetch(404, 'not found');
      let error: Error | null = null;

      try {
        await archiveLoader.book('coolid', 'version').load();
      } catch (e) {
        error = e;
      }

      if (error) {
        expect(error.message).toEqual('Error response from archive "url/contents/coolid@version.json" 404: not found');
      } else {
        expect(error).toBeTruthy();
      }
    });
  });
});
