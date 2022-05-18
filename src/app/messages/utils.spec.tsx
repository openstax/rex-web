import * as utils from './utils';

describe('availableLocaleOrDefault', () => {
  it('returns en as the default', () => {
    expect(utils.availableLocaleOrDefault('')).toBe('en');
    expect(utils.availableLocaleOrDefault('ja')).toBe('en');
  });

  it('returns a match that is not the default', () => {
    expect(utils.availableLocaleOrDefault('es')).toBe('es');
  });
});
