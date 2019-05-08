import { AppServices } from '../app/types';
import FontCollector from '../helpers/FontCollector';
import PromiseCollector from '../helpers/PromiseCollector';
import mockArchiveLoader from './mocks/archiveLoader';
import mockOsWebLoader from './mocks/osWebLoader';
import mockUserLoader from './mocks/userLoader';

const services = (): AppServices => ({
  archiveLoader: mockArchiveLoader(),
  fontCollector: new FontCollector(),
  osWebLoader: mockOsWebLoader(),
  promiseCollector: new PromiseCollector(),
  userLoader: mockUserLoader(),
});

export default services;
