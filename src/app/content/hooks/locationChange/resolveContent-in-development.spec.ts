import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, page } from '../../../../test/mocks/archiveLoader';
import { Match } from '../../../navigation/types';
import { MiddlewareAPI, Store } from '../../../types';
import * as actions from '../../actions';
import * as routes from '../../routes';
import { Book, Params, SlugParams } from '../../types';
import * as resolveContentUtils from './resolveContent';

jest.mock('../../utils/processBrowserRedirect');
jest.mock('../../../../config', () => ({
  APP_ENV: 'development',
  UNLIMITED_CONTENT: true,
}));

const testBookSlug = 'book-slug-1';
const testUUID = '13ac107a-f15f-49d2-97e8-60ab2e3abcde';
const testVersion = '1.0';
const testPage = 'test-page-1';

describe('locationChange', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let match: Match<typeof routes.content>;
  let hook: typeof import ('./resolveContent').default;
  let resolveExternalBookReference: typeof import ('./resolveContent').resolveExternalBookReference;

  const mockUUIDBook = () => {
    const uuidBook = {
      ...book,
      id: testUUID,
      version: '1.0',
    };
    helpers.archiveLoader.mockBook(uuidBook);
    helpers.archiveLoader.mockPage(uuidBook, page, testPage);
  };

  const mockOtherBook = {
    abstract: '',
    archiveVersion: '/test/archive-vesrion',
    contentVersion: '0',
    id: '13ac107a-f15f-49d2-97e8-60ab2e3other',
    language: 'en',
    license: {name: '', version: '', url: ''},
    loadOptions: {
      booksConfig: {
        archiveUrl: '/test/archive-version',
        books: {},
      },
    },
    revised: '2012-06-21',
    title: 'newbook',
    tree: {
      contents: [],
      id: '13ac107a-f15f-49d2-97e8-60ab2e3other@0',
      slug: 'newbook',
      title: 'newbook',
    },
    version: '0',
  };
  const mockPageInOtherBook = {
    abstract: '',
    content: 'dope content bruh',
    id: '99d38770-49c7-49d3-b567-88f393ffb4fe',
    revised: '2018-07-30T15:58:45Z',
    slug: 'page-in-a-new-book',
    title: 'page in a new book',
  };

  beforeEach(() => {
    store = createTestStore();
    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    helpers.bookConfigLoader.localBookConfig[testUUID] = {defaultVersion: testVersion};

    match = {
      params: {
        book: {
          slug: 'book-slug-1',
        },
        page : {
          slug: testPage,
        },
      },
      route: routes.content,
      state: {},
    };

    const resolveContent = require('./resolveContent');
    hook = resolveContent.default;
    resolveExternalBookReference = resolveContent.resolveExternalBookReference;
  });

  describe('in development', () => {
    it('doesn\'t load book if its already loading', async() => {
      helpers.archiveLoader.mock.loadBook.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(book), 100))
      );
      helpers.archiveLoader.mock.loadPage.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(page), 100))
      );

      await Promise.all([
        hook(helpers, match),
        hook(helpers, match),
        hook(helpers, match),
      ]);
      expect(dispatch).toHaveBeenCalledTimes(4);
      expect(dispatch).toHaveBeenNthCalledWith(1, actions.requestBook({slug: testBookSlug}));
      expect(dispatch).toHaveBeenNthCalledWith(2, actions.receiveBook(expect.anything()));
      expect(dispatch).toHaveBeenNthCalledWith(3, actions.requestPage({slug: testPage}));
      expect(dispatch).toHaveBeenNthCalledWith(4, actions.receivePage(expect.anything()));
    });

    it('doesn\'t load page if its already loading', async() => {
      helpers.archiveLoader.mock.loadBook.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(book), 100))
      );
      helpers.archiveLoader.mock.loadPage.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(page), 100))
      );

      await Promise.all([
        hook(helpers, match),
        hook(helpers, match),
        hook(helpers, match),
        hook(helpers, match),
      ]);

      expect(dispatch).toHaveBeenCalledTimes(4);
      expect(dispatch).toHaveBeenNthCalledWith(1, actions.requestBook({slug: testBookSlug}));
      expect(dispatch).toHaveBeenNthCalledWith(2, actions.receiveBook(expect.anything()));
      expect(dispatch).toHaveBeenNthCalledWith(3, actions.requestPage({slug: testPage}));
      expect(dispatch).toHaveBeenNthCalledWith(4, actions.receivePage(expect.anything()));

      expect(helpers.archiveLoader.mock.loadPage).toHaveBeenCalledTimes(1);
    });

    it('doesn\'t query book slug when already loaded', async() => {
      mockUUIDBook();
      match.params = {
        book: {
          contentVersion: testVersion,
          uuid: testUUID,
        },
        page: {
          slug: testPage,
        },
      };
      await hook(helpers, match);
      await hook(helpers, match);

      const getBookSlugFromId = jest.spyOn(helpers.osWebLoader, 'getBookSlugFromId');

      expect(getBookSlugFromId).toHaveBeenCalledTimes(0);
    });

    it('uses param version if there is one', async() => {
      const versionedSlugParams = {
        ...match.params,
        book: {
          ...match.params.book,
          contentVersion: 'asdf',
        },
      } as Params;

      match.params = versionedSlugParams;

      helpers.archiveLoader.mockBook({
        ...book,
        version: 'asdf',
      });
      helpers.archiveLoader.mockPage({
        ...book,
        version: 'asdf',
      }, page, testPage);
      await hook(helpers, match);
      expect(helpers.archiveLoader.mock.loadBook).toHaveBeenCalledWith('testbook1-uuid', expect.objectContaining({
        contentVersion: 'asdf',
      }));
    });

    it('uses uuid if present', async() => {
      helpers.osWebLoader.getBookSlugFromId.mockImplementation(() => Promise.resolve(undefined) as any);
      const versionedUuidParams = {
        book: {
          contentVersion: testVersion,
          uuid: testUUID,
        },
        page: {
          slug: (match.params.page as SlugParams).slug,
        },
      } as Params;

      mockUUIDBook();

      match.params = versionedUuidParams;
      await hook(helpers, match);
      expect(helpers.archiveLoader.mock.loadBook).toHaveBeenCalledWith(testUUID, expect.objectContaining({
        contentVersion: testVersion,
      }));
    });

    it('throws if there is no uuid', async() => {
      helpers.osWebLoader.getBookIdFromSlug.mockImplementation(() => Promise.resolve(undefined) as any);

      await expect(
        resolveContentUtils.resolveBookReference(helpers, match)
      ).rejects.toThrow(`Could not resolve uuid for params: {"slug":"${testBookSlug}"}`);
    });

    it('do not allow content links outside of BOOKS config and do not throw if not found', async() => {
      helpers.archiveLoader.mockBook(mockOtherBook);
      helpers.archiveLoader.mockPage(mockOtherBook, mockPageInOtherBook, 'page-in-a-new-book');

      match.params = {
        book: {uuid: mockOtherBook.id, contentVersion: '1.0'},
        page: {slug: 'page-in-a-new-book'},
      };

      const reference = {
        bookId: mockOtherBook.id,
        bookVersion: '1.0',
        match: 'ajhd',
        pageId: mockPageInOtherBook.id,
      };

      const referenceBook = await resolveExternalBookReference(helpers, mockOtherBook, mockPageInOtherBook, reference);

      expect(helpers.osWebLoader.getBookFromId).toHaveBeenCalledWith(mockOtherBook.id);
      expect(referenceBook).toEqual(undefined);

      /* Mock an actual hit for book outside BOOKS config */
      helpers.osWebLoader.getBookFromId.mockImplementation(() => Promise.resolve() as any);
      helpers.archiveLoader.mock.loadBook.mockImplementation(() => Promise.resolve(undefined) as any);

      let message: string | undefined;
      let bookOrReferenceLoadingError: Book | undefined;
      try {
        bookOrReferenceLoadingError = await resolveExternalBookReference(
          helpers, mockOtherBook, mockPageInOtherBook, reference);
      } catch (e) {
        message = e;
      }

      expect(helpers.osWebLoader.getBookFromId).toHaveBeenCalledWith(mockOtherBook.id);
      expect(message).toBeUndefined();
      expect(bookOrReferenceLoadingError).toEqual(undefined);
    });

    it('returns undefined if book wasnt found', async() => {
      helpers.archiveLoader.mock.loadBook.mockRejectedValue(new Error('asda'));

      match.params = {
        book: {uuid: book.id, contentVersion: '1.0'},
        page: {slug: 'asd'},
      };

      const reference = {
        bookId: book.id,
        bookVersion: '1.0',
        match: 'ajhd',
        pageId: 'asd',
      };

      const referenceBook = await resolveExternalBookReference(
        helpers, mockOtherBook, mockPageInOtherBook, reference);

      expect(helpers.osWebLoader.getBookFromId).toHaveBeenCalledWith(book.id);
      expect(referenceBook).toEqual(undefined);
    });

    it('throws if no book version found', async() => {
      helpers.osWebLoader.getBookFromId.mockImplementation(() => Promise.resolve(undefined) as any);

      match.params = {
        book: {
          contentVersion: '',
          uuid: testUUID,
        },
        page: {
          slug: testPage,
        },
      };

      mockUUIDBook();

      await expect(hook(helpers, match)).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Could not resolve version for book: 13ac107a-f15f-49d2-97e8-60ab2e3abcde"`
      );
    });

    describe('getBookInformation', () => {
      it('do not throw and handle reference with undefined version', async() => {
        const reference = {
          bookId: 'asdasdas',
          bookVersion: undefined,
          match: 'ajhd',
          pageId: 'asd',
        };

        helpers.archiveLoader.mock.loadBook.mockRejectedValue(new Error('asd'));

        const bookInfo = await resolveContentUtils.getBookInformation(book, helpers, reference);

        expect(bookInfo).toEqual(undefined);
      });
    });

    describe('loadContentReference', () => {
      it('returns undefined when resolveExternalBookReference returns ReferenceLoadingerror', async() => {
        const reference = { match: 'asd', pageId: 'asd', bookId: 'asd', bookVersion: 'asd' };
        expect(await resolveContentUtils.loadContentReference(helpers, book, page, reference)).toEqual({
          match: reference.match,
          type: 'error',
        });
      });
    });
  });
});
