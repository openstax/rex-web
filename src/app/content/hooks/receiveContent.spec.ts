import { CANONICAL_MAP } from '../../../canonicalBookMap';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { setHead } from '../../head/actions';
import { MiddlewareAPI, Store } from '../../types';
import { receiveBook, receivePage, requestBook, requestPage } from '../actions';
import { formatBookData } from '../utils';
import * as seoUtils from '../utils/seoUtils';

const mockBookConfig = {
  [book.id]: { defaultVersion: book.version },
} as { [key: string]: { defaultVersion: string } };

jest.doMock('../../../config.books', () => mockBookConfig);

describe('setHead hook', () => {
  const combinedBook = formatBookData(book, mockCmsBook);
  const dataNotFoundState = {
    contentTags: [],
    initialized: false,
    links: [],
    meta: [],
    title: 'OpenStax - Page Not Found',
  };
  let hook: ReturnType<typeof import('./receiveContent').default>;
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: MiddlewareAPI & ReturnType<typeof createTestServices>;

  beforeEach(() => {
    store = createTestStore();

    dispatch = jest.spyOn(store, 'dispatch');

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    hook = require('./receiveContent').default(helpers);
  });

  it('dispatches setHead when receivePage is dispatched', async() => {
    store.dispatch(receiveBook(combinedBook));
    store.dispatch(receivePage({ ...page, references: [] }));

    await hook(receivePage({ ...page, references: [] }));

    expect(dispatch).toHaveBeenCalledWith(setHead(expect.anything()));
  });

  it('does nothing if book is loading', async() => {
    store.dispatch(receiveBook(combinedBook));
    store.dispatch(receivePage({ ...page, references: [] }));
    store.dispatch(requestBook({
      slug: 'asdf',
    }));

    await hook(receivePage({ ...page, references: [] }));

    expect(dispatch).not.toHaveBeenCalledWith(setHead(expect.anything()));
  });

  it('does nothing if page is loading', async() => {
    store.dispatch(receiveBook(combinedBook));
    store.dispatch(receivePage({ ...page, references: [] }));
    store.dispatch(requestPage({ slug: 'asdf' }));

    await hook(receivePage({ ...page, references: [] }));

    expect(dispatch).toHaveBeenCalledWith(setHead(dataNotFoundState));
  });

  it('does nothing if page is reloading', async() => {
    store.dispatch(receiveBook(combinedBook));
    store.dispatch(receivePage({ ...page, references: [] }));
    store.getState().content.loading = { page: { slug: 'pageId' } };

    await hook(receivePage({ ...page, references: [] }));

    expect(dispatch).not.toHaveBeenCalledWith(setHead(expect.anything()));
  });

  it('set title as page not found if page is not loaded', async() => {
    store.dispatch(receiveBook(combinedBook));

    await hook(receivePage({ ...page, references: [] }));

    expect(dispatch).toHaveBeenCalledWith(setHead(dataNotFoundState));
  });

  it('set title as page not found if book is not loaded', async() => {
    store.dispatch(receivePage({ ...page, references: [] }));

    await hook(receivePage({ ...page, references: [] }));

    expect(dispatch).toHaveBeenCalledWith(setHead(dataNotFoundState));
  });

  describe('metadata', () => {
    it('dispatches sethead with description tags', async() => {
      store.dispatch(receiveBook(combinedBook));
      store.dispatch(receivePage({
        ...page,
        references: [],
      }));
      const bookId = book.id;
      CANONICAL_MAP[bookId] = [[bookId, {}]];

      jest.spyOn(seoUtils, 'getPageDescription')
        .mockReturnValue('mock seo description');

      await hook(receivePage({
        ...page,
        references: [],
      }));

      expect(dispatch).toHaveBeenCalledWith(setHead(expect.objectContaining({
        meta: expect.arrayContaining([
          { name: 'description', content: 'mock seo description' },
          { property: 'og:description', content: 'mock seo description' },
        ]),
      })));
    });

    it('always dispatches sethead with description tags', async() => {
      store.dispatch(receiveBook(book));
      store.dispatch(receivePage({
        ...page,
        abstract: undefined as any as string,
        references: [],
      }));
      const bookId = book.id;
      CANONICAL_MAP[bookId] = [[bookId, {}]];

      await hook(receivePage({
        ...page,
        abstract: undefined as any as string,
        references: [],
      }));

      expect(dispatch).toHaveBeenCalledWith(setHead(expect.objectContaining({
        meta: expect.arrayContaining([
          expect.objectContaining({ name: 'description' }),
          expect.objectContaining({ property: 'og:description' }),
        ]),
      })));
    });

    it('dispatches sethead with og:image tag if book has that data', async() => {
      store.dispatch(receiveBook({
        ...combinedBook,
        promote_image: { meta: { download_url: 'mock_download_url' } } as any,
      }));
      store.dispatch(receivePage({
        ...page,
        abstract: 'foobar',
        references: [],
      }));
      const bookId = book.id;
      CANONICAL_MAP[bookId] = [[bookId, {}]];

      await hook(receivePage({
        ...page,
        abstract: 'foobar',
        references: [],
      }));

      expect(dispatch).toHaveBeenCalledWith(setHead(expect.objectContaining({
        meta: expect.arrayContaining([
          { property: 'og:image', content: 'mock_download_url' },
        ]),
      })));
    });

    it('dispatches sethead with robots:noindex tag if book is not default', async() => {
      store.dispatch(receiveBook({
        ...combinedBook,
        loadOptions: {
          ...combinedBook.loadOptions,
          contentVersion: 'rando',
        },
      }));
      store.dispatch(receivePage({
        ...page,
        references: [],
      }));
      const bookId = book.id;
      CANONICAL_MAP[bookId] = [[bookId, {}]];

      await hook(receivePage({
        ...page,
        references: [],
      }));

      expect(dispatch).toHaveBeenCalledWith(setHead(expect.objectContaining({
        meta: expect.arrayContaining([
          { name: 'robots', content: 'noindex' },
        ]),
      })));
    });

    it('dispatches sethead without robots:noindex tag if book is default', async() => {
      combinedBook.language = 'pl';
      store.dispatch(receiveBook({
        ...combinedBook,
      }));
      store.dispatch(receivePage({
        ...page,
        references: [],
      }));
      const bookId = book.id;
      CANONICAL_MAP[bookId] = [[bookId, {}]];

      await hook(receivePage({
        ...page,
        references: [],
      }));

      expect(dispatch).toHaveBeenCalledWith(setHead(expect.objectContaining({
        meta: expect.not.arrayContaining([
          { name: 'robots', content: 'noindex' },
        ]),
      })));
    });

    it('dispatches sethead with robots:noindex tag if page has noindex set', async() => {
      store.dispatch(receiveBook(combinedBook));
      store.dispatch(receivePage({
        ...page,
        references: [],
        noindex: true,
      }));
      const bookId = book.id;
      CANONICAL_MAP[bookId] = [[bookId, {}]];

      await hook(receivePage({
        ...page,
        references: [],
        noindex: true,
      }));

      expect(dispatch).toHaveBeenCalledWith(setHead(expect.objectContaining({
        meta: expect.arrayContaining([
          { name: 'robots', content: 'noindex' },
        ]),
      })));
    });
  });
});
