import { resetModules } from '../test/utils';
import createArchiveLoader from './createArchiveLoader';

const mockFetch = (code: number, data: any) => jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(data),
  status: code,
  text: () => Promise.resolve(data),
}));

describe('archiveLoader', () => {
  const fetchBackup = fetch;

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
        const booksConfig = {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}};
        createArchiveLoader().book('coolid', {booksConfig}).load();
        expect(fetch).toHaveBeenCalledWith('/test/archive/contents/coolid@version.json');
      });

      it('uses pinned archive path for book', () => {
        const booksConfig = {
          archiveUrl: '/test/archive',
          books: {pinnedbook: {defaultVersion: 'version', archiveOverride: '/test/override'}},
        };
        createArchiveLoader().book('pinnedbook', {booksConfig}).load();
        expect(fetch).toHaveBeenCalledWith('/test/override/contents/pinnedbook@version.json');
      });

      it('ignores pinned archive path for book when disablePerBookPinning is passed', () => {
        const booksConfig = {
          archiveUrl: '/test/archive',
          books: {pinnedbook: {defaultVersion: 'version', archiveOverride: '/test/override'}},
        };
        createArchiveLoader({disablePerBookPinning: true})
          .book('pinnedbook', {booksConfig}).load();
        expect(fetch).not.toHaveBeenCalledWith('/test/override/contents/pinnedbook@version.json');
        expect(fetch).toHaveBeenCalledWith('/test/archive/contents/pinnedbook@version.json');
      });

      it('requests data from archive url for page', () => {
        const booksConfig = {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}};
        createArchiveLoader().book('coolid', {booksConfig}).page('coolpageid').load();

        expect(fetch).toHaveBeenCalledWith('/test/archive/contents/coolid@version:coolpageid.json');
      });

      it('returns cached book data', async() => {
        (global as any).fetch = mockFetch(200, {version: 'version', id: 'coolid'});
        const archiveLoader = createArchiveLoader();
        const booksConfig = {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}};
        const one = await archiveLoader.book('coolid', {booksConfig}).load();
        const two = archiveLoader.book('coolid', {booksConfig}).cached();
        const three = archiveLoader.forBook(one).cached();

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(two).toBe(three);
        expect(three).toBe(one);
      });

      it('returns cached page data', async() => {
        const archiveLoader = createArchiveLoader();
        const booksConfig = {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}};
        const one = await archiveLoader.book('coolid', {booksConfig}).page('coolpageid').load();
        const two = archiveLoader.book('coolid', {booksConfig}).page('coolpageid').cached();

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(two).toBe(one);
      });

      it('returns versioned book data', async() => {
        const booksConfig = {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}};
        createArchiveLoader().book('coolid', {booksConfig}).load();
        expect(fetch).toHaveBeenCalledWith('/test/archive/contents/coolid@version.json');
      });

      it('returns versioned page data', async() => {
        const booksConfig = {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}};
        await createArchiveLoader().book('coolid', {booksConfig}).page('pageid').load();

        expect(fetch).toHaveBeenCalledWith('/test/archive/contents/coolid@version:pageid.json');
      });

      it('memoizes requests', async() => {
        const archiveLoader = createArchiveLoader();
        const booksConfig = {
          archiveUrl: '/test/archive',
          books: {
            coolid: {defaultVersion: 'version'},
            coolid1: {defaultVersion: 'version'},
            coolid2: {defaultVersion: 'version'},
          },
        };
        await archiveLoader.book('coolid', {booksConfig}).load();
        await archiveLoader.book('coolid2', {booksConfig}).load();
        await archiveLoader.book('coolid', {booksConfig}).load();
        await archiveLoader.book('coolid1', {booksConfig}).load();
        await archiveLoader.book('coolid', {booksConfig}).load();
        await archiveLoader.book('coolid2', {booksConfig}).load();

        expect(fetch).toHaveBeenCalledTimes(3);
      });

      it('returns original content url', async() => {
        expect(createArchiveLoader().book('coolid', {
          booksConfig: {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}},
        }).page('pageid').url())
          .toEqual('/test/archive/contents/coolid@version:pageid.json');
      });
    });

    it('returns error', async() => {
      (global as any).fetch = mockFetch(404, 'not found');
      let error: Error | null = null;

      try {
        await createArchiveLoader().book('coolid', {
          booksConfig: {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}},
        }).load();
      } catch (e) {
        error = e;
      }

      if (error) {
        expect(error.message).toEqual(
          'Error response from archive "/test/archive/contents/coolid@version.json" 404: not found'
        );
      } else {
        expect(error).toBeTruthy();
      }
    });
  });
});
