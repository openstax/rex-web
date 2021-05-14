import { createMemoryHistory } from 'history';
import { notFound } from '../errors/routes';
import { AnyAction } from '../types';
import { assertWindow } from '../utils/browser-assertions';
import * as actions from './actions';

const routes = [
  {
    component: () => null,
    getUrl: () => 'url',
    name: 'test1',
    paths: ['/test1'],
  },
  {
    component: () => null,
    getUrl: () => 'url',
    name: 'test2',
    paths: ['/test2'],
  },
];

describe('navigation middleware', () => {
  let middleware = require('./middleware');

  beforeEach(() => {
    middleware = require('./middleware').default;

    Object.defineProperty(assertWindow(), 'location', {
      value: {
        assign: jest.fn(),
        replace: jest.fn(),
      },
    });
  });

  it('calls history when callHistoryMethod is dispatched', () => {
    const history = createMemoryHistory();
    const next = jest.fn((_: AnyAction) => undefined);
    const dispatch = jest.fn((_: AnyAction) => undefined);

    const pushSpy = jest.spyOn(history, 'push');
    pushSpy.mockImplementation(() => null);

    middleware([], history)({dispatch})(next)(actions.callHistoryMethod({
      method: 'push',
      params: {},
      route: routes[0],
      state: {},
    }));

    expect(pushSpy).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('calls history with state', () => {
    const history = createMemoryHistory();
    const next = jest.fn((_: AnyAction) => undefined);
    const dispatch = jest.fn((_: AnyAction) => undefined);
    const state = {
      bookUid: '',
      bookVersion: '',
      pageUid: '',
    };

    const pushSpy = jest.spyOn(history, 'push');
    pushSpy.mockImplementation(() => null);

    middleware([], history)({dispatch})(next)(actions.callHistoryMethod({
      method: 'push',
      params: {},
      route: routes[0],
      state,
    }));

    expect(pushSpy).toHaveBeenCalledWith({
      hash: undefined,
      pathname: 'url',
      search: '',
      state,
    });
  });

  it('doesn\'t call history for not found (push)', () => {
    const history = createMemoryHistory();
    const next = jest.fn((_: AnyAction) => undefined);
    const dispatch = jest.fn((_: AnyAction) => undefined);

    const locationSpy = jest.spyOn(assertWindow().location, 'assign');
    locationSpy.mockReturnValue(undefined);

    const pushSpy = jest.spyOn(history, 'push');
    pushSpy.mockReturnValue(undefined);

    middleware([], history)({dispatch})(next)(actions.callHistoryMethod({
      method: 'push',
      params: {url: 'asdf'},
      route: notFound,
      state: {},
    }));

    expect(pushSpy).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('doesn\'t call history for not found (replace)', () => {
    const history = createMemoryHistory();
    const next = jest.fn((_: AnyAction) => undefined);
    const dispatch = jest.fn((_: AnyAction) => undefined);

    const locationSpy = jest.spyOn(assertWindow().location, 'replace');
    locationSpy.mockReturnValue(undefined);

    const pushSpy = jest.spyOn(history, 'push');
    pushSpy.mockReturnValue(undefined);

    middleware([], history)({dispatch})(next)(actions.callHistoryMethod({
      method: 'replace',
      params: {url: 'asdf'},
      route: notFound,
      state: {},
    }));

    expect(pushSpy).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches locationChange when history updates externally', () => {
    const history = createMemoryHistory();
    const dispatch = jest.fn((_: AnyAction) => undefined);

    middleware([], history)({dispatch});

    history.push('/foobar');

    expect(dispatch).toHaveBeenCalledWith(actions.locationChange({location: history.location, action: 'PUSH'}));
  });

  it('dispatches locationChange with matching route', () => {
    const history = createMemoryHistory();
    const dispatch = jest.fn((_: AnyAction) => undefined);

    middleware(routes, history)({dispatch});

    history.push('/test2');

    expect(dispatch).toHaveBeenCalledWith(actions.locationChange({
      action: 'PUSH',
      location: history.location,
      match: {route: routes[1], params: {}, state: {}},
    }));
  });
});
