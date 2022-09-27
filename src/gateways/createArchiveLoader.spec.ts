import { VersionedArchiveBookWithConfig } from '../app/content/types';
import { resetModules } from '../test/utils';

const mockFetch = (code: number, data: any) => jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(data),
  status: code,
  text: () => Promise.resolve(data),
}));

const createArchiveLoader: typeof import ('./createArchiveLoader').default = (...args) => {
  return require('./createArchiveLoader').default(...args);
};

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
        createArchiveLoader().book('coolid', {contentVersion: 'otherversion', booksConfig}).load();
        expect(fetch).toHaveBeenCalledWith('/test/archive/contents/coolid@otherversion.json');
      });

      it('returns alternate archive version', async() => {
        const booksConfig = {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}};
        createArchiveLoader().book('coolid', {archiveVersion: 'otherversion', booksConfig}).load();
        expect(fetch).toHaveBeenCalledWith('/apps/archive/otherversion/contents/coolid@version.json');
      });

      it('returns versioned page data', async() => {
        const booksConfig = {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}};
        await createArchiveLoader().book('coolid', {contentVersion: 'otherversion', booksConfig}).page('pageid').load();

        expect(fetch).toHaveBeenCalledWith('/test/archive/contents/coolid@otherversion:pageid.json');
      });

      it('fromBook respects config if no explicit versions are passed', async() => {
        const booksConfig = {archiveUrl: '/test/archive', books: {
          coolid1: {defaultVersion: 'version1'},
          coolid2: {defaultVersion: 'version2'},
        }};
        createArchiveLoader().fromBook({
          archiveVersion: '/test/archive',
          contentVersion: 'version1',
          id: 'coolid1',
          language: 'en',
          license: {name: 'drivers', url: 'https://dmv.gov', version: 'car'},
          loadOptions: {booksConfig},
          revised: 'never',
          title: 'foo',
          tree: {contents: [], id: 'coolid1@', title: 'foo', slug: 'foo'},
          version: '1',
        } as VersionedArchiveBookWithConfig, 'coolid2').load();
        expect(fetch).toHaveBeenCalledWith('/test/archive/contents/coolid2@version2.json');
      });

      it('fromBook uses explicit versions over config, even if they match the config', async() => {
        const booksConfig = {archiveUrl: '/test/archive', books: {
          coolid1: {defaultVersion: 'version1'},
          coolid2: {defaultVersion: 'version2'},
        }};
        createArchiveLoader().fromBook({
          archiveVersion: '/test/archive',
          contentVersion: 'version1',
          id: 'coolid1',
          language: 'en',
          license: {name: 'drivers', url: 'https://dmv.gov', version: 'car'},
          loadOptions: {booksConfig, contentVersion: 'version1'},
          revised: 'never',
          title: 'foo',
          tree: {contents: [], id: 'coolid1@', title: 'foo', slug: 'foo'},
          version: '1',
        } as VersionedArchiveBookWithConfig, 'coolid2').load();
        expect(fetch).toHaveBeenCalledWith('/test/archive/contents/coolid2@version1.json');
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

      it('returns original book url', async() => {
        const booksConfig = {
          archiveUrl: '/test/archive',
          books: {coolid: {defaultVersion: 'version'}},
        };
        expect(createArchiveLoader().book('coolid', {booksConfig}).url())
          .toEqual('/test/archive/contents/coolid@version.json');
      });

      it('returns original content url', async() => {
        expect(createArchiveLoader().book('coolid', {
          booksConfig: {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}},
        }).page('pageid').url())
          .toEqual('/test/archive/contents/coolid@version:pageid.json');
      });

      describe('with archive override', () => {

        beforeEach(() => {
          jest.doMock('../config', () => ({
            ...jest.requireActual('../config'),
            REACT_APP_ARCHIVE_URL_OVERRIDE: '/apps/archive/coolarchive',
          }));
        });

        afterEach(() => {
          jest.unmock('../config');
        });

        it('uses override', async() => {
          const booksConfig = {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}};
          await createArchiveLoader().book('coolid', {booksConfig}).page('pageid').load();

          expect(fetch).toHaveBeenCalledWith('/apps/archive/coolarchive/contents/coolid@version:pageid.json');
        });

        it('uses both override and given version', async() => {
          const booksConfig = {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}};
          await createArchiveLoader().book('coolid', {archiveVersion: 'otherversion', booksConfig})
            .page('pageid').load();

          expect(fetch)
            .toHaveBeenCalledWith('/apps/archive/coolarchive/otherversion/contents/coolid@version:pageid.json');
        });
      });
    });

    describe('returns error', () => {
      it('when there is no version', async() => {
        let error: Error | null = null;

        try {
          await createArchiveLoader().book('uncoolid', {
            booksConfig: {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}},
          }).load();
        } catch (e) {
          error = e;
        }

        if (error) {
          expect(error.message).toEqual(
            'Could not resolve version for book: uncoolid'
          );
        } else {
          expect(error).toBeTruthy();
        }
      });
      it('when archive 404s', async() => {
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

  describe('resource loader', () => {
    describe('when successful', () => {
      beforeEach(() => {
        (global as any).fetch = mockFetch(200, {some: 'data'});
      });

      it('requests data from archive url for resource', () => {
        const booksConfig = {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}};
        createArchiveLoader().resource('coolid', {booksConfig}).load();
        expect(fetch).toHaveBeenCalledWith('/test/archive/resources/coolid');
      });

      it('returns cached resource data', async() => {
        (global as any).fetch = mockFetch(200, {version: 'version', id: 'coolid'});
        const archiveLoader = createArchiveLoader();
        const booksConfig = {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}};
        const one = await archiveLoader.resource('coolid', {booksConfig}).load();
        const two = archiveLoader.resource('coolid', {booksConfig}).cached();

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(two).toBe(one);
      });

      it('returns alternate archive version', async() => {
        const booksConfig = {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}};
        createArchiveLoader().resource('coolid', {archiveVersion: 'otherversion', booksConfig}).load();
        expect(fetch).toHaveBeenCalledWith('/apps/archive/otherversion/resources/coolid');
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
        await archiveLoader.resource('coolid', {booksConfig}).load();
        await archiveLoader.resource('coolid2', {booksConfig}).load();
        await archiveLoader.resource('coolid', {booksConfig}).load();
        await archiveLoader.resource('coolid1', {booksConfig}).load();
        await archiveLoader.resource('coolid', {booksConfig}).load();
        await archiveLoader.resource('coolid2', {booksConfig}).load();

        expect(fetch).toHaveBeenCalledTimes(3);
      });

      it('returns original resource url', async() => {
        const booksConfig = {
          archiveUrl: '/test/archive',
          books: {coolid: {defaultVersion: 'version'}},
        };
        expect(createArchiveLoader().resource('coolid', {booksConfig}).url())
          .toEqual('/test/archive/resources/coolid');
      });

      describe('with archive override', () => {

        beforeEach(() => {
          jest.doMock('../config', () => ({
            ...jest.requireActual('../config'),
            REACT_APP_ARCHIVE_URL_OVERRIDE: '/apps/archive/coolarchive',
          }));
        });

        afterEach(() => {
          jest.unmock('../config');
        });

        it('uses override', async() => {
          const booksConfig = {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}};
          await createArchiveLoader().resource('coolid', {booksConfig}).load();

          expect(fetch).toHaveBeenCalledWith('/apps/archive/coolarchive/resources/coolid');
        });
      });
    });

    describe('returns error', () => {
      it('when there is no version', async() => {
        let error: Error | null = null;

        try {
          await createArchiveLoader().book('uncoolid', {
            booksConfig: {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}},
          }).load();
        } catch (e) {
          error = e;
        }

        if (error) {
          expect(error.message).toEqual(
            'Could not resolve version for book: uncoolid'
          );
        } else {
          expect(error).toBeTruthy();
        }
      });

      it('when book 404s', async() => {
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

      it('when resource 404s', async() => {
        (global as any).fetch = mockFetch(404, 'not found');
        let error: Error | null = null;

        try {
          await createArchiveLoader().resource('coolid', {
            booksConfig: {archiveUrl: '/test/archive', books: {coolid: {defaultVersion: 'version'}}},
          }).load();
        } catch (e) {
          error = e;
        }

        if (error) {
          expect(error.message).toEqual(
            'Error response from archive "/test/archive/resources/coolid" 404: not found'
          );
        } else {
          expect(error).toBeTruthy();
        }
      });
    });
  });
});
