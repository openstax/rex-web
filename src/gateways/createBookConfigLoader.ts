import { BOOKS } from '../config';

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
  const loadBookRemoteBookConfig = (url: string): Promise<BookConfig | undefined> => {
    return fetch(url)
      .then((response) => {
        if (response.status === 200) {
          return response.json() as Promise<ReleaseJsonStructure>;
        }
      })
      .then((response) => response && response.books)
      .catch(() => {
        return Promise.resolve(undefined);
      });
  };

  return {
    getBookVersionFromUUID: (uuid: string): BookVersion | Promise<BookVersion | undefined> => {
      const url = `${baseUrl}/rex/release.json`;
      return BOOKS[uuid] ? BOOKS[uuid] : loadBookRemoteBookConfig(url).then((books) => books && books[uuid]);
    },
  };
};
