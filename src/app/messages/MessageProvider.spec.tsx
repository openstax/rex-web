import { Provider } from 'react-redux';
import createTestServices from '../../test/createTestServices';
import createTestStore from '../../test/createTestStore';
import { book as archiveBook } from '../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../test/mocks/osWebLoader';
import { reactAndFriends, resetModules } from '../../test/utils';
import { receiveBook } from '../content/actions';
import { formatBookData } from '../content/utils';
import * as Services from '../context/Services';
import { Store } from '../types';

const book = formatBookData(archiveBook, mockCmsBook);

describe('MessageProvider', () => {
  let React: ReturnType<typeof reactAndFriends>['React']; // tslint:disable-line:variable-name
  let renderer: ReturnType<typeof reactAndFriends>['renderer'];
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  // tslint:disable-next-line: variable-name
  let MessageProvider: any;

  beforeEach(() => {
    resetModules();

    store = createTestStore();
    services = createTestServices();
    ({React, renderer} = reactAndFriends());
    store.dispatch(receiveBook(book));
  });

  it('doesn\'t polyfill when api exists', async() => {
    let loaded = false;

    jest.doMock('@formatjs/intl-pluralrules/polyfill', () => {
      loaded = true;
    });

    MessageProvider = require('../messages/MessageProvider').default;
    store.dispatch(receiveBook(book));

    renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider />
      </Services.Provider>
    </Provider>
    );

    await new Promise((resolve) => setImmediate(resolve));

    expect(loaded).toBe(false);
  });

  describe('when api is not there', () => {

    beforeEach(() => {
      (Intl as any).PluralRules.polyfilled = true;
    });

    afterEach(() => {
      delete (Intl as any).PluralRules.polyfilled;
    });

    it('loads polyfill', async() => {
      let loaded = false;

      jest.doMock('@formatjs/intl-pluralrules/should-polyfill', () => ({
        shouldPolyfill: () => true,
      }));

      jest.doMock('@formatjs/intl-pluralrules/polyfill', () => {
        loaded = true;
      });

      MessageProvider = require('../messages/MessageProvider').default;

      renderer.create(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider />
        </Services.Provider>
      </Provider>
      );

      await new Promise((resolve) => setImmediate(resolve));

      expect(loaded).toBe(true);
    });

    it('loads data', async() => {
      let loaded = false;

      jest.doMock('@formatjs/intl-pluralrules/should-polyfill', () => ({
        shouldPolyfill: () => true,
      }));
      jest.doMock('@formatjs/intl-pluralrules/locale-data/en', () => {
        loaded = true;
      });

      require('../messages/MessageProvider');

      MessageProvider = require('../messages/MessageProvider').default;

      renderer.create(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider />
        </Services.Provider>
      </Provider>
      );

      await new Promise((resolve) => setImmediate(resolve));

      expect(loaded).toBe(true);
    });
  });
});
