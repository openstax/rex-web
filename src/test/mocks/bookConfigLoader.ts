import createBookConfigLoader from '../../gateways/createBookConfigLoader';
import { book } from './archiveLoader';

const localBookConfig = {
  [book.id]: { defaultVersion: book.version, archiveOverride: 'codeversion' },
};

export default (): ReturnType<typeof createBookConfigLoader> => {
  const resolveBookVersion = (uuid: string) => localBookConfig[uuid];
  const resolveArchiveVersion = (uuid: string) => localBookConfig[uuid].archiveOverride;

  const mockGetArchiveVersion = jest.fn((uuid: string) => {
    const archiveVersion = resolveArchiveVersion(uuid);
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
    getArchiveVersion: (uuid: string) => mockGetArchiveVersion(uuid),
    getBookVersionFromUUID: (uuid: string) => mockGetBookVersionFromUUID(uuid),
  };
};
