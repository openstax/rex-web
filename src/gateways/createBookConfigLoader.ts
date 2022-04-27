import BOOKS from '../config.books';
import { acceptStatus } from '../helpers/fetch';
import Sentry, { Severity } from '../helpers/Sentry';

type BookVersion = typeof BOOKS[0];

interface ReleaseJsonStructure {
  archiveUrl: string;
  books: typeof BOOKS;
  code: string;
  id: string;
}

let cachedBooks = { ...BOOKS };
let cachedArchiveUrl: string;

export default () => {
  const loadRemoteBookConfig = () => {
    const url = '/rex/release.json';
    return fetch(url)
      .then(acceptStatus(200, (status, message) => new Error(`Error response from "${url}" ${status}: ${message}`)))
      .then((response) => response.json() as Promise<ReleaseJsonStructure>)
      .then((response) => response && {books: response.books, archiveUrl: response.archiveUrl})
      .catch((e) => {
        Sentry.captureException(e, Severity.Warning);
        return Promise.resolve(undefined);
      });
  };

  return {
    getArchiveUrl: (): Promise<string | undefined> => {
      return cachedArchiveUrl ? Promise.resolve(cachedArchiveUrl) : loadRemoteBookConfig().then((config) => {
          if (config?.archiveUrl) {
            cachedArchiveUrl = config.archiveUrl;
          }
          return getArchiveUrlSync();
      });
    },
    getBookVersionFromUUID: (uuid: string): Promise<BookVersion | undefined> => {
      return cachedBooks[uuid] ? Promise.resolve(cachedBooks[uuid]) : loadRemoteBookConfig().then((config) => {
        if (config?.books) {
          cachedBooks = config.books;
        }
        return getBookVersionFromUUIDSync(uuid);
      });
    },
  };
};

export const getArchiveUrlSync = (): string | undefined => cachedArchiveUrl;
export const getBookVersionFromUUIDSync = (uuid: string): BookVersion | undefined => cachedBooks[uuid];
