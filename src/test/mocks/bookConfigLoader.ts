import { BookVersion } from '../../gateways/createBookConfigLoader';

export const mockBookVersionFromConfig: BookVersion = {
  defaultVersion: 'testbook1-version',
};

export default () => ({
  getBookVersionFromUUID: jest.fn(() => Promise.resolve(mockBookVersionFromConfig)),
});
