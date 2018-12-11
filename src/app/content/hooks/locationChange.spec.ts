import { Location } from 'history';
import cloneDeep from 'lodash/fp/cloneDeep';
import { combineReducers, createStore } from 'redux';
import FontCollector from '../../../helpers/FontCollector';
import PromiseCollector from '../../../helpers/PromiseCollector';
import mockArchiveLoader, { book, page } from '../../../test/mocks/archiveLoader';
import { locationChange } from '../../navigation/actions';
import { Match } from '../../navigation/types';
import { AppServices, AppState, Dispatch, MiddlewareAPI } from '../../types';
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
  let action: ReturnType<typeof locationChange>;
  let hook = require('./locationChange').default;
  const next: Dispatch = (a) => a;

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
    action = locationChange(payload);

    hook = (require('./locationChange').default)(helpers);
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('loads book', () => {
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).toHaveBeenCalledWith(actions.requestBook('bookId'));
    expect(archiveLoader.mock.loadBook).toHaveBeenCalledWith('bookId', undefined);
  });

  it('doesn\'t load book if its already loaded', () => {
    localState.book = cloneDeep(book);
    localState.params = payload.match.params = {
      bookId: 'book',
      pageId: 'page',
    };

    hook(helpers)(next)(action);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestBook('book'));
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalled();
  });

  it('doesn\'t load book if its already loading', () => {
    localState.params = payload.match.params = {
      bookId: 'book',
      pageId: 'page',
    };

    archiveLoader.mock.loadBook.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(book), 100))
    );

    hook(helpers)(next)(action);
    hook(helpers)(next)(action);
    hook(helpers)(next)(action);

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(1, actions.requestBook('book'));
    expect(dispatch).toHaveBeenNthCalledWith(2, actions.requestPage('page'));

    expect(archiveLoader.mock.loadBook).toHaveBeenCalledTimes(1);
  });

  it('loads page', () => {
    localState.params = payload.match.params = {
      bookId: 'book',
      pageId: 'page',
    };

    hook(helpers)(next)(action);
    expect(dispatch).toHaveBeenCalledWith(actions.requestPage('page'));
    expect(archiveLoader.mock.loadPage).toHaveBeenCalledWith('book', undefined, 'page');
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('page', undefined);
  });

  it('doesn\'t load page if its already loaded', () => {
    localState.page = cloneDeep(page);
    localState.params = payload.match.params = {
      bookId: 'book',
      pageId: 'page',
    };

    hook(helpers)(next)(action);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestPage('page'));
    expect(archiveLoader.mock.loadPage).not.toHaveBeenCalled();
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('page', undefined);
  });

  it('doesn\'t load page if its already loading', () => {
    localState.params = payload.match.params = {
      bookId: 'book',
      pageId: 'page',
    };

    hook(helpers)(next)(action);
    hook(helpers)(next)(action);
    hook(helpers)(next)(action);
    hook(helpers)(next)(action);

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

    hook(helpers)(next)(action);
    expect(spy).toHaveBeenCalledWith(mockFont);
  });

  it('doesn\'t break if there are no fonts in the css', () => {
    jest.mock('cnx-recipes/styles/output/intro-business.json', () => `""`);
    const spy = jest.spyOn(helpers.fontCollector, 'add');
    jest.resetModules();
    hook = (require('./locationChange').default)(helpers);

    hook(helpers)(next)(action);
    expect(spy).not.toHaveBeenCalled();
  });

  it('loads more specific data when available', () => {
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    payload.match.state = {
      bookUid: 'longbookid',
      bookVersion: 'bookversion',
      pageUid: 'longpageid',
    };

    hook(helpers)(next)(action);
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('bookId', undefined);
    expect(archiveLoader.mock.loadPage).not.toHaveBeenCalledWith('bookId', undefined, 'pageId');
    expect(archiveLoader.mock.loadBook).toHaveBeenCalledWith('longbookid', 'bookversion');
    expect(archiveLoader.mock.loadPage).toHaveBeenCalledWith('longbookid', 'bookversion', 'longpageid');
  });
});
