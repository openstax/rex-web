import { Location } from 'history';
import React from 'react';
import renderer from 'react-test-renderer';
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

  it('initializes using the location in initialState if it is passed', () => {
    const location = {cool: 'location'} as any as Location;
    const initialState = {navigation: location} as AppState;
    createApp({services, initialState});

    expect(navigationInit).toHaveBeenCalledWith(expect.anything(), location, expect.anything());
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
