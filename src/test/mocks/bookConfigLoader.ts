import createBookConfigLoader from '../../gateways/createBookConfigLoader';
import { book } from './archiveLoader';

const localBookConfig = {
  [book.id]: { defaultVersion: book.version },
};

export default (): ReturnType<typeof createBookConfigLoader> => {
  const resolveBookVersion = (uuid: string) => localBookConfig[uuid];

  const mockGetBookVersionFromUUID = jest.fn((uuid: string) => {
    const bookVersion = resolveBookVersion(uuid);
    return bookVersion
      ? Promise.resolve(bookVersion)
      : Promise.resolve(undefined);
  });

  return {
    getBookVersionFromUUID: (uuid: string) => mockGetBookVersionFromUUID(uuid),
  };
};
