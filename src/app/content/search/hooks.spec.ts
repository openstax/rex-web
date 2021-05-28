import { SearchResultHit } from '@openstax/open-search-client/dist/models/SearchResultHit';
import queryString from 'querystring';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book, page, shortPage } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { makeSearchResultHit, makeSearchResults } from '../../../test/searchResults';
import { locationChange as navigationLocationChange, push, replace } from '../../navigation/actions';
import { AppServices, ArgumentTypes, MiddlewareAPI, Store } from '../../types';
import { receiveBook, receivePage } from '../actions';
import { content } from '../routes';
import * as selectors from '../selectors';
import { formatBookData } from '../utils';
import { clearSearch, receiveSearchResults, requestSearch, selectSearchResult } from './actions';
import { clearSearchHook, receiveSearchHook, requestSearchHook, syncSearch } from './hooks';
import { SearchScrollTarget } from './types';

describe('hooks', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: MiddlewareAPI & AppServices;

  beforeEach(() => {
    store = createTestStore();
    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };
    dispatch = jest.spyOn(helpers, 'dispatch');
  });

  describe('requestSearchHook', () => {
    let hook: ReturnType<typeof requestSearchHook>;

    beforeEach(() => {
      hook = requestSearchHook(helpers);
    });

    it('searches', async() => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      await hook(requestSearch('asdf'));
      expect(helpers.searchClient.search).toHaveBeenCalled();
    });

    it('noops when there isn\'t a book', async() => {
      await hook(requestSearch('asdf'));
      expect(helpers.searchClient.search).not.toHaveBeenCalled();
    });

    it('noops when query is empty', async() => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      await hook(requestSearch(''));
      expect(helpers.searchClient.search).not.toHaveBeenCalled();
    });

    it('dispatches receiveSearchResults', async() => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      (helpers.searchClient.search as any).mockReturnValue('searchresults');
      await hook(requestSearch('asdf'));
      expect(dispatch).toHaveBeenCalledWith(
        receiveSearchResults('searchresults' as any)
      );
    });
  });

  describe('clearSearchHook', () => {
    let hook: ReturnType<typeof clearSearchHook>;

    beforeEach(() => {
      hook = clearSearchHook(helpers);
    });

    it('clears hash and search if there was a search scroll target', () => {
      const mockSearchScrollTarget = `target=${JSON.stringify({ type: 'search', index: 0 })}`;
      const spy = jest.spyOn(helpers.history, 'replace');

      store.dispatch(navigationLocationChange({
        location: { hash: 'elementId', search: mockSearchScrollTarget },
      } as any));

      hook(clearSearch());

      expect(spy).toHaveBeenCalledWith({ hash: '', search: '' });
    });

    it('noops if there was no scroll target or if it wasn\'t search scroll target', () => {
      const mockNOTSearchScrollTarget = `target=${JSON.stringify({ type: 'highlight', id: 'asd' })}`;
      const spy = jest.spyOn(helpers.history, 'replace');

      store.dispatch(navigationLocationChange({
        location: { hash: '', search: '' },
      } as any));

      hook(clearSearch());

      expect(spy).not.toHaveBeenCalled();

      store.dispatch(navigationLocationChange({
        location: { hash: 'elementId', search: mockNOTSearchScrollTarget },
      } as any));

      hook(clearSearch());

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('syncSearch', () => {
    let hook: ReturnType<typeof syncSearch>;
    const searchScrollTarget: SearchScrollTarget = { type: 'search', index: 0, elementId: 'elementId' };
    const searchScrollTargetStringified = `${JSON.stringify({ type: 'search', index: 0 })}`;

    beforeEach(() => {
      hook = syncSearch(helpers);
    });

    it('searches if there is search scroll target in the URL', () => {
      store.dispatch(navigationLocationChange({
        location: { hash: 'elementId', search: `?query=asdf&target=${searchScrollTargetStringified}` },
      } as any));

      hook({} as any);

      expect(dispatch).toHaveBeenCalledWith(requestSearch('asdf', { isResultReload: true, searchScrollTarget }));
    });

    it('searches if there is only search query in the URL', () => {
      store.dispatch(navigationLocationChange({
        location: { hash: 'elementId', search: `?query=asdf` },
      } as any));

      hook({} as any);

      expect(dispatch).toHaveBeenCalledWith(requestSearch('asdf'));
    });

    it('noops if search query is the same', () => {
      store.dispatch(navigationLocationChange({
        location: { hash: 'elementId', search: `?query=asdf` },
      } as any));

      hook({} as any);

      dispatch.mockClear();

      hook({} as any);

      expect(dispatch).not.toHaveBeenCalledWith();
    });

    it('selects search result', () => {
      const hit = makeSearchResultHit({book, page});
      store.dispatch(navigationLocationChange({
        location: { hash: hit.source.elementId, search: `?query=asdf&target=${searchScrollTargetStringified}` },
      } as any));

      store.dispatch(requestSearch('asdf'));
      store.dispatch(receiveSearchResults({ hits: { hits: [hit] } } as any));

      const selectedResult = {result: hit, highlight: 0};
      hook({} as any);

      expect(dispatch).toHaveBeenCalledWith(selectSearchResult(selectedResult));
    });

    it('noops if current selected result is the same as navigation selected result', () => {
      const hit = makeSearchResultHit({book, page});
      store.dispatch(navigationLocationChange({
        location: { hash: hit.source.elementId, search: `?query=asdf&target=${searchScrollTargetStringified}` },
      } as any));

      store.dispatch(requestSearch('asdf'));
      store.dispatch(receiveSearchResults({ hits: { hits: [hit] } } as any));

      const selectedResult = {result: hit, highlight: 0};
      hook({} as any);

      expect(dispatch).toHaveBeenCalledWith(selectSearchResult(selectedResult));

      dispatch.mockClear();

      hook({} as any);

      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('receiveSearchHook', () => {
    let hook: ReturnType<typeof receiveSearchHook>;
    const hit = makeSearchResultHit({book, page});

    const go = (hits: SearchResultHit[] = [], meta?: ArgumentTypes<typeof receiveSearchResults>[1]) =>
      hook(receiveSearchResults(makeSearchResults(hits), meta));

    beforeEach(() => {
      hook = receiveSearchHook(helpers);
    });

    it('noops if search, page, and selected search match intended already', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      store.dispatch(requestSearch('asdf'));
      store.dispatch(selectSearchResult({result: hit, highlight: 0}));
      go([hit], { searchScrollTarget: { type: 'search', index: 0, elementId: hit.source.elementId }});
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('noops if there is no book or page selected', () => {
      go([hit]);
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('noops if page is loading', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      const mock = jest.spyOn(selectors, 'loadingPage')
        .mockReturnValue({ slug: 'any' });
      go([hit]);
      expect(dispatch).not.toHaveBeenCalled();
      mock.mockReset();
    });

    it('noops if book is different than initiated the search', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      go([
        {
          ...hit,
          index: 'asdf@4_i1',
        },
      ]);
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('noops if page is undefined and search query has no hits', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(requestSearch('asdf'));
      go([]);

      expect(dispatch).not.toHaveBeenCalledWith(selectSearchResult);
      expect(dispatch).not.toHaveBeenCalledWith(replace);
    });

    it('throws if index string is improperly formatted', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      store.dispatch(requestSearch('asdf'));
      expect(() =>
        go([
          {
            ...hit,
            index: 'asdf',
          },
        ])
      ).toThrowErrorMatchingInlineSnapshot(
        `"impropertly formatted index string: \\"asdf\\""`
      );
    });

    it('dispatches PUSH with first page and search query when page is different', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...shortPage, references: [] }));
      store.dispatch(requestSearch('asdf'));

      go([hit]);
      expect(dispatch).toHaveBeenCalledWith(selectSearchResult({ result: hit, highlight: 0 }));

      const search = queryString.stringify({
        query: 'asdf',
        target: JSON.stringify({ type: 'search', index: 0 }),
      });
      expect(dispatch).toHaveBeenCalledWith(
        push({
          params: expect.anything(),
          route: content,
          state: {
            bookUid: book.id,
            bookVersion: book.version,
            pageUid: page.id,
          },
        }, {
          hash: hit.source.elementId,
          search,
        })
      );
    });

    it('dispatches REPLACE with search query when page is the same', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      store.dispatch(requestSearch('asdf'));

      go([hit]);

      const search = queryString.stringify({
        query: 'asdf',
        target: JSON.stringify({ type: 'search', index: 0 }),
      });
      expect(dispatch).toHaveBeenCalledWith(
        replace({
          params: expect.anything(),
          route: content,
          state: {
            bookUid: book.id,
            bookVersion: book.version,
            pageUid: page.id,
          },
        }, {
          hash: hit.source.elementId,
          search,
        })
      );
    });

    it('dispatches REPLACE with search query that has no hits', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      store.dispatch(requestSearch('asdf'));
      go([]);

      const search = queryString.stringify({
        query: 'asdf',
      });

      expect(dispatch).not.toHaveBeenCalledWith(selectSearchResult);
      expect(dispatch).toHaveBeenCalledWith(
        replace({
          params: expect.anything(),
          route: content,
          state: {
            bookUid: book.id,
            bookVersion: book.version,
            pageUid: page.id,
          },
        }, {
          search,
        })
      );
    });

    it('uses the provided search scroll target', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      store.dispatch(requestSearch('asdf'));
      const hit2 = makeSearchResultHit({book, page});
      store.dispatch(receiveSearchResults({ hits: { hits: [hit, hit2] } } as any));
      Object.defineProperty(hit2.source, 'elementId', { value: 'elem' });

      go([hit, hit2], {searchScrollTarget: { type: 'search', index: 1, elementId: hit2.source.elementId }});
      expect(dispatch).toHaveBeenCalledWith(selectSearchResult({ result: hit2, highlight: 1 }));

      const search = queryString.stringify({
        query: 'asdf',
        target: JSON.stringify({ type: 'search', index: 1 }),
      });
      expect(dispatch).toHaveBeenCalledWith(
        replace({
          params: expect.anything(),
          route: content,
          state: {
            bookUid: book.id,
            bookVersion: book.version,
            pageUid: page.id,
          },
        }, {
          hash: hit2.source.elementId,
          search,
        })
      );
    });
  });
});
