import { REACT_APP_ARCHIVE_URL } from '../config';
import BOOKS from '../config.books';
import { acceptStatus } from '../helpers/fetch';
import Sentry from '../helpers/Sentry';

type BookVersion = typeof BOOKS[0];

export interface BooksConfig {
  archiveUrl: string;
  books: typeof BOOKS;
}

let cachedConfig = {
  archiveUrl: REACT_APP_ARCHIVE_URL,
  books: BOOKS,
};

export default () => {
  const loadRemoteBookConfig = () => {
    const url = '/rex/release.json';
    return fetch(url)
      .then(acceptStatus(200, (status, message) => new Error(`Error response from "${url}" ${status}: ${message}`)))
      .then((response) => response.json() as Promise<BooksConfig>)
      .then((response) => response && {books: response.books, archiveUrl: response.archiveUrl})
      .catch((e) => {
        Sentry.captureException(e, 'warning');
        return Promise.resolve(undefined);
      });
  };

  const getOrReloadConfigForBook = (uuid: string) => {
    return cachedConfig.books[uuid] ? Promise.resolve(cachedConfig) : loadRemoteBookConfig().then((config) => {
      if (config?.books && config?.archiveUrl) {
        return cachedConfig = config;
      }
      return cachedConfig;
    });
  };

  return {
    getBookVersionFromUUID: (uuid: string): Promise<BookVersion | undefined> => {
      return getOrReloadConfigForBook(uuid).then((config) => config.books[uuid]);
    },
    /*
     * will async load the config if the given book doesn't exist initially,
     * but there is no guarantee that the book will actually be in the resulting
     * config
     */
    getOrReloadConfigForBook,
  };
};

export const getBooksConfigSync = () => cachedConfig;
export const getArchiveUrl = (): string => cachedConfig.archiveUrl;
export const getBookVersionFromUUIDSync = (uuid: string): BookVersion | undefined => cachedConfig.books[uuid];
