import { Location } from 'history';
import React from 'react';
import renderer from 'react-test-renderer';
import { AnyMatch } from './navigation/types';
import { AppServices, AppState } from './types';

describe('create app', () => {
  let history = require('history');
  let createApp = require('./index').default;
  let createBrowserHistory: jest.SpyInstance;
  let createMemoryHistory: jest.SpyInstance;
  let navigationInit: jest.SpyInstance;
  const services = {} as AppServices;

  beforeEach(() => {
    jest.resetModules();
    history = require('history');
    navigationInit = jest.spyOn(require('./navigation').utils, 'init');
    createApp = require('./index').default;

    createBrowserHistory = jest.spyOn(history, 'createBrowserHistory');
    createMemoryHistory = jest.spyOn(history, 'createMemoryHistory');
  });

  it('uses browser history in the browser', () => {
    createApp({services});
    expect(createBrowserHistory).toHaveBeenCalled();
    expect(createMemoryHistory).not.toHaveBeenCalled();
  });

  it('does not initialize location if initialState is passed', () => {
    const location = {cool: 'location'} as any as Location;
    const initialState = {navigation: location} as AppState;
    createApp({services, initialState});

    expect(navigationInit).not.toHaveBeenCalled();
  });

  it('initializes the location state when initialEntries is passed', () => {
    const match = {state: 'asdf'} as unknown as AnyMatch;
    const app = createApp({services, initialEntries: [match]});

    expect(app.history.location.state).toEqual('asdf');
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
      createApp({services});
      expect(createBrowserHistory).not.toHaveBeenCalled();
      expect(createMemoryHistory).toHaveBeenCalled();
    });

    it('initializes the location url when initialEntries is passed', () => {
      const match = {route: {getUrl: jest.fn(() => 'url')}} as unknown as AnyMatch;
      const app = createApp({services, initialEntries: [match]});

      expect(app.history.location.pathname).toEqual('url');
      expect(match.route.getUrl).toHaveBeenCalled();
    });
  });

  describe('container', () => {
    it('renders', () => {
      const app = createApp({services});
      const tree = renderer
        .create(<app.container />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
