import { AppServices } from '../app/types';
import Sentry from '../helpers/Sentry';

jest.mock('../helpers/Sentry');

jest.mock('../config', () => ({
  BOOKS: {
    'test-book-uuid': {
      defaultVersion: 'test-book-version',
    },
  },
}));

const mockFetch = (code: number, data: any) => jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(data),
  status: code,
  text: () => Promise.resolve(data),
}));

describe('bookConfigLoader', () => {
  const fetchBackup = fetch;
  let bookConfigLoader: AppServices['bookConfigLoader'];

  beforeEach(() => {
    bookConfigLoader = require('./createBookConfigLoader').default('url');
  });

  afterEach(() => {
    (global as any).fetch = fetchBackup;
  });

  it('returns bookVersion from local config', () => {
    const bookVersion = bookConfigLoader.getBookVersionFromUUID('test-book-uuid');
    expect(bookVersion).toEqual({ defaultVersion: 'test-book-version' });
  });

  it('fetches bookVersion from release.json if failed to find it in local config', async() => {
    (global as any).fetch = mockFetch(200, {
      books: {
        'test-book-uuid-2': {
          defaultVersion: 'test-book-version-2',
        },
      },
      code: 'test',
      id: 'test',
    });

    const bookVersion = await bookConfigLoader.getBookVersionFromUUID('test-book-uuid-2');
    expect(fetch).toHaveBeenCalledWith('url/rex/release.json');
    expect(bookVersion).toEqual({ defaultVersion: 'test-book-version-2' });
  });

  it('returns undefined if couldnt find bookVersion for desired uuid', async() => {
    (global as any).fetch = mockFetch(200, {
      books: {
        'test-book-uuid-2': {
          defaultVersion: 'test-book-version-2',
        },
      },
      code: 'test',
      id: 'test',
    });

    const bookVersion = await bookConfigLoader.getBookVersionFromUUID('non-existing-book-uuid');
    expect(fetch).toHaveBeenCalledWith('url/rex/release.json');
    expect(bookVersion).toBe(undefined);
  });

  it('returns undefined if failed at fetching and reports error to sentry', async() => {
    (global as any).fetch = mockFetch(500, 'unexpected error');

    const bookVersion = await bookConfigLoader.getBookVersionFromUUID('test');
    expect(fetch).toHaveBeenCalledWith('url/rex/release.json');

    expect(Sentry.captureException).toHaveBeenCalledWith(
      new Error('Error response from "url/rex/release.json" 500: unexpected error')
    );
    expect(bookVersion).toBe(undefined);
  });
});
