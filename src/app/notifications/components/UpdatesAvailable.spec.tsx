import { resetModules } from '../../../test/utils';

describe('UpdatesAvailable', () => {
  let MessageProvider = require('../../MessageProvider').default; // tslint:disable-line:variable-name
  let React = require('react'); // tslint:disable-line:variable-name
  let UpdatesAvailable = require('./UpdatesAvailable').default; // tslint:disable-line:variable-name
  let renderer = require('react-test-renderer');

  beforeEach(() => {
    resetModules();
  });

  describe('in browser', () => {
    const reloadBackup = window!.location.reload;
    let reload: jest.SpyInstance;

    beforeEach(() => {
      reload = window!.location.reload = jest.fn();
      MessageProvider = require('../../MessageProvider').default;
      React = require('react');
      UpdatesAvailable = require('./UpdatesAvailable').default;
      renderer = require('react-test-renderer');
    });

    afterEach(() => {
      window!.location.reload = reloadBackup;
    });

    it('reloads on click', () => {
      const component = renderer.create(<MessageProvider><UpdatesAvailable /></MessageProvider>);
      component.root.findByType('button').props.onClick();
      expect(reload).toHaveBeenCalled();
    });
  });

  describe('outside the browser', () => {
    const windowBackup = window;
    const documentBackup = document;

    beforeEach(() => {
      delete (global as any).window;
      delete (global as any).document;
      React = require('react');
      renderer = require('react-test-renderer');
      MessageProvider = require('../../MessageProvider').default;
      UpdatesAvailable = require('./UpdatesAvailable').default;
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('does nothing on click', () => {
      const component = renderer.create(<MessageProvider><UpdatesAvailable /></MessageProvider>);
      component.root.findByType('button').props.onClick();
      expect(() => component.root.findByType('button').props.onClick()).not.toThrow();
    });
  });
});
