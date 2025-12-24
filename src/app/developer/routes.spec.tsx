import createTestServices from '../../test/createTestServices';
import createTestStore from '../../test/createTestStore';
import { reactAndFriends, resetModules } from '../../test/utils';

describe('developer route', () => {
  let React: any;
  let renderer: any;
  let createApp: any;
  let developerHome: any;

  it('makes a url', () => {
    developerHome = require('./routes').developerHome;
    expect(developerHome.getUrl()).toEqual(developerHome.paths[0]);
  });

  describe('route renders', () => {
    const windowBackup = window;
    const documentBackup = document;

    beforeEach(() => {
      delete (global as any).window;
      delete (global as any).document;
      resetModules();
      ({React, renderer} = reactAndFriends());
      createApp = require('../index').default;
      developerHome = require('./routes').developerHome;
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('renders a component', () => {
      const store = createTestStore();
      const services = {
        ...createTestServices(),
        dispatch: store.dispatch,
        getState: store.getState,
      };

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
