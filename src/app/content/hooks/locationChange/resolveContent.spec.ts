import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, page } from '../../../../test/mocks/archiveLoader';
import { resetModules } from '../../../../test/utils';
import { Match } from '../../../navigation/types';
import { MiddlewareAPI, Store } from '../../../types';
import * as actions from '../../actions';
import * as routes from '../../routes';
import { Book, Params, SlugParams } from '../../types';
import { loadContentReference, resolveBookReference } from './resolveContent';
import * as resolveContentUtils from './resolveContent';

jest.mock('../../../../config', () => {
  const mockBook = (jest as any).requireActual(
    '../../../../test/mocks/archiveLoader'
  ).book;
  return {
    APP_ENV: 'development',
    BOOKS: {
      [mockBook.id]: { defaultVersion: mockBook.version },
      '13ac107a-f15f-49d2-97e8-60ab2e3abcde': { defaultVersion: '1.0' },
      '13ac107a-f15f-49d2-97e8-60ab2e3b519c': { defaultVersion: '29.7' },
    },
    UNLIMITED_CONTENT: true,
  };
});

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
    id: '13ac107a-f15f-49d2-97e8-60ab2e3other',
    license: {name: '', version: '', url: ''},
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
    title: 'page in a new book',
    version: '0',
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
          uuid: testUUID,
          version: testVersion,
        },
        page: {
          slug: testPage,
        },
      };
      await hook(helpers, match);
      await hook(helpers, match);

      const getBookSlugFromId = jest.spyOn(helpers.osWebLoader, 'getBookSlugFromId');

      expect(getBookSlugFromId).toHaveBeenCalledTimes(1);
    });

    it('uses uuid if present', async() => {
      helpers.osWebLoader.getBookSlugFromId.mockImplementation(() => Promise.resolve(undefined) as any);
      const versionedUuidParams = {
        book: {
          uuid: testUUID,
          version: testVersion,
        },
        page: {
          slug: (match.params.page as SlugParams).slug,
        },
      } as Params;

      mockUUIDBook();

      match.params = versionedUuidParams;
      await hook(helpers, match);
      expect(helpers.archiveLoader.mock.loadBook).toHaveBeenCalledWith(testUUID, testVersion);
    });

    it('throws if there is no uuid', async() => {
      helpers.osWebLoader.getBookIdFromSlug.mockImplementation(() => Promise.resolve(undefined) as any);

      await expect(
        resolveBookReference(helpers, match)
      ).rejects.toThrow(`Could not resolve uuid for slug: ${testBookSlug}`);
    });

    it('do not allow content links outside of BOOKS config and do not throw if not found', async() => {
      helpers.archiveLoader.mockBook(mockOtherBook);
      helpers.archiveLoader.mockPage(mockOtherBook, mockPageInOtherBook, 'page-in-a-new-book');

      match.params = {
        book: {uuid: mockOtherBook.id, version: '1.0'},
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

    it('resolves link with book version in reference', async() => {
      const reference = {
        bookId: 'newbookid',
        bookVersion: '0',
        match: 'ajhd',
        pageId: mockPageInOtherBook.id,
      };

      await resolveExternalBookReference(helpers, mockOtherBook, mockPageInOtherBook, reference);

      expect(helpers.osWebLoader.getBookFromId).toHaveBeenCalledWith(reference.bookId);
      expect(helpers.archiveLoader.mock.loadBook).toHaveBeenCalledWith(reference.bookId, reference.bookVersion);
    });

    it('returns undefined if book wasnt found', async() => {
      helpers.archiveLoader.mock.loadBook.mockRejectedValue(new Error('asda'));

      match.params = {
        book: {uuid: book.id, version: '1.0'},
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

    describe('getBookInformation', () => {
      it('do not throw and handle reference with undefined version', async() => {
        const reference = {
          bookId: 'asdasdas',
          bookVersion: undefined,
          match: 'ajhd',
          pageId: 'asd',
        };

        helpers.archiveLoader.mock.loadBook.mockRejectedValue(new Error('asd'));

        const bookInfo = await resolveContentUtils.getBookInformation(helpers, reference);

        expect(bookInfo).toEqual(undefined);
      });
    });

    describe('loadContentReference', () => {
      it('returns undefined when resolveExternalBookReference returns ReferenceLoadingerror', async() => {
        jest.spyOn(resolveContentUtils, 'resolveExternalBookReference')
          .mockResolvedValue(undefined);

        const reference = { match: 'asd', pageId: 'asd', bookId: 'asd', bookVersion: 'asd' };
        expect(await loadContentReference(helpers, book, page, reference)).toEqual({
          match: reference.match,
          type: 'error',
        });
      });
    });
  });

  describe('in production', () => {
    beforeAll(() => {
      jest.doMock('../../../../config', () => ({
        APP_ENV: 'production',
        BOOKS: {
          [book.id]: { defaultVersion: book.version },
          [testUUID]: { defaultVersion: testVersion },
        },
      }));
    });

    it('throws if book is missing cms data in production', async() => {
      helpers.osWebLoader.getBookSlugFromId.mockImplementation(() => Promise.resolve(undefined) as any);
      mockUUIDBook();

      const versionedUuidParams = {
        book: {
          uuid: testUUID,
          version: testVersion,
        },
        page: {
          slug: (match.params.page as SlugParams).slug,
        },
      } as Params;
      match.params = versionedUuidParams;

      await expect(
         hook(helpers, match)
      ).rejects.toThrow('books without cms data are only supported outside production');
    });

    it('resolveExternalBookReference throws if book wasnt found', async() => {
      helpers.archiveLoader.mock.loadBook.mockRejectedValue(new Error('asda'));

      match.params = {
        book: {uuid: book.id, version: '1.0'},
        page: {slug: 'asd'},
      };

      const reference = {
        bookId: book.id,
        bookVersion: '1.0',
        match: 'ajhd',
        pageId: 'asd',
      };

      await expect(resolveExternalBookReference(helpers, mockOtherBook, mockPageInOtherBook, reference))
        .rejects.toThrow('asda');
    });
  });
});

describe('getContentPageReferences', () => {
  it('works with no references in the content', () => {
    expect(resolveContentUtils.getContentPageReferences('some cool content')).toEqual([]);
  });

  it('works with empty content', () => {
    expect(resolveContentUtils.getContentPageReferences('')).toEqual([]);
  });

  it('ignores urls not in links', () => {
    expect(
      resolveContentUtils.getContentPageReferences('asdfasdfasf /contents/as8s8xu9sdnjsd9 asdfadf')
    ).toEqual([]);
  });

  it('ignores urls without book version', () => {
    expect(
      resolveContentUtils.getContentPageReferences('asdfasdfasf <a href="/contents/as8s8xu9sdnjsd9"></a> asdfadf')
    ).toEqual([]);
  });

  it('picks rap links without book version even if they are not in config.books.json', () => {
    expect(
      resolveContentUtils.getContentPageReferences(`
      asdfa <a href="./13ac107a-f15f-49d2-97e8-60ab2e3wrong:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml"></a>
    `)
    ).toEqual([
      {
        bookId: '13ac107a-f15f-49d2-97e8-60ab2e3wrong',
        bookVersion: undefined,
        match: './13ac107a-f15f-49d2-97e8-60ab2e3wrong:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml',
        pageId: '99d38770-49c7-49d3-b567-88f393ffb4fe',
      },
    ]);
  });

  it('picks up multiple rap links', () => {
    expect(
      resolveContentUtils.getContentPageReferences(`
      asdfa <a href="./13ac107a-f15f-49d2-97e8-60ab2e3b519c@29.7:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml"></a> sdf
      <a href="./13ac107a-f15f-49d2-97e8-60ab2e3b519c:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml"></a>
    `)
    ).toEqual([
      {
        bookId: '13ac107a-f15f-49d2-97e8-60ab2e3b519c',
        bookVersion: '29.7',
        match: './13ac107a-f15f-49d2-97e8-60ab2e3b519c@29.7:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml',
        pageId: '99d38770-49c7-49d3-b567-88f393ffb4fe',
      },
      {
        bookId: '13ac107a-f15f-49d2-97e8-60ab2e3b519c',
        bookVersion: '29.7',
        match: './13ac107a-f15f-49d2-97e8-60ab2e3b519c:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml',
        pageId: '99d38770-49c7-49d3-b567-88f393ffb4fe',
      },
    ]);
  });
});
