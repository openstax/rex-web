import { SearchResultHit } from '@openstax/open-search-client/models/SearchResultHit';
import queryString from 'querystring';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { makeSearchResultHit, makeSearchResults } from '../../../test/searchResults';
import { locationChange as navigationLocationChange, replace } from '../../navigation/actions';
import { AppServices, ArgumentTypes, MiddlewareAPI, Store } from '../../types';
import { receiveBook, receivePage } from '../actions';
import { content } from '../routes';
import * as selectors from '../selectors';
import { formatBookData } from '../utils';
import { clearSearch, receiveSearchResults, requestSearch, selectSearchResult } from './actions';
import { clearSearchHook, openSearchInSidebarHook, receiveSearchHook, requestSearchHook, syncSearch } from './hooks';
import { SearchScrollTarget } from './types';
import { ToastMesssageError } from '../../../helpers/applicationMessageError';
import Sentry from '../../../helpers/Sentry';

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
    helpers.searchClient.search = jest.fn().mockReturnValue(Promise.resolve({
      hits: {
        hits: [
          {highlight: {visibleContent: ['asdf', 'moon']}, score: 1},
          {highlight: {title: ['asdf']}, score: 1},
        ],
      },
    }));
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

    it('searches with quoted term', async() => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      await hook(requestSearch('asdf "moon"'));
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
      (helpers.searchClient.search as any).mockReturnValue(
        Promise.resolve('searchresults')
      );
      await hook(requestSearch('asdf'));
      expect(dispatch).toHaveBeenCalledWith(
        receiveSearchResults('searchresults' as any)
      );
    });

    it('throws a custom toast error when the network connection is flaky/offline', async() => {
      const captureException = jest.spyOn(Sentry, 'captureException').mockImplementation(() => undefined);
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      (helpers.searchClient.search as any).mockReturnValue(
        Promise.reject(new TypeError('Failed to fetch'))
      );
      try {
        await hook(requestSearch('asdf'));
      } catch (e) {
        expect(captureException).not.toHaveBeenCalled();
        expect(e).toBeInstanceOf(ToastMesssageError);
      }
    });

    it('captures errors if something else went wrong with the fetch', async() => {
      const captureException = jest.spyOn(Sentry, 'captureException').mockImplementation(() => undefined);

      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      (helpers.searchClient.search as any).mockReturnValue(
        Promise.reject('Internal Error')
      );
      try {
        await hook(requestSearch('asdf'));
      } catch (e) {
        expect(captureException).toHaveBeenCalledWith('Internal Error');
        expect(e).toBeInstanceOf(ToastMesssageError);
      }
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

    it('noops if there was no query', () => {
      const spy = jest.spyOn(helpers.history, 'replace');

      store.dispatch(navigationLocationChange({
        location: { hash: '', search: '' },
        query: {},
      } as any));

      hook(clearSearch());

      expect(spy).not.toHaveBeenCalled();
    });

    it('does not modify target or hash that are not from search', () => {
      const mockNOTSearchScrollTarget = `target=${JSON.stringify({ type: 'highlight', id: 'asd' })}`;
      const spy = jest.spyOn(helpers.history, 'replace');

      store.dispatch(navigationLocationChange({
        location: { hash: 'elementId', search: mockNOTSearchScrollTarget },
        query: { target: mockNOTSearchScrollTarget },
      } as any));

      hook(clearSearch());

      expect(spy).toHaveBeenCalledWith({
        hash: 'elementId', search: `target=%7B%22type%22%3A%22highlight%22%2C%22id%22%3A%22asd%22%7D`,
      });
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
      expect(dispatch).toHaveBeenCalledTimes(1);
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
      expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it('noops if page is undefined and search query has no hits', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(requestSearch('asdf'));
      go([]);

      expect(dispatch).not.toHaveBeenCalledWith(selectSearchResult);
      expect(dispatch).not.toHaveBeenCalledWith(replace);
    });

    it('dispatches REPLACE with search query when page is the same', () => {
      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      store.dispatch(requestSearch('asdf'));

      go([hit], {searchScrollTarget: {type: 'search', index: 0, elementId: 'elem'}});

      const search = queryString.stringify({
        query: 'asdf',
      });
      expect(dispatch).toHaveBeenCalledWith(
        replace({
          params: expect.anything(),
          route: content,
          state: { },
        }, {
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
          state: { },
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
          state: { },
        }, {
          hash: hit2.source.elementId,
          search,
        })
      );
    });
  });

  describe('openSearchInSidebarHook', () => {
    let hook: ReturnType<typeof openSearchInSidebarHook>;

    beforeEach(() => {
      hook = openSearchInSidebarHook(helpers);
    });

    it('noops if there is no previous state', () => {
      const spy = jest.spyOn(helpers.history, 'replace');

      hook({} as any);

      expect(spy).not.toHaveBeenCalled();
    });

    it('noops if query does not exist', () => {
      const spy = jest.spyOn(helpers.history, 'replace');

      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      store.dispatch(requestSearch(''));
      const hit = makeSearchResultHit({book, page});
      store.dispatch(receiveSearchResults({ hits: { hits: [hit] } } as any));
      store.dispatch(selectSearchResult({ result: hit, highlight: 0 }));

      store.dispatch(clearSearch());

      hook({} as any);

      expect(spy).not.toHaveBeenCalled();
    });

    it('restores search query', () => {
      const spy = jest.spyOn(helpers.history, 'replace');
      const search = queryString.stringify({ query: 'asdf' });

      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      store.dispatch(requestSearch('asdf'));
      const hit = makeSearchResultHit({book, page});
      store.dispatch(receiveSearchResults({ hits: { hits: [hit] } } as any));

      store.dispatch(clearSearch());

      hook({} as any);

      expect(spy).toHaveBeenCalledWith({ hash: '', search });
    });

    it('restores search query with selected result', () => {
      const spy = jest.spyOn(helpers.history, 'replace');
      const search = queryString.stringify({
        query: 'asdf',
        target: JSON.stringify({ type: 'search', index: 0 }),
      });

      store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
      store.dispatch(receivePage({ ...page, references: [] }));
      store.dispatch(requestSearch('asdf'));
      const hit = makeSearchResultHit({book, page});
      store.dispatch(receiveSearchResults({ hits: { hits: [hit] } } as any));
      store.dispatch(selectSearchResult({ result: hit, highlight: 0 }));

      store.dispatch(clearSearch());

      hook({} as any);

      expect(spy).toHaveBeenCalledWith({
        hash: hit.source.elementId, search,
      });
    });
  });
});
