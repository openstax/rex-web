import { REACT_APP_ARCHIVE } from '../config';
import BOOKS from '../config.books';
import { acceptStatus } from '../helpers/fetch';
import Sentry, { Severity } from '../helpers/Sentry';

type BookVersion = typeof BOOKS[0];

interface ReleaseJsonStructure {
  archive: string;
  books: typeof BOOKS;
  code: string;
  id: string;
}

let cachedBooks = { ...BOOKS };
let cachedArchive = REACT_APP_ARCHIVE;

export default () => {
  const loadRemoteBookConfig = () => {
    const url = '/rex/release.json';
    return fetch(url)
      .then(acceptStatus(200, (status, message) => new Error(`Error response from "${url}" ${status}: ${message}`)))
      .then((response) => response.json() as Promise<ReleaseJsonStructure>)
      .then((response) => response && {books: response.books, archive: response.archive})
      .catch((e) => {
        Sentry.captureException(e, Severity.Warning);
        return Promise.resolve(undefined);
      });
  };

  return {
    getArchiveVersion: (): Promise<string | undefined> => {
      return cachedArchive ? Promise.resolve(cachedArchive) : loadRemoteBookConfig().then((config) => {
          if (config?.archive) {
            cachedArchive = config.archive;
          }
          return getArchiveVersionSync();
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

export const getBookVersionFromUUIDSync = (uuid: string): BookVersion | undefined => ({
  ...cachedBooks[uuid],
  archiveOverride: cachedBooks[uuid].archiveOverride || `/apps/archive/${cachedArchive}`,
});
export const getArchiveVersionSync = (): string | undefined => cachedArchive;
