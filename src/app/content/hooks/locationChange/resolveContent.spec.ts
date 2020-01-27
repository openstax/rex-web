import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, page } from '../../../../test/mocks/archiveLoader';
import { resetModules } from '../../../../test/utils';
import { Match } from '../../../navigation/types';
import { MiddlewareAPI, Store } from '../../../types';
import * as actions from '../../actions';
import * as routes from '../../routes';
import { Params } from '../../types';
import { resolveBookReference } from './resolveContent';

const mockConfig = {BOOKS: {
 [book.id]: {defaultVersion: book.version},
} as {[key: string]: {defaultVersion: string}}};

const testBookSlug = 'book-slug-1';
const testUUID = 'longidin-vali-dfor-mat1-111111111111';
const testPage = 'test-page-1';

describe('locationChange', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let match: Match<typeof routes.content>;
  let hook: typeof import ('./resolveContent').default;

  const mockUUIDBook = () => {
    const uuidBook = {
      ...book,
      id: testUUID,
      version: '1.0',
    };
    helpers.archiveLoader.mockBook(uuidBook);
    helpers.archiveLoader.mockPage(uuidBook, page, 'test-page-1');
  };

  beforeEach(() => {
    resetModules();
    store = createTestStore();
    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    match = {
      params: {
        book: 'book-slug-1',
        page: testPage,
      },
      route: routes.content,
    };

    hook = require('./resolveContent').default;
  });

  describe('in development', () => {
    jest.doMock('../../../../config', () => ({...mockConfig, APP_ENV: 'development'}));

    it('doesn\'t load book if its already loading', async() => {
      helpers.archiveLoader.mock.loadBook.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(book), 100))
      );

      await Promise.all([
        hook(helpers, match),
        hook(helpers, match),
        hook(helpers, match),
      ]);
      expect(dispatch).toHaveBeenCalledTimes(4);
      expect(dispatch).toHaveBeenNthCalledWith(1, actions.requestBook({book: testBookSlug, page: testPage}));
      expect(dispatch).toHaveBeenNthCalledWith(2, actions.receiveBook(expect.anything()));
      expect(dispatch).toHaveBeenNthCalledWith(3, actions.requestPage('test-page-1'));
      expect(dispatch).toHaveBeenNthCalledWith(4, actions.receivePage(expect.anything()));
    });

    it('doesn\'t load page if its already loading', async() => {
      await Promise.all([
        hook(helpers, match),
        hook(helpers, match),
        hook(helpers, match),
        hook(helpers, match),
      ]);

      expect(dispatch).toHaveBeenCalledTimes(4);
      expect(dispatch).toHaveBeenNthCalledWith(1, actions.requestBook({book: testBookSlug, page: testPage}));
      expect(dispatch).toHaveBeenNthCalledWith(2, actions.receiveBook(expect.anything()));
      expect(dispatch).toHaveBeenNthCalledWith(3, actions.requestPage('test-page-1'));
      expect(dispatch).toHaveBeenNthCalledWith(4, actions.receivePage(expect.anything()));

      expect(helpers.archiveLoader.mock.loadPage).toHaveBeenCalledTimes(1);
    });

    it('doesn\'t query book slug when already loaded', async() => {
      mockUUIDBook();
      match.params = {
        page: testPage,
        uuid: testUUID,
        version: '1.0',
      };
      await hook(helpers, match);
      await hook(helpers, match);

      const getBookSlugFromId = jest.spyOn(helpers.osWebLoader, 'getBookSlugFromId');

      expect(getBookSlugFromId).toHaveBeenCalledTimes(1);
    });

    it('uses param version if there is one', async() => {
      const versionedSlugParams = {
        ...match.params,
        version: 'asdf',
      } as Params;

      match.params = versionedSlugParams;

      helpers.archiveLoader.mockBook({
        ...book,
        version: 'asdf',
      });
      helpers.archiveLoader.mockPage({
        ...book,
        version: 'asdf',
      }, page, 'test-page-1');
      await hook(helpers, match);
      expect(helpers.archiveLoader.mock.loadBook).toHaveBeenCalledWith('testbook1-uuid', 'asdf');
    });

    it('uses latest version if requested', async() => {
      const versionedSlugParams = {
        ...match.params,
        version: 'latest',
      } as Params;

      match.params = versionedSlugParams;
      helpers.archiveLoader.mockBook({
        ...book,
        version: undefined as any as string,
      });
      helpers.archiveLoader.mockPage({
        ...book,
        version: undefined as any as string,
      }, page, 'test-page-1');
      await hook(helpers, match);
      expect(helpers.archiveLoader.mock.loadBook).toHaveBeenCalledWith('testbook1-uuid', undefined);
    });

    it('uses uuid if present', async() => {
      helpers.osWebLoader.getBookSlugFromId.mockImplementation(() => Promise.resolve(undefined) as any);
      const versionedUuidParams = {
        page: match.params.page,
        uuid: testUUID,
        version: '1.0',
      } as Params;

      mockUUIDBook();

      match.params = versionedUuidParams;
      await hook(helpers, match);
      expect(helpers.archiveLoader.mock.loadBook).toHaveBeenCalledWith('longidin-vali-dfor-mat1-111111111111', '1.0');
    });

    it('throws if there is no uuid', async() => {
      helpers.osWebLoader.getBookIdFromSlug.mockImplementation(() => Promise.resolve(undefined) as any);

      await expect(
        resolveBookReference(helpers, match)
      ).rejects.toThrow(`Could not resolve uuid for slug: ${testBookSlug}`);
    });
  });

  describe('in production', () => {
    beforeAll(() => {
      jest.doMock('../../../../config', () => ({...mockConfig, APP_ENV: 'production'}));
    });

    it('throws if book is missing cms data in production', async() => {
      helpers.osWebLoader.getBookSlugFromId.mockImplementation(() => Promise.resolve(undefined) as any);
      mockUUIDBook();

      const versionedUuidParams = {
        page: match.params.page,
        uuid: testUUID,
        version: '1.0',
      } as Params;
      match.params = versionedUuidParams;

      await expect(
         hook(helpers, match)
      ).rejects.toThrow('books without cms data are only supported outside production');
    });
  });
});
