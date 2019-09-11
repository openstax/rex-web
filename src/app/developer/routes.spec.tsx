import { resetModules } from '../../test/utils';
import { AppServices } from '../types';

describe('developer route', () => {
  let React: any; // tslint:disable-line:variable-name
  let renderer: any;
  let createApp: any;
  let developerHome: any;

  it('makes a url', () => {
    developerHome = require('./routes').default;
    expect(developerHome.getUrl()).toEqual(developerHome.paths[0]);
  });

  describe('route renders', () => {
    const windowBackup = window;
    const documentBackup = document;

    beforeEach(() => {
      resetModules();
      delete (global as any).window;
      delete (global as any).document;
      React = require('react');
      renderer = require('react-test-renderer');
      createApp = require('../index').default;
      developerHome = require('./routes').default;
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('renders a component', () => {
      const services = {
      } as AppServices;

      const match = {
        route: developerHome,
      };
      const app = createApp({
        initialEntries: [match],
        services,
      });

      const tree = renderer
          .create(<app.container />)
          .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
