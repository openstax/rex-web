import { Location } from 'history';
import { OSWebBook } from '../../../gateways/createOSWebLoader';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { resetModules } from '../../../test/utils';
import { Match } from '../../navigation/types';
import { MiddlewareAPI, Store } from '../../types';
import * as actions from '../actions';
import { receiveBook, receivePage } from '../actions';
import * as routes from '../routes';
import { SlugParams } from '../types';
import { formatBookData } from '../utils';

const mockBook = {...book, id: '13ac107a-f15f-49d2-97e8-60ab2e3b519c', version: '29.7'};
let store: Store;
let dispatch: jest.SpyInstance;
let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
let intlHook: typeof import ('./intlHook');
let mockBookConfig: {[key: string]: {defaultVersion: string}};
let contentHook: typeof import ('./locationChange/resolveContent');

beforeEach(() => {
  resetModules();
  store = createTestStore();

  helpers = {
    ...createTestServices(),
    dispatch: store.dispatch,
    getState: store.getState,
  };

  mockBookConfig = {
   [book.id]: {defaultVersion: book.version},
   [mockBook.id]: {defaultVersion: mockBook.version},
  };

  Object.assign(helpers.bookConfigLoader.localBookConfig, mockBookConfig);
  dispatch = jest.spyOn(helpers, 'dispatch');
  contentHook = require('./locationChange/resolveContent');
  intlHook = require('./intlHook');
});

