import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book, page } from '../../../../test/mocks/archiveLoader';
import { resetModules } from '../../../../test/utils';
import { Match } from '../../../navigation/types';
import { AppServices, MiddlewareAPI, Store } from '../../../types';
import * as routes from '../../routes';
import { Params, SlugParams } from '../../types';

const mockFetch = (valueToReturn: any, error?: any) => () => new Promise((resolve, reject) => {
  if (error) {
    reject(error);
  }
  resolve({ json: () => new Promise((res) => res(valueToReturn)) });
});

jest.mock('../../../../config', () => ({
  APP_ENV: 'production',
  UNLIMITED_CONTENT: false,
}));

const testUUID = '13ac107a-f15f-49d2-97e8-60ab2e3abcde';
const testVersion = '1.0';
const testPage = 'test-page-1';

describe('locationChange', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI & Pick<AppServices, 'router'>;
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
        books: {'13ac107a-f15f-49d2-97e8-60ab2e3other': {defaultVersion: '0'}},
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
    resetModules();
    store = createTestStore();
    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

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

  describe('in production', () => {
    it('throws if book is missing cms data in production', async() => {
      helpers.osWebLoader.getBookFromId.mockResolvedValue(undefined as any);
      mockUUIDBook();

      const versionedUuidParams = {
        book: {
          contentVersion: testVersion,
          uuid: testUUID,
        },
        page: {
          slug: (match.params.page as SlugParams).slug,
        },
      } as Params;
      match.params = versionedUuidParams;

      await expect(hook(helpers, match))
        .rejects.toThrow('books without cms data are only supported outside production');
    });

    it('resolveExternalBookReference throws if book wasnt found', async() => {
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

      await expect(resolveExternalBookReference(helpers, mockOtherBook, mockPageInOtherBook, reference))
        .rejects.toThrow('asda');
    });

    it('noops if book is retired', async() => {
      (globalThis as any).fetch = mockFetch([{ from: 'asd', to: 'asd' }]);
      helpers.bookConfigLoader.localBookConfig[testUUID] = { defaultVersion: '1.0', retired: true };
      helpers.osWebLoader.getBookIdFromSlug.mockResolvedValue(testUUID);

      match.params = {
        book: {
          slug: 'book-slug-1',
        },
        page: {
          slug: testPage,
        },
      };

      mockUUIDBook();

      await expect(hook(helpers, match)).rejects
        .toThrowErrorMatchingInlineSnapshot(`"tried to load retired book: ${testUUID}"`);
      expect(helpers.archiveLoader.mock.loadBook).not.toHaveBeenCalled();
    });

    it('returns undefined if book is retired and redirected', async() => {
      (globalThis as any).fetch = mockFetch([{ from: 'asd', to: 'asd' }]);
      helpers.history.location = { pathname: 'asd' } as any;
      helpers.bookConfigLoader.localBookConfig[testUUID] = { defaultVersion: '1.0', retired: true };
      helpers.osWebLoader.getBookIdFromSlug.mockResolvedValue(testUUID);

      // const match = {route: {getUrl: jest.fn(() => 'url')}} as unknown as AnyMatch;

      match.params = {
        book: {
          slug: 'book-slug-1',
        },
        page: {
          slug: testPage,
        },
      };

      jest.spyOn(helpers.router, 'findRoute').mockReturnValue(match);

      mockUUIDBook();

      await expect(hook(helpers, match)).resolves.toMatchInlineSnapshot(`
        Object {
          "book": undefined,
          "page": undefined,
        }
      `);
    });
  });
});
