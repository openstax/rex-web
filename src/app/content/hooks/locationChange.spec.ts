import { Location } from 'history';
import cloneDeep from 'lodash/fp/cloneDeep';
import { combineReducers, createStore } from 'redux';
import FontCollector from '../../../helpers/FontCollector';
import PromiseCollector from '../../../helpers/PromiseCollector';
import mockArchiveLoader, { book, page } from '../../../test/mocks/archiveLoader';
import { Match } from '../../navigation/types';
import { AppServices, AppState, MiddlewareAPI } from '../../types';
import * as actions from '../actions';
import reducer, { initialState } from '../reducer';
import * as routes from '../routes';
import { Params, State } from '../types';

describe('locationChange', () => {
  let localState: State;
  let appState: AppState;
  let archiveLoader: ReturnType<typeof mockArchiveLoader>;
  let dispatch: jest.SpyInstance;
  let helpers: MiddlewareAPI & AppServices;
  let payload: {location: Location, match: Match<typeof routes.content>};
  let hook = require('./locationChange').default;

  beforeEach(() => {
    localState = cloneDeep(initialState);
    appState = {content: localState} as AppState;

    const store = createStore(combineReducers({content: reducer}), appState);

    archiveLoader = mockArchiveLoader();

    dispatch = jest.fn(store.dispatch);

    helpers = {
      archiveLoader,
      dispatch,
      fontCollector: new FontCollector(),
      getState: store.getState,
      promiseCollector: new PromiseCollector(),
    } as any as MiddlewareAPI & AppServices;

    payload = {location: {} as Location, match: {route: routes.content, params: {} as Params}};

    hook = (require('./locationChange').default)(helpers);
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('loads book', async() => {
    payload.match.params = {
      bookId: 'book',
      pageId: 'page',
    };

    await hook(payload);
    expect(dispatch).toHaveBeenCalledWith(actions.requestBook('book'));
    expect(archiveLoader.mock.loadBook).toHaveBeenCalledWith('book', undefined);
  });

  it('doesn\'t load book if its already loaded', async() => {
    localState.book = cloneDeep(book);
    payload.match.params = {
      bookId: 'book',
      pageId: 'page',
    };

    await hook(payload);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestBook('book'));
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalled();
  });

  it('doesn\'t load book if its already loading', () => {
    payload.match.params = {
      bookId: 'book',
      pageId: 'page',
    };

    archiveLoader.mock.loadBook.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(book), 100))
    );

    hook(payload);
    hook(payload);
    hook(payload);

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(1, actions.requestBook('book'));
    expect(dispatch).toHaveBeenNthCalledWith(2, actions.requestPage('page'));
  });

  it('loads page', () => {
    payload.match.params = {
      bookId: 'book',
      pageId: 'page',
    };

    hook(payload);
    expect(dispatch).toHaveBeenCalledWith(actions.requestPage('page'));
    expect(archiveLoader.mock.loadPage).toHaveBeenCalledWith('book', undefined, 'page');
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('page', undefined);
  });

  it('doesn\'t load page if its already loaded', () => {
    localState.page = cloneDeep(page);
    payload.match.params = {
      bookId: 'book',
      pageId: 'page',
    };

    hook(payload);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestPage('page'));
    expect(archiveLoader.mock.loadPage).not.toHaveBeenCalled();
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('page', undefined);
  });

  it('doesn\'t load page if its already loading', () => {
    payload.match.params = {
      bookId: 'book',
      pageId: 'page',
    };

    hook(payload);
    hook(payload);
    hook(payload);
    hook(payload);

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(1, actions.requestBook('book'));
    expect(dispatch).toHaveBeenNthCalledWith(2, actions.requestPage('page'));

    expect(archiveLoader.mock.loadPage).toHaveBeenCalledTimes(1);
  });

  it('adds font to fontcollector', () => {
    const mockFont = 'https://fonts.googleapis.com/css?family=Noto+Sans:400,400i,700,700i';
    jest.mock('cnx-recipes/styles/output/intro-business.json', () => `"${mockFont}"`);
    const spy = jest.spyOn(helpers.fontCollector, 'add');
    jest.resetModules();
    hook = (require('./locationChange').default)(helpers);

    hook(payload);
    expect(spy).toHaveBeenCalledWith(mockFont);
  });

  it('doesn\'t break if there are no fonts in the css', () => {
    jest.mock('cnx-recipes/styles/output/intro-business.json', () => `""`);
    const spy = jest.spyOn(helpers.fontCollector, 'add');
    jest.resetModules();
    hook = (require('./locationChange').default)(helpers);

    hook(payload);
    expect(spy).not.toHaveBeenCalled();
  });

  it('loads more specific data when available', async() => {
    payload.match.params = {
      bookId: 'book',
      pageId: 'page',
    };

    payload.match.state = {
      bookUid: 'booklongid',
      bookVersion: '0',
      pageUid: 'pagelongid',
    };

    hook(payload);
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('book', undefined);
    expect(archiveLoader.mock.loadPage).not.toHaveBeenCalledWith('book', undefined, 'page');
    expect(archiveLoader.mock.loadBook).toHaveBeenCalledWith('booklongid', '0');
    expect(archiveLoader.mock.loadPage).toHaveBeenCalledWith('booklongid', '0', 'pagelongid');
  });

  it('loads a page with a content reference', async() => {
    archiveLoader.mockPage(book, {
      content: 'some /contents/pagelongid content',
      id: 'asdfasfasdfasdf',
      shortId: 'asdf',
      title: 'qwerqewrqwer',
      version: '0',
    });

    payload.match.params = {
      bookId: 'book',
      pageId: 'asdf',
    };

    payload.match.state = {
      bookUid: 'booklongid',
      bookVersion: '0',
      pageUid: 'asdfasfasdfasdf',
    };

    await hook(payload);

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({payload: expect.objectContaining({references: [{
      match: '/contents/pagelongid',
      params: {
        bookId: 'book',
        pageId: 'page',
      },
      state: {
        bookUid: 'booklongid',
        bookVersion: '0',
        pageUid: 'pagelongid',
      },
    }]})}));
  });

  it('throws on cross book reference', async() => {
    archiveLoader.mockPage(book, {
      content: 'some /contents/book:pagelongid content',
      id: 'adsfasdf',
      shortId: 'asdf',
      title: 'qerqwer',
      version: '0',
    });

    payload.match.params = {
      bookId: 'book',
      pageId: 'asdf',
    };

    let message: string | undefined;

    try {
      await hook(payload);
    } catch (e) {
      message = e.message;
    }

    expect(message).toEqual('BUG: Cross book references are not supported');
  });

  it('throws on unknown id', async() => {
    archiveLoader.mockPage(book, {
      content: 'some /contents/qwerqwer content',
      id: 'adsfasdf',
      shortId: 'asdf',
      title: 'qerqwer',
      version: '0',
    });

    payload.match.params = {
      bookId: 'book',
      pageId: 'asdf',
    };

    let message: string | undefined;

    try {
      await hook(payload);
    } catch (e) {
      message = e.message;
    }

    expect(message).toEqual('BUG: qwerqwer is not present in the ToC');
  });
});
