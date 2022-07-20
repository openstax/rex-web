import { Books } from '../../config.books';
import createBookConfigLoader from '../../gateways/createBookConfigLoader';
import { book } from './archiveLoader';

const localBookConfig: Books = {
  [book.id]: { defaultVersion: book.version },
};

export default () => {
  const resolveBookVersion = (uuid: string) => localBookConfig[uuid];

  const mockGetBookVersionFromUUID = jest.fn((uuid: string) => {
    const bookVersion = resolveBookVersion(uuid);
    return bookVersion
      ? Promise.resolve(bookVersion)
      : Promise.resolve(undefined);
  });

  const mock: ReturnType<typeof createBookConfigLoader> = {
    getBookVersionFromUUID: (uuid: string) => mockGetBookVersionFromUUID(uuid),
  };

  return {
    ...mock,
    localBookConfig,
  };
};
