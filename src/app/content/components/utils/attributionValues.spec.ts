import { attributionValues } from './attributionValues';
import { book } from '../../../../test/mocks/archiveLoader';
import { shouldPolyfill } from '@formatjs/intl-displaynames/should-polyfill';

jest.mock(
    '@formatjs/intl-displaynames/should-polyfill',
    () => ({
        shouldPolyfill: jest.fn(() => false),
    })
);

describe('locale not found', () => {
  it('loads english messages', () => {
    const {language} = attributionValues(book);
    expect(language).toBe('English');
  });

  it('uses locale for language when polyfill required', () => {
    (shouldPolyfill as jest.Mock).mockReturnValue(true);
    const {language} = attributionValues(book);

    expect(language).toBe('en');
  });

});
