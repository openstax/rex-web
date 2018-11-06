import * as history from 'history';
import createApp from './index';

describe('create app', () => {
  let createBrowserHistory: jest.SpyInstance;
  let createMemoryHistory: jest.SpyInstance;

  beforeEach(() => {
    createBrowserHistory = jest.spyOn(history, 'createBrowserHistory');
    createMemoryHistory = jest.spyOn(history, 'createMemoryHistory');
  });

  it('uses browser history in the browser', () => {
    createApp();
    expect(createBrowserHistory).toHaveBeenCalled();
    expect(createMemoryHistory).not.toHaveBeenCalled();
  });

  describe('outside the browser', () => {
    const windowBackup = window;

    beforeEach(() => {
      window = undefined;
    });

    afterEach(() => {
      window = windowBackup;
    });

    it('uses memory history', () => {
      createApp();
      expect(createBrowserHistory).toHaveBeenCalled();
      expect(createMemoryHistory).not.toHaveBeenCalled();
    });
  });
});
