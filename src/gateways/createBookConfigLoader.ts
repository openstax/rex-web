import { BOOKS } from '../config';
import { acceptStatus } from '../helpers/fetch';
import Sentry from '../helpers/Sentry';

export interface BookVersion {
  defaultVersion: string;
}

interface BookConfig {
  [key: string]: BookVersion;
}

interface ReleaseJsonStructure {
  books: BookConfig;
  code: string;
  id: string;
}

const cachedBooks = { ...BOOKS } as BookConfig;

export default (baseUrl: string) => {
  const loadRemoteBookConfig = (): Promise<BookConfig | undefined> => {
    const url = `${baseUrl}/rex/release.json`;
    return fetch(url)
      .then(acceptStatus(200, (status, message) => `Error response from "${url}" ${status}: ${message}`))
      .then((response) => response.json() as Promise<ReleaseJsonStructure>)
      .then((response) => response && response.books)
      .catch((e) => {
        Sentry.captureException(e);
        return Promise.resolve(undefined);
      });
  };

  return {
    getBookVersionFromUUID: (uuid: string): BookVersion | Promise<BookVersion | undefined> => {
      return cachedBooks[uuid] ? cachedBooks[uuid] : loadRemoteBookConfig().then((books) => {
        let bookVersion;
        if (books && uuid in books) {
          bookVersion = books[uuid];
          cachedBooks[uuid] = bookVersion;
        }
        return bookVersion;
      });
    },
  };
};

export const getBookVersionFromUUID = (uuid: string): BookVersion | undefined => cachedBooks[uuid];