describe('contentRouteHookBody', () => {
  let payload: {location: Location, match: Match<typeof routes.content>};
  let hook = require('./locationChange').contentRouteHookBody;

  beforeEach(() => {
    helpers.osWebLoader.getBookIdFromSlug.mockReturnValue(Promise.resolve(book.id));

    payload = {
      location: {} as Location,
      match: {
        params: {
          book: {
            slug: 'book-slug-1',
          },
          page: {
            slug: 'test-page-1',
          },
        },
        route: routes.content,
        state: {},
      },
    };

    hook = (require('./locationChange').contentRouteHookBody)(helpers);
  });

  it('loads book', async() => {
    helpers.osWebLoader.getBookIdFromSlug.mockReturnValue(Promise.resolve(book.id));
    await hook(payload);
    expect(dispatch).toHaveBeenCalledWith(actions.requestBook({slug: 'book-slug-1'}));
    expect(helpers.archiveLoader.mock.loadBook).toHaveBeenCalledWith('testbook1-uuid', expect.objectContaining({
      booksConfig: expect.anything(),
    }));
  });

  it('doesn\'t load book if its already loaded', async() => {
    helpers.osWebLoader.getBookIdFromSlug.mockReturnValue(Promise.resolve(book.id));
    store.dispatch(receiveBook(formatBookData(
      {...book, loadOptions: {
        booksConfig: helpers.bookConfigLoader.localBookAndArchiveConfig,
      }},
      {...mockCmsBook, meta: {slug: 'book-slug-1'}}))
    );
    await hook(payload);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestBook({slug: 'book-slug-1'}));
    expect(helpers.archiveLoader.mock.loadBook).not.toHaveBeenCalled();
  });

  it('loads page', async() => {
    helpers.osWebLoader.getBookIdFromSlug.mockReturnValue(Promise.resolve(book.id));
    await hook(payload);
    expect(dispatch).toHaveBeenCalledWith(actions.requestPage({slug: 'test-page-1'}));
    expect(helpers.archiveLoader.mock.loadPage)
      .toHaveBeenCalledWith('testbook1-uuid', '1.0', 'testbook1-testpage1-uuid');
  });

  it('doesn\'t load page if its already loaded', async() => {
    helpers.osWebLoader.getBookIdFromSlug.mockReturnValue(Promise.resolve(book.id));
    store.dispatch(receivePage({...page, references: []}));

    await hook(payload);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestPage(expect.anything()));
    expect(helpers.archiveLoader.mock.loadPage).not.toHaveBeenCalled();
    expect(helpers.archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('page', expect.anything());
    expect(helpers.archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('pagelongid', expect.anything());
  });

  it('loads a page with a content reference', async() => {
    helpers.osWebLoader.getBookIdFromSlug.mockReturnValue(Promise.resolve(book.id));
    helpers.archiveLoader.mockBook(mockBook);
    helpers.archiveLoader.mockPage(book, {
      abstract: '',
      // tslint:disable-next-line: max-line-length
      content: `some <a href="./${mockBook.id}@${mockBook.version}:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml"></a> content`,
      id: '99d38770-49c7-49d3-b567-88f393ffb4fe',
      revised: '2018-07-30T15:58:45Z',
      slug: 'rando-page',
      title: 'qwerqewrqwer',
    }, 'rando-page');

    payload.match.params.page = {
      slug: 'rando-page',
    };

    await hook(payload);

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({payload: expect.objectContaining({references: [{
      match: `./${mockBook.id}@${mockBook.version}:99d38770-49c7-49d3-b567-88f393ffb4fe.xhtml`,
      params: {
        book: {
          slug: 'book-slug-1',
        },
        page: {
          slug: 'rando-page',
        },
      },
    }]})}));
  });

  it('disptaches receivePageNotFoundId for unknown id', async() => {
    (payload.match.params.page as SlugParams).slug = 'garbage';

    await hook(payload);

    expect(dispatch).toHaveBeenCalledWith(actions.receivePageNotFoundId('garbage'));
  });

  it('loads book details from osweb', async() => {
    await hook(payload);
    expect(helpers.osWebLoader.getBookIdFromSlug).toHaveBeenCalledWith('book-slug-1');
  });

  it('caches book details from osweb', async() => {
    await hook(payload);
    await hook(payload);
    expect(helpers.osWebLoader.getBookIdFromSlug).toHaveBeenCalledTimes(1);
  });

  it('doesn\'t call osweb if book slug is already known', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    await hook(payload);
    expect(helpers.osWebLoader.getBookIdFromSlug).not.toHaveBeenCalled();
  });

  it('noops if no book is loaded', async() => {
    const intlSpy = jest.spyOn(intlHook, 'default');
    const contentHookSpy = jest.spyOn(contentHook, 'default');
    contentHookSpy.mockReturnValue(Promise.resolve({book: undefined, page: undefined}));

    await hook(payload);
    expect(intlSpy).not.toHaveBeenCalled();
  });

  describe('cross book references', () => {
    const mockOtherBook = {
      abstract: '',
      contentVersion: '0',
      id: '13ac107a-f15f-49d2-97e8-60ab2e3other',
      language: 'en',
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
      id: '99d38770-49c7-49d3-b567-88f393fother',
      revised: '2018-07-30T15:58:45Z',
      slug: 'page-in-a-new-book',
      title: 'page in a new book',
    };
    const mockCmsOtherBook: OSWebBook = {
      amazon_link: '',
      authors: [{value: {name: 'different author', senior_author: true}}],
      book_categories: [{subject_name: 'test subject', subject_category: 'test category'}],
      book_state: 'live',
      book_subjects: [{subject_name: 'test subject'}],
      cnx_id: mockOtherBook.id,
      cover_color: 'blue',
      meta: {
        slug: 'new-book',
      },
      polish_site_link: '',
      promote_image: null,
      publish_date: '2012-06-21',
      content_warning_text: '',
      id: 72,
    };

    beforeEach(() => {
      helpers.archiveLoader.mockBook(mockOtherBook);
      helpers.archiveLoader.mockPage(mockOtherBook, mockPageInOtherBook, 'page-in-a-new-book');

      helpers.bookConfigLoader.localBookConfig[mockOtherBook.id] = {defaultVersion: mockOtherBook.version};

      helpers.archiveLoader.mockBook(mockBook);
      helpers.archiveLoader.mockPage(mockBook, {
        abstract: '',
        // tslint:disable-next-line: max-line-length
        content: `some <a href="./${mockOtherBook.id}@${mockOtherBook.version}:${mockPageInOtherBook.id}.xhtml"></a> content`,
        id: 'pageid',
        revised: '2018-07-30T15:58:45Z',
        slug: 'page-referencing-different-book',
        title: 'page referencing different book',
      }, 'page-referencing-different-book');

      payload.match.params.page = {
        slug: 'page-referencing-different-book',
      };
    });

    it('load', async() => {
      helpers.osWebLoader.getBookIdFromSlug.mockReturnValue(Promise.resolve(mockBook.id));
      helpers.osWebLoader.getBookFromId.mockReturnValue(Promise.resolve(mockCmsOtherBook));

      await hook(payload);

      expect(helpers.osWebLoader.getBookFromId).toHaveBeenCalledWith(mockOtherBook.id);

      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({payload: expect.objectContaining({references: [{
        match: `./${mockOtherBook.id}@${mockOtherBook.version}:${mockPageInOtherBook.id}.xhtml`,
        params: {
          book: {
            slug: 'new-book',
          },
          page: {
            slug: 'page-in-a-new-book',
          },
        },
      }]})}));
    });

    it('error when archive returns a book that doesn\'t actually contain the page', async() => {
      helpers.osWebLoader.getBookFromId.mockReturnValue(Promise.resolve(mockCmsOtherBook));
      helpers.archiveLoader.mock.loadPage.mockResolvedValue({
        abstract: '',
        // tslint:disable-next-line: max-line-length
        content: `some <a href="./${mockOtherBook.id}@${mockOtherBook.contentVersion}:thisiddoes-not7-exis-t567-88f393fother.xhtml"></a> content`,
        id: 'pageid',
        revised: '2018-07-30T15:58:45Z',
        slug: 'mock-slug',
        title: 'this page has cross link that directs to missing page',
      });

      let message: string | undefined;

      try {
        await hook(payload);
      } catch (e: any) {
        message = e.message;
      }

      expect(message).toEqual(
        'BUG: "Test Book 1 / this page has cross link that directs to missing page" referenced '
        + '"thisiddoes-not7-exis-t567-88f393fother"'
        + `, archive thought it would be in "${mockOtherBook.id}", but it wasn't`
      );
    });
  });
});

