import { BookVersion } from '../../gateways/createBookConfigLoader';
import { book } from './archiveLoader';

const mockBookVersion: BookVersion = {
  defaultVersion: book.version,
};

const localBookConfig = {
  [book.id]: mockBookVersion,
};

export default () => {
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
