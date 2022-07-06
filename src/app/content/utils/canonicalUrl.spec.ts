import { CANONICAL_MAP } from '../../../canonicalBookMap';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { setHead } from '../../head/actions';
import { locationChange } from '../../navigation/actions';
import { MiddlewareAPI, Store } from '../../types';
import { receiveBook, receivePage } from '../actions';
import { content } from '../routes';
import { LinkedArchiveTreeSection } from '../types';
import { formatBookData } from '../utils';
import * as archiveUtils from '../utils/archiveTreeUtils';
import * as seoUtils from '../utils/seoUtils';

jest.mock('../../../config.books', () => ({
  'testbook1-uuid': {
    defaultVersion: '1.0',
  },
  'testbook2-uuid': {
    defaultVersion: '1.0',
  },
  'testbook3-uuid': {
    defaultVersion: '1.0',
  },
}));

const mockBook = {
  abstract: '',
  id: 'testbook2-uuid',
  language: 'en',
  license: {name: '', version: '', url: ''},
  revised: '2012-06-21',
  title: 'newbook',
  tree: {
    contents: [],
    id: 'testbook2-uuid@0',
    slug: 'newbook',
    title: 'newbook',
  },
  version: '1.0',
};

const mockOtherBook = {...mockBook, id: 'testbook3-uuid'};