describe('assignedRouteHookBody', () => {
  let payload: {location: Location, match: Match<typeof routes.assigned>};
  let hook = require('./locationChange').assignedRouteHookBody;
  let selectQuerySpy: jest.SpyInstance;

  beforeEach(() => {
    payload = {
      location: {} as Location,
      match: {
        params: {
          activityId: 'cool reading',
        },
        route: routes.assigned,
        state: {},
      },
    };

    selectQuerySpy = jest.spyOn(require('../../navigation/selectors'), 'query');

    selectQuerySpy.mockReturnValue({book: 'testbook1-uuid'});

    hook = (require('./locationChange').assignedRouteHookBody)(helpers);
  });

  it('loads book', async() => {
    await hook(payload);
    expect(dispatch).toHaveBeenCalledWith(actions.requestBook({uuid: 'testbook1-uuid'}));
    expect(helpers.archiveLoader.mock.loadBook).toHaveBeenCalledWith('testbook1-uuid', expect.objectContaining({
      booksConfig: expect.anything(),
    }));
  });

  it('calls intl', async() => {
    const intlSpy = jest.spyOn(intlHook, 'default');
    await hook(payload);
    expect(dispatch).toHaveBeenCalledWith(actions.requestBook({uuid: 'testbook1-uuid'}));
    expect(helpers.archiveLoader.mock.loadBook).toHaveBeenCalledWith('testbook1-uuid', expect.objectContaining({
      booksConfig: expect.anything(),
    }));
    expect(intlSpy).toHaveBeenCalled();
  });
});
