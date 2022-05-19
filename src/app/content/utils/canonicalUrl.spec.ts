import { CANONICAL_MAP } from '../../../canonicalBookMap';
import { book, page } from '../../../test/mocks/archiveLoader';
import { setHead } from '../../head/actions';
import { locationChange } from '../../navigation/actions';
import { receiveBook, receivePage } from '../actions';
import { content } from '../routes';
import * as archiveUtils from '../utils/archiveTreeUtils';
import * as seoUtils from '../utils/seoUtils';

describe('getCanonicalURL', () => {

    it('returns the current book when the book does not have a canonical book entry', async() => {
      const pageId = page.id;
      const x = await getCanonicalUrlParams(helpers.archiveLoader, helpers.osWebLoader, book, pageId, book.version);
      expect(x).toEqual({book: {slug: 'book-slug-1'}, page: {slug: 'test-page-1'}});
    });

    it('finds a canonical book for a page', async() => {
      const bookId = book.id;
      const pageId = page.id;
      CANONICAL_MAP[bookId] = [ [bookId, {}] ];
      const x = await getCanonicalUrlParams(helpers.archiveLoader, helpers.osWebLoader, book, pageId, book.version);
      expect(x).toEqual({book: {slug: 'book-slug-1'}, page: {slug: 'test-page-1'}});
    });

    it('finds a canonical book and canonical page', async() => {
      const bookId = book.id;
      const pageId = page.id;
      CANONICAL_MAP[bookId] = [ [bookId, { [pageId]: 'new-id' }] ];

      const node = archiveUtils.findArchiveTreeNodeById(book.tree, pageId);
      node!.slug = 'new-id';
      const spy = jest.spyOn(archiveUtils, 'findArchiveTreeNodeById')
        .mockReturnValueOnce(node);

      const res = await getCanonicalUrlParams(helpers.archiveLoader, helpers.osWebLoader, book, pageId, book.version);

      expect(spy).toHaveBeenCalledWith(book.tree, 'new-id');
      expect(res).toEqual({book: {slug: 'book-slug-1'}, page: {slug: 'new-id'}});
    });

    it('throws if canonical book is missing cms data', async() => {
      helpers.osWebLoader.getBookFromId.mockImplementation(() => Promise.resolve(undefined) as any);

      const bookId = book.id;
      const pageId = page.id;
      CANONICAL_MAP[bookId] = [ [bookId, {}] ];

      await expect(getCanonicalUrlParams(
        helpers.archiveLoader,
        helpers.osWebLoader,
        book,
        pageId,
        book.version
      )).rejects.toThrow(`could not load cms data for book: ${bookId}`);
    });

    it('doesn\'t add link when canonical is null', async() => {
      const bookId = book.id;
      const pageId = 'unique-snowflake-page';
      CANONICAL_MAP[bookId] = [ [bookId, {}] ];

      jest.spyOn(seoUtils, 'createTitle')
        .mockReturnValue('mock seo title');

      store.dispatch(receiveBook(combinedBook));
      store.dispatch(receivePage({...page, references: [], id: pageId}));

      await hook(receivePage({...page, references: [], id: pageId}));

      expect(dispatch).toHaveBeenCalledWith(setHead({
        links: [],
        meta: expect.anything(),
        title: expect.anything(),
      }));
    });

    it('adds <link rel="canonical">', async() => {
      const bookId = book.id;
      CANONICAL_MAP[bookId] = [ [bookId, {}] ];

      store.dispatch(receiveBook(combinedBook));
      store.dispatch(receivePage({...page, references: []}));

      await hook(receivePage({...page, references: []}));

      expect(dispatch).toHaveBeenCalledWith(setHead({
        links: [{rel: 'canonical', href: 'https://openstax.org/books/book-slug-1/pages/test-page-1'}],
        meta: expect.anything(),
        title: expect.anything(),
      }));
    });

    it('og:url depends on pathname', async() => {
      const bookId = book.id;
      CANONICAL_MAP[bookId] = [ [bookId, {}] ];

      store.dispatch(locationChange({
        action: 'PUSH',
        location: {
          hash: '',
          pathname: content.getUrl({book: {slug: 'coolbook'}, page: {slug: 'coolpage'}}),
          search: '',
          state: {
            bookUid: bookId,
            bookVersion: book.version,
            pageUid: page.id,
          },
        },
      }));
      store.dispatch(receiveBook(combinedBook));
      store.dispatch(receivePage({...page, references: []}));

      await hook(receivePage({...page, references: []}));

      expect(dispatch).toHaveBeenCalledWith(setHead({
        links: [{rel: 'canonical', href: 'https://openstax.org/books/book-slug-1/pages/test-page-1'}],
        meta: expect.arrayContaining([
          {property: 'og:url', content: 'https://openstax.org/books/coolbook/pages/coolpage'},
        ]),
        title: expect.anything(),
      }));
    });
  });