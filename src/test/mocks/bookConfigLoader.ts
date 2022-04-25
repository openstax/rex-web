import createBookConfigLoader from '../../gateways/createBookConfigLoader';
import { book } from './archiveLoader';

const localBookConfig = {
  [book.id]: { defaultVersion: book.version },
};

export default (): ReturnType<typeof createBookConfigLoader> => {
  const resolveBookVersion = (uuid: string) => localBookConfig[uuid];
  const resolveArchiveVersion = () => 'codeversion';

  const mockGetArchiveUrl = jest.fn(() => {
    const archiveVersion = resolveArchiveVersion();
    return archiveVersion
      ? Promise.resolve(archiveVersion)
      : Promise.resolve(undefined);
  });

  const mockGetBookVersionFromUUID = jest.fn((uuid: string) => {
    const bookVersion = resolveBookVersion(uuid);
    return bookVersion
      ? Promise.resolve(bookVersion)
      : Promise.resolve(undefined);
  });

  return {
    getArchiveUrl: () => mockGetArchiveUrl(),
    getBookVersionFromUUID: (uuid: string) => mockGetBookVersionFromUUID(uuid),
  };
};
