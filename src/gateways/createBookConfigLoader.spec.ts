import { AppServices } from '../app/types';
import Sentry from '../helpers/Sentry';
import { getArchiveUrlSync } from './createBookConfigLoader';

jest.mock('../helpers/Sentry');

jest.mock('../config.books', () => ({
    'test-book-uuid': {
      defaultVersion: 'test-book-version',
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
    bookConfigLoader = require('./createBookConfigLoader').default();
  });

  afterEach(() => {
    (global as any).fetch = fetchBackup;
  });

  it('returns bookVersion from local config', async() => {
    const bookVersion = await bookConfigLoader.getBookVersionFromUUID('test-book-uuid');
    expect(bookVersion).toEqual({ defaultVersion: 'test-book-version' });
  });

  it('fetches bookVersion from release.json if failed to find it in local config', async() => {
    (global as any).fetch = mockFetch(200, {
      archiveUrl: '/apps/archive/test-url',
      books: {
        'test-book-uuid-2': {
          defaultVersion: 'test-book-version-2',
        },
      },
      code: 'test',
      id: 'test',
    });

    const bookVersion = await bookConfigLoader.getBookVersionFromUUID('test-book-uuid-2');
    expect(fetch).toHaveBeenCalledWith('/rex/release.json');
    expect(bookVersion).toEqual({ defaultVersion: 'test-book-version-2' });
  });

  it('returns undefined if couldnt find bookVersion for desired uuid', async() => {
    (global as any).fetch = mockFetch(200, {
      archiveUrl: '/apps/archive/test-url',
      books: {
        'test-book-uuid-2': {
          defaultVersion: 'test-book-version-2',
        },
      },
      code: 'test',
      id: 'test',
    });

    const bookVersion = await bookConfigLoader.getBookVersionFromUUID('non-existing-book-uuid');
    expect(fetch).toHaveBeenCalledWith('/rex/release.json');
    expect(bookVersion).toBe(undefined);
  });

  it('returns undefined if failed at fetching and reports error to sentry', async() => {
    (global as any).fetch = mockFetch(500, 'unexpected error');

    const bookVersion = await bookConfigLoader.getBookVersionFromUUID('test');
    expect(fetch).toHaveBeenCalledWith('/rex/release.json');

    expect(Sentry.captureException).toHaveBeenCalledWith(
      new Error('Error response from "/rex/release.json" 500: unexpected error'), 'warning'
    );
    expect(bookVersion).toBe(undefined);
  });

  it('returns undefined if couldnt find archiveUrl', async() => {
    (global as any).fetch = mockFetch(200, {
      books: {
        'test-book-uuid-2': {
          defaultVersion: 'test-book-version-2',
        },
      },
      code: 'test',
      id: 'test',
    });

    const archiveUrl = await bookConfigLoader.getArchiveUrl();
    expect(fetch).toHaveBeenCalledWith('/rex/release.json');
    expect(archiveUrl).toBe(undefined);
  });

  it('fetches archiveUrl from release.json', async() => {
    (global as any).fetch = mockFetch(200, {
      archiveUrl: '/apps/archive/test-url',
      books: {
        'test-book-uuid-2': {
          defaultVersion: 'test-book-version-2',
        },
      },
      code: 'test',
      id: 'test',
    });

    const archiveUrl = await bookConfigLoader.getArchiveUrl();
    expect(fetch).toHaveBeenCalledWith('/rex/release.json');
    expect(archiveUrl).toEqual('/apps/archive/test-url');
  });

  it('fetches archiveUrl from cache', async() => {
    (global as any).fetch = mockFetch(200, {
      archiveUrl: '/apps/archive/test-url',
      books: {
        'test-book-uuid-2': {
          defaultVersion: 'test-book-version-2',
        },
      },
      code: 'test',
      id: 'test',
    });

    const archiveUrl = await bookConfigLoader.getArchiveUrl();
    expect(fetch).not.toHaveBeenCalledWith('/rex/release.json');
    expect(archiveUrl).toEqual('/apps/archive/codeversion');
  });

  it('fetches archiveUrl synchronously from cache', () => {
    const archiveUrl = getArchiveUrlSync();
    expect(archiveUrl).toEqual('/apps/archive/codeversion');
  });
});
