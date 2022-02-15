import createTestStore from '../../test/createTestStore';
import { reactAndFriends, resetModules, runHooksAsync } from '../../test/utils';
import { Store } from '../types';
import { assertWindow } from '../utils/browser-assertions';

// tslint:disable: variable-name
describe('SimpleMessageProvider', () => {
  let Provider: ReturnType<typeof reactAndFriends>['Provider'];
  let React: ReturnType<typeof reactAndFriends>['React'];
  let renderer: ReturnType<typeof reactAndFriends>['renderer'];
  let store: Store;
  let SimpleMessageProvider: any;

  beforeEach(async() => {
    resetModules();

    store = createTestStore();
    ({Provider, React, renderer} = reactAndFriends());

    jest.spyOn(assertWindow().navigator, 'language', 'get').mockReturnValue('es');
  });

  it('loads data from the browser locale', async() => {
    let loaded = false;

    jest.doMock('@formatjs/intl-pluralrules/should-polyfill', () => ({
      shouldPolyfill: () => true,
    }));
    jest.doMock('@formatjs/intl-pluralrules/locale-data/es', () => {
      loaded = true;
    });

    SimpleMessageProvider = require('../messages/SimpleMessageProvider').default;

    const component = renderer.create(<Provider store={store}>
      <SimpleMessageProvider />
    </Provider>);

    component.update(<Provider store={store}>
      <SimpleMessageProvider />
    </Provider>);

    await runHooksAsync(renderer);

    expect(loaded).toBe(true);
  });
});
