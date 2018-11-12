import { Location } from 'history';
import cloneDeep from 'lodash/fp/cloneDeep';
import { locationChange } from '../../navigation/actions';
import { Match } from '../../navigation/types';
import { AppState, Dispatch, MiddlewareAPI } from '../../types';
import * as actions from '../actions';
import { initialState } from '../reducer';
import * as routes from '../routes';
import { ArchiveContent, Book, Page, Params, State } from '../types';

describe('locationChange', () => {
  let localState: State;
  let appState: AppState;
  let archiveLoader: jest.SpyInstance;
  let dispatch: jest.SpyInstance;
  let helpers: MiddlewareAPI;
  let payload: {location: Location, match: Match<typeof routes.content>};
  let action: ReturnType<typeof locationChange>;
  let hook = require('./locationChange').default;
  const next: Dispatch = (a) => a;

  beforeEach(() => {
    localState = cloneDeep(initialState);
    appState = {content: localState} as AppState;

    archiveLoader = jest.spyOn(require('../utils'), 'archiveLoader');
    archiveLoader.mockImplementation(() => Promise.resolve({} as ArchiveContent));

    dispatch = jest.fn((a) => a);
    helpers = {
      dispatch, getState: () => appState,
    } as any as MiddlewareAPI;

    payload = {location: {} as Location, match: {route: routes.content, params: {} as Params}};
    action = locationChange(payload);

    hook = require('./locationChange').default;
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
    expect(archiveLoader).toHaveBeenCalledWith('bookId');
  });

  it('doesn\'t load book if its already loaded', () => {
    localState.book = {
      id: 'bookId',
    } as Book;
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestBook('bookId'));
    expect(archiveLoader).not.toHaveBeenCalledWith('bookId');
  });

  it('doesn\'t load book if its already loading', () => {
    localState.loading.book = 'bookId';
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestBook('bookId'));
    expect(archiveLoader).not.toHaveBeenCalledWith('bookId');
  });

  it('loads page', () => {
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).toHaveBeenCalledWith(actions.requestPage('pageId'));
    expect(archiveLoader).toHaveBeenCalledWith('bookId:pageId');
    expect(archiveLoader).not.toHaveBeenCalledWith('pageId');
  });

  it('doesn\'t load page if its already loaded', () => {
    localState.page = {
      id: 'pageId',
    } as Page;
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestPage('pageId'));
    expect(archiveLoader).not.toHaveBeenCalledWith('bookId:pageId');
    expect(archiveLoader).not.toHaveBeenCalledWith('pageId');
  });

  it('doesn\'t load page if its already loading', () => {
    localState.loading.page = 'pageId';
    localState.params = payload.match.params = {
      bookId: 'bookId',
      pageId: 'pageId',
    };

    hook(helpers)(next)(action);
    expect(dispatch).not.toHaveBeenCalledWith(actions.requestPage('pageId'));
    expect(archiveLoader).not.toHaveBeenCalledWith('bookId:pageId');
    expect(archiveLoader).not.toHaveBeenCalledWith('pageId');
  });
});
