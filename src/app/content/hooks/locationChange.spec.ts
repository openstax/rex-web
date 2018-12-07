import { Location } from 'history';
import cloneDeep from 'lodash/fp/cloneDeep';
import FontCollector from '../../../helpers/FontCollector';
import PromiseCollector from '../../../helpers/PromiseCollector';
import mockArchiveLoader from '../../../test/mocks/archiveLoader';
import { locationChange } from '../../navigation/actions';
import { Match } from '../../navigation/types';
import { AppServices, AppState, Dispatch, MiddlewareAPI } from '../../types';
import * as actions from '../actions';
import { initialState } from '../reducer';
import * as routes from '../routes';
import { Book, Page, Params, State } from '../types';

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

    archiveLoader = mockArchiveLoader();

    dispatch = jest.fn((a) => a);
    helpers = {
      archiveLoader,
      dispatch,
      fontCollector: new FontCollector(),
      getState: () => appState,
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
    localState.book = {
      shortId: 'bookId',
    } as Book;
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestBook('bookId'));
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalled();
  });

  it('doesn\'t load book if its already loading', () => {
    localState.loading.book = 'bookId';
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestBook('bookId'));
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalled();
  });

  it('loads page', () => {
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).toHaveBeenCalledWith(actions.requestPage('pageId'));
    expect(archiveLoader.mock.loadPage).toHaveBeenCalledWith('bookId', undefined, 'pageId');
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('pageId', undefined);
  });

  it('doesn\'t load page if its already loaded', () => {
    localState.page = {
      shortId: 'pageId',
    } as Page;
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestPage('pageId'));
    expect(archiveLoader.mock.loadPage).not.toHaveBeenCalled();
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('pageId', undefined);
  });

  it('doesn\'t load page if its already loading', () => {
    localState.loading.page = 'pageId';
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestPage('pageId'));
    expect(archiveLoader.mock.loadPage).not.toHaveBeenCalled();
    expect(archiveLoader.mock.loadBook).not.toHaveBeenCalledWith('pageId', undefined);
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
