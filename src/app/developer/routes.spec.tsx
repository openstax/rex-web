import React from 'react';
import createApp from '../index';
import { AppServices } from '../types';
import { routes } from './routes';

describe('developer route', () => {
  it('makes a url', () => {
    expect(routes.getUrl()).toEqual(routes.paths[0]);
  });

  describe('route renders', () => {
    const windowBackup = window;
    const documentBackup = document;
    let renderer: any;

    beforeEach(() => {
      delete (global as any).window;
      delete (global as any).document;
      renderer = require('react-test-renderer');
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('renders a component', () => {
      const services = {
      } as AppServices;

      const match = {
        route: routes,
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