describe('getCanonicalURL', () => {
  let getCanonicalUrlParams: typeof import ('../utils/canonicalUrl').getCanonicalUrlParams;
  const combinedBook = formatBookData(book, mockCmsBook);
  let hook: ReturnType<typeof import ('../hooks/receiveContent').default>;
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: MiddlewareAPI & ReturnType<typeof createTestServices>;

  beforeEach(() => {
    getCanonicalUrlParams = require('../utils/canonicalUrl').getCanonicalUrlParams;
    store = createTestStore();

    dispatch = jest.spyOn(store, 'dispatch');

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    hook = require('../hooks/receiveContent').default(helpers);
  });

  it('returns the current book when the book does not have a canonical book entry', async() => {
    const pageId = page.id;
    const x = await getCanonicalUrlParams(helpers.archiveLoader, helpers.osWebLoader, book, pageId);
    expect(x).toEqual({ book: { slug: 'book-slug-1' }, page: { slug: 'test-page-1' } });
  });

  it('finds itself as canonical book for a page', async() => {
    const bookId = book.id;
    const pageId = page.id;
    CANONICAL_MAP[bookId] = [[bookId, {}]];
    const x = await getCanonicalUrlParams(helpers.archiveLoader, helpers.osWebLoader, book, pageId);
    expect(x).toEqual({ book: { slug: 'book-slug-1' }, page: { slug: 'test-page-1' } });
  });

  it('finds another book as canonical book for a page', async() => {
    const bookId = book.id;
    const pageId = page.id;
    CANONICAL_MAP[bookId] = [[bookId, {}]];
    const x = await getCanonicalUrlParams(helpers.archiveLoader, helpers.osWebLoader, book, pageId);
    expect(x).toEqual({ book: { slug: 'book-slug-1' }, page: { slug: 'test-page-1' } });
  });

  it('finds a canonical book and canonical page', async() => {
    const bookId = book.id;
    const pageId = page.id;
    CANONICAL_MAP[bookId] = [[bookId, { [pageId]: 'new-id' }]];

    const node = archiveUtils.findArchiveTreeNodeById(book.tree, pageId);
    node!.slug = 'new-id';
    const spy = jest.spyOn(archiveUtils, 'findArchiveTreeNodeById')
      .mockReturnValueOnce(node);

    const res = await getCanonicalUrlParams(helpers.archiveLoader, helpers.osWebLoader, book, pageId);

    expect(spy).toHaveBeenCalledWith(book.tree, 'new-id');
    expect(res).toEqual({ book: { slug: 'book-slug-1' }, page: { slug: 'new-id' } });
  });

  it('returns null when the book does not exist in the books list', async() => {
    const newBook = {...book, id: 'foo'};
    const res = await getCanonicalUrlParams(helpers.archiveLoader, helpers.osWebLoader, newBook, page.id);
    expect(res).toEqual(null);
  });

  it('uses current page if page not found in map', async() => {
    const bookId = book.id;
    const pageId = page.id;
    CANONICAL_MAP[bookId] = [[bookId, {}]];

    const spy = jest.spyOn(archiveUtils, 'findArchiveTreeNodeById');

    const res = await getCanonicalUrlParams(helpers.archiveLoader, helpers.osWebLoader, book, pageId);

    expect(spy).toHaveBeenCalledWith(book.tree, 'testbook1-testpage1-uuid');
    expect(res).toEqual({ book: { slug: 'book-slug-1' }, page: { slug: 'test-page-1' } });
  });

  it('throws if canonical book is missing cms data', async() => {
    helpers.osWebLoader.getBookFromId.mockImplementation(() => Promise.resolve(undefined) as any);

    const bookId = book.id;
    const pageId = page.id;
    CANONICAL_MAP[bookId] = [[bookId, {}]];

    await expect(getCanonicalUrlParams(
      helpers.archiveLoader,
      helpers.osWebLoader,
      book,
      pageId
    )).rejects.toThrow(`could not load cms data for book: ${bookId}`);
  });

  it('throws if infinite loop found in map', async() => {
    helpers.archiveLoader.mockBook(mockBook);
    helpers.archiveLoader.mockBook(mockOtherBook);

    const bookId = book.id;
    const pageId = page.id;
    CANONICAL_MAP[bookId] = [['testbook2-uuid', {}]];
    CANONICAL_MAP['testbook2-uuid'] = [['testbook3-uuid', {}]];
    CANONICAL_MAP['testbook3-uuid'] = [['testbook2-uuid', {}]];

    await expect(getCanonicalUrlParams(helpers.archiveLoader, helpers.osWebLoader, book, pageId))
      .rejects.toThrowErrorMatchingInlineSnapshot(`"Loop encountered in map for testbook3-uuid"`);
  });

  it('doesn\'t add link when canonical is null', async() => {
    const bookId = book.id;
    const pageId = 'unique-snowflake-page';
    CANONICAL_MAP[bookId] = [[bookId, {}]];

    jest.spyOn(seoUtils, 'createTitle')
      .mockReturnValue('mock seo title');

    store.dispatch(receiveBook(combinedBook));
    store.dispatch(receivePage({ ...page, references: [], id: pageId }));

    await hook(receivePage({ ...page, references: [], id: pageId }));

    expect(dispatch).toHaveBeenCalledWith(setHead({
      links: [],
      meta: expect.anything(),
      title: expect.anything(),
    }));
  });

  it('adds <link rel="canonical">', async() => {
    const bookId = book.id;
    CANONICAL_MAP[bookId] = [[bookId, {}]];

    store.dispatch(receiveBook(combinedBook));
    store.dispatch(receivePage({ ...page, references: [] }));

    await hook(receivePage({ ...page, references: [] }));

    expect(dispatch).toHaveBeenCalledWith(setHead({
      links: [{ rel: 'canonical', href: 'https://openstax.org/books/book-slug-1/pages/test-page-1' }],
      meta: expect.anything(),
      title: expect.anything(),
    }));
  });

  it('og:url depends on pathname', async() => {
    const bookId = book.id;
    CANONICAL_MAP[bookId] = [[bookId, {}]];

    store.dispatch(locationChange({
      action: 'PUSH',
      location: {
        hash: '',
        pathname: content.getUrl({ book: { slug: 'coolbook' }, page: { slug: 'coolpage' } }),
        search: '',
        state: {
          bookUid: bookId,
          bookVersion: book.version,
          pageUid: page.id,
        },
      },
    }));
    store.dispatch(receiveBook(combinedBook));
    store.dispatch(receivePage({ ...page, references: [] }));

    await hook(receivePage({ ...page, references: [] }));

    expect(dispatch).toHaveBeenCalledWith(setHead({
      links: [{ rel: 'canonical', href: 'https://openstax.org/books/book-slug-1/pages/test-page-1' }],
      meta: expect.arrayContaining([
        { property: 'og:url', content: 'https://openstax.org/books/coolbook/pages/coolpage' },
      ]),
      title: expect.anything(),
    }));
  });

  it('finds the deepest canonical page', async() => {
    helpers.archiveLoader.mockBook(mockBook);
    helpers.archiveLoader.mockBook(mockOtherBook);

    const bookId = book.id;
    const pageId = page.id;

    CANONICAL_MAP[bookId] = [['testbook2-uuid', { [pageId]: 'testbook2-page' }]];
    CANONICAL_MAP['testbook2-uuid'] = [['testbook3-uuid', {'testbook2-page': 'testbook3-page'}]];
    CANONICAL_MAP['testbook3-uuid'] = [['testbook3-uuid', {}]];

    const node = archiveUtils.findArchiveTreeNodeById(book.tree, pageId);
    const spy = jest.spyOn(archiveUtils, 'findArchiveTreeNodeById')
      .mockReturnValueOnce({ ...node, slug: 'testbook2-page' } as LinkedArchiveTreeSection)
      .mockReturnValue({ ...node, slug: 'testbook3-page' } as LinkedArchiveTreeSection);

    const res = await getCanonicalUrlParams(helpers.archiveLoader, helpers.osWebLoader, book, pageId);

    expect(spy).toHaveBeenCalledWith(mockBook.tree, 'testbook2-page');
    expect(spy).toHaveBeenCalledWith(mockOtherBook.tree, 'testbook3-page');

    expect(res).toHaveProperty('page', { slug: 'testbook3-page' });
  });

  it('finds canonical page in the deepest canonical book', async() => {
    helpers.archiveLoader.mockBook(mockBook);
    helpers.archiveLoader.mockBook(mockOtherBook);

    const bookId = book.id;
    const pageId = page.id;

    CANONICAL_MAP[bookId] = [['testbook2-uuid', { [pageId]: 'testbook2-page' }]];
    CANONICAL_MAP['testbook2-uuid'] = [['testbook3-uuid', {'testbook2-page': 'testbook3-page'}]];
    CANONICAL_MAP['testbook3-uuid'] = [['testbook3-uuid', {}]];

    const node = archiveUtils.findArchiveTreeNodeById(book.tree, pageId);
    const spy = jest.spyOn(archiveUtils, 'findArchiveTreeNodeById')
      .mockReturnValueOnce({ ...node, slug: 'testbook2-page' } as LinkedArchiveTreeSection)
      .mockReturnValue({ ...node, slug: 'testbook3-page' } as LinkedArchiveTreeSection);

    const res = await getCanonicalUrlParams(helpers.archiveLoader, helpers.osWebLoader, book, pageId);

    expect(spy).toHaveBeenCalledWith(mockBook.tree, 'testbook2-page');
    expect(spy).toHaveBeenCalledWith(mockOtherBook.tree, 'testbook3-page');

    expect(res).toHaveProperty('page', { slug: 'testbook3-page' });
  });

  it('finds canonical page when page is not found in deepest book', async() => {
    helpers.archiveLoader.mockBook(mockBook);
    helpers.archiveLoader.mockBook(mockOtherBook);

    const bookId = book.id;
    const pageId = page.id;

    CANONICAL_MAP[bookId] = [['testbook2-uuid', { [pageId]: 'testbook2-page' }]];
    CANONICAL_MAP['testbook2-uuid'] = [['testbook3-uuid', {'testbook2-page': 'testbook3-page'}]];
    CANONICAL_MAP['testbook3-uuid'] = [['testbook3-uuid', {}]];

    const node = archiveUtils.findArchiveTreeNodeById(book.tree, pageId);
    const spy = jest.spyOn(archiveUtils, 'findArchiveTreeNodeById')
      .mockReturnValueOnce({ ...node, slug: 'testbook2-page' } as LinkedArchiveTreeSection)
      .mockReturnValue(undefined);

    const res = await getCanonicalUrlParams(helpers.archiveLoader, helpers.osWebLoader, book, pageId);

    expect(spy).toHaveBeenCalledWith(mockBook.tree, 'testbook2-page');
    expect(spy).toHaveBeenCalledWith(mockOtherBook.tree, 'testbook3-page');

    expect(res).toHaveProperty('page', { slug: 'testbook2-page' });
  });
});
