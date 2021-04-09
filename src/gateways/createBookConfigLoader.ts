import { BOOKS } from '../config';
import { acceptStatus } from '../helpers/fetch';
import Sentry from '../helpers/Sentry';

interface BookVersion {
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

export default (baseUrl: string) => {
  const loadRemoteBookConfig = (url: string): Promise<BookConfig | undefined> => {
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
      const url = `${baseUrl}/rex/release.json`;
      return BOOKS[uuid] ? BOOKS[uuid] : loadRemoteBookConfig(url).then((books) => books && books[uuid]);
    },
  };
};
