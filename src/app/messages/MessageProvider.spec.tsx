import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../test/createTestServices';
import createTestStore from '../../test/createTestStore';
import { book as archiveBook } from '../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../test/mocks/osWebLoader';
import { resetModules, runHooksAsync } from '../../test/utils';
import { receiveBook } from '../content/actions';
import { formatBookData } from '../content/utils';
import * as Services from '../context/Services';
import MessageProvider from '../messages/MessageProvider';
import { Store } from '../types';

const book = formatBookData(archiveBook, mockCmsBook);

describe('MessageProvider', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();
    store.dispatch(receiveBook(book));
    resetModules();
  });

  it('doesn\'t polyfill when api exists', async() => {
    let loaded = false;

    jest.doMock('@formatjs/intl-pluralrules/polyfill', () => {
      loaded = true;
    });

    renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider />
        </Services.Provider>
      </Provider>
    );

    await runHooksAsync();

    expect(loaded).toBe(false);
  });

  describe('when api is not there', () => {

    beforeEach(() => {
      store = createTestStore();
      services = createTestServices();
      (Intl as any).PluralRules.polyfilled = true;
      store.dispatch(receiveBook(book));
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

      renderer.create(
        <Provider store={store}>
          <Services.Provider value={services}>
            <MessageProvider />
          </Services.Provider>
        </Provider>
      );

      await runHooksAsync();

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

      renderer.create(
        <Provider store={store}>
          <Services.Provider value={services}>
            <MessageProvider />
          </Services.Provider>
        </Provider>
      );

      await runHooksAsync();

      expect(loaded).toBe(true);
    });
  });
});
