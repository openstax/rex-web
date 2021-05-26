import BOOKS from '../config.books';
import { acceptStatus } from '../helpers/fetch';
import Sentry, { Severity } from '../helpers/Sentry';

type BookVersion = typeof BOOKS[0];

interface ReleaseJsonStructure {
  books: typeof BOOKS;
  code: string;
  id: string;
}

let cachedBooks = { ...BOOKS };

export default () => {
  const loadRemoteBookConfig = () => {
    const url = '/rex/release.json';
    return fetch(url)
      .then(acceptStatus(200, (status, message) => `Error response from "${url}" ${status}: ${message}`))
      .then((response) => response.json() as Promise<ReleaseJsonStructure>)
      .then((response) => response && response.books)
      .catch((e) => {
        Sentry.captureException(e, Severity.Warning);
        return Promise.resolve(undefined);
      });
  };

  return {
    getBookVersionFromUUID: (uuid: string): Promise<BookVersion | undefined> => {
      return cachedBooks[uuid] ? Promise.resolve(cachedBooks[uuid]) : loadRemoteBookConfig().then((books) => {
        if (books) {
          cachedBooks = books;
        }
        return getBookVersionFromUUIDSync(uuid);
      });
    },
  };
};

export const getBookVersionFromUUIDSync = (uuid: string): BookVersion | undefined => cachedBooks[uuid];
