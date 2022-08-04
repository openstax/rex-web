import createBookConfigLoader, { BooksConfig } from '../../gateways/createBookConfigLoader';
import { book } from './archiveLoader';

export default () => {
  const localBooksConfig: BooksConfig = {
    archiveUrl: '/apps/archive/testversion',
    books: {
      [book.id]: { defaultVersion: book.version },
    },
  };

  const resolveBookVersion = (uuid: string) => localBooksConfig.books[uuid];

  const mockGetBookVersionFromUUID = jest.fn((uuid: string) => {
    const bookVersion = resolveBookVersion(uuid);
    return bookVersion
      ? Promise.resolve(bookVersion)
      : Promise.resolve(undefined);
  });

  const mock: ReturnType<typeof createBookConfigLoader> = {
    getBookVersionFromUUID: (uuid: string) => mockGetBookVersionFromUUID(uuid),
    getOrReloadConfigForBook: (_uuid: string) => Promise.resolve(localBooksConfig),
  };

  return {
    ...mock,
    localBookConfig: localBooksConfig.books,
  };
};
