import { resetModules } from '../test/utils';

describe('MessageProvider', () => {

  beforeEach(() => {
    resetModules();
  });

  it('doesn\'t polyfill when api exists', () => {
    let loaded = false;

    jest.doMock('@formatjs/intl-pluralrules/polyfill', () => {
      loaded = true;
    });
    require('./MessageProvider');

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
      require('./MessageProvider');

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
      require('./MessageProvider');

      await new Promise((resolve) => setImmediate(resolve));

      expect(loaded).toBe(true);
    });
  });
});
