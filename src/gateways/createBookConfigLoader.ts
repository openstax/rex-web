import { BOOKS } from '../config';

interface BookVersion {
  defaultVersion: string;
}

interface BookConfig {
  [key: string]: BookVersion;
}

interface ReleaseJsonStructure {
  books: BookConfig,
  code: string,
  id: string,
}

export default (baseUrl: string) => {
  const url = `${baseUrl}/rex/release.json`;
  const toJson = (response: any) => response.json() as Promise<ReleaseJsonStructure>;

  const loadBookRemoteBookConfig = (url: string): Promise<BookConfig | undefined> => {
    return fetch(url)
      .then(toJson)
      .then(res => res.books)
  }

  return {
    getBookVersionFromUUID: (uuid: string): BookVersion | Promise<BookVersion | undefined> => {
      return BOOKS[uuid] ? BOOKS[uuid] : loadBookRemoteBookConfig(url).then(books => books && books[uuid])
    }
  }
}