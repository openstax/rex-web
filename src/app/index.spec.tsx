import React from 'react';
import renderer from 'react-test-renderer';
import { notFound } from './errors/routes';
import { AnyMatch } from './navigation/types';
import { AppServices } from './types';
import { Middleware } from 'redux';

var mockedSentry = {
  isEnabled: false,
  initializeWithMiddleware: jest.fn(
    (() => () => (next) => (action: any) => { next(action); }) as Middleware
  ),
};

jest.mock('../helpers/Sentry', () => mockedSentry);

describe('create app', () => {
  let history = require('history');
  let createApp = require('./index').default;
  let createBrowserHistory: jest.SpyInstance;
  let createMemoryHistory: jest.SpyInstance;
  const services = {} as AppServices;

  beforeEach(() => {
    jest.resetModules();
    history = require('history');
    createApp = require('./index').default;

    createBrowserHistory = jest.spyOn(history, 'createBrowserHistory');
    createMemoryHistory = jest.spyOn(history, 'createMemoryHistory');
  });

  it('uses browser history in the browser', () => {
    createApp({services});
    expect(createBrowserHistory).toHaveBeenCalled();
    expect(createMemoryHistory).not.toHaveBeenCalled();
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

    it('adds sentry middleware when it is enabled', () => {
      mockedSentry.isEnabled = true;
      createApp({services});
      expect(mockedSentry.initializeWithMiddleware).toHaveBeenCalled();
      mockedSentry.isEnabled = false;
    });
  });

  describe('container', () => {
    it('renders', () => {
      if (!window) {
        return expect(window).toBeTruthy();
      }
      const newLocation = {
        ...window.location,
        pathname: notFound.getUrl(),
      };
      delete window.location;
      window.location = newLocation;

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
