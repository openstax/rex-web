import createTestServices from '../test/createTestServices';
import createTestStore from '../test/createTestStore';
import { reactAndFriends, resetModules } from '../test/utils';
import { notFound } from './errors/routes';
import { AnyMatch } from './navigation/types';
import { AppServices, MiddlewareAPI, Store } from './types';
let React: any; // tslint:disable-line:variable-name
let renderer: any;

jest.mock('../config', () => ({
  DEPLOYED_ENV: 'test',
  RELEASE_ID: '1234',
  SENTRY_ENABLED: false,
}));

describe('create app', () => {
  let history = require('history');
  let createApp = require('./index').default;
  let createBrowserHistory: jest.SpyInstance;
  let createMemoryHistory: jest.SpyInstance;
  let services: AppServices & MiddlewareAPI;
  let store: Store;

  beforeEach(() => {
    jest.resetAllMocks();
    resetModules();
    ({React, renderer} = reactAndFriends());
    history = require('history');
    store = createTestStore();
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    createBrowserHistory = jest.spyOn(history, 'createBrowserHistory');
    createMemoryHistory = jest.spyOn(history, 'createMemoryHistory');
  });

  it('uses browser history in the browser', () => {
    createApp = require('./index').default;
    createApp({services});
    expect(createBrowserHistory).toHaveBeenCalled();
    expect(createMemoryHistory).not.toHaveBeenCalled();
  });

  it('adds sentry enhancer when enabled', () => {
    const mockedSentry = require('../helpers/Sentry').default;
    mockedSentry.shouldCollectErrors = true;

    const initialize = jest.spyOn(mockedSentry, 'initialize');
    initialize.mockReturnValue(mockedSentry.initialize);

    const createReduxEnhancer = jest.spyOn(mockedSentry, 'createReduxEnhancer');
    createReduxEnhancer.mockImplementation(() => (next: any) => (action: any) => next(action));

    createApp = require('./index').default;
    createApp({services});
    expect(initialize).toHaveBeenCalled();
    expect(createReduxEnhancer).toHaveBeenCalled();
  });

  describe('outside the browser', () => {
    const windowBackup = window;

    beforeEach(() => {
      delete (global as any).window;
    });

    afterEach(() => {
      (global as any).window = windowBackup;
    });

    it('uses memory history', () => {
      createApp = require('./index').default;
      createApp({services});
      expect(createBrowserHistory).not.toHaveBeenCalled();
      expect(createMemoryHistory).toHaveBeenCalled();
    });

    it('initializes the location url when initialEntries is passed', () => {
      createApp = require('./index').default;
      const match = {route: {getUrl: jest.fn(() => 'url')}} as unknown as AnyMatch;
      const app = createApp({services, initialEntries: [match]});

      expect(app.history.location.pathname).toEqual('url');
      expect(match.route.getUrl).toHaveBeenCalled();
    });

    it('initializes the location state when initialEntries is passed', () => {
      createApp = require('./index').default;
      const match = {state: 'asdf', route: {getUrl: jest.fn(() => 'url')}} as unknown as AnyMatch;
      const app = createApp({services, initialEntries: [match]});

      expect(app.history.location.state).toEqual('asdf');
    });

    it('doesn\'t add sentry middleware when not enabled', () => {
      jest.doMock('../config', () => ({
        DEPLOYED_ENV: 'test',
        RELEASE_ID: '1234',
        SENTRY_ENABLED: false,
      }));
      const initialize = jest.spyOn(require('../helpers/Sentry').default, 'initialize');
      createApp = require('./index').default;
      createApp({services});
      expect(initialize).not.toHaveBeenCalled();
    });

    it('doesn\'t add sentry middleware when it is enabled', () => {
      jest.doMock('../config', () => ({
        DEPLOYED_ENV: 'test',
        RELEASE_ID: '1234',
        SENTRY_ENABLED: true,
      }));
      const initialize = jest.spyOn(require('../helpers/Sentry').default, 'initialize');
      createApp = require('./index').default;
      createApp({services});
      expect(initialize).not.toHaveBeenCalled();
    });
  });

  describe('container', () => {
    it('renders', () => {
      if (!window) {
        return expect(window).toBeTruthy();
      }
      const newLocation = {
        ...window.location,
        pathname: notFound.getUrl({url: 'url'}),
        replace: jest.fn(),
      };
      delete (window as any).location;
      window.location = newLocation;

      createApp = require('./index').default;
      const app = createApp({
        initialEntries: [
          {code: 404, page: {route: notFound}},
        ],
        services,
      });

      const tree = renderer
        .create(<app.container />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
