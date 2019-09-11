import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { resetModules } from '../../../test/utils';
import { AppServices } from '../../types';

describe('Home', () => {
  let React: any; // tslint:disable-line:variable-name
  let Provider: any; // tslint:disable-line:variable-name
  let Home: any; // tslint:disable-line:variable-name
  let renderer: any;
  let MessageProvider: any; // tslint:disable-line:variable-name
  let Services: any; // tslint:disable-line:variable-name
  let services: AppServices;

  beforeEach(() => {
    resetModules();
    React = require('react');
    Provider = require('react-redux').Provider;
    renderer = require('react-test-renderer');
    Home = require('./Home').default;
    Services = require('../../context/Services');
    MessageProvider = require('../../MessageProvider').default;

    services = createTestServices();
  });

  it('matches snapshot', async() => {
    const store = createTestStore({navigation: new URL('https://localhost')});
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Home />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    // defer promises...
    await new Promise((resolve) => setTimeout(resolve, 1));

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
