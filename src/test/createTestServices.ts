import { SearchApi } from '@openstax/open-search-client';
import { createMemoryHistory } from 'history';
import config from '../config';
import type { JsonCompatibleStruct } from '@openstax/ts-utils/routing';
import createHighlightClient from '../gateways/createHighlightClient';
import createPracticeQuestionsLoader from '../gateways/createPracticeQuestionsLoader';
import analytics from '../helpers/analytics';
import FontCollector from '../helpers/FontCollector';
import PromiseCollector from '../helpers/PromiseCollector';
import createIntl from './createIntl';
import mockArchiveLoader from './mocks/archiveLoader';
import mockbookConfigLoader from './mocks/bookConfigLoader';
import mockOsWebLoader from './mocks/osWebLoader';
import mockUserLoader from './mocks/userLoader';
import createImageCDNUtils from '../gateways/createImageCDNUtils';
import { createRouterService } from '../app/navigation/routerService';

jest.mock('@openstax/open-search-client');
jest.mock('@openstax/highlighter/dist/api');

export const createTestServices = (args?: {prefetchResolutions: boolean}) => ({
  analytics,
  archiveLoader: mockArchiveLoader(),
  bookConfigLoader: mockbookConfigLoader(),
  config,
  fontCollector: new FontCollector(),
  highlightClient: createHighlightClient('asdf'),
  history: createMemoryHistory(),
  intl: {current: createIntl('en')},
  osWebLoader: mockOsWebLoader(),
  practiceQuestionsLoader: createPracticeQuestionsLoader(),
  promiseCollector: new PromiseCollector(),
  searchClient: new SearchApi(),
  launchToken: undefined as undefined | {tokenString: string, tokenData: JsonCompatibleStruct},
  userLoader: mockUserLoader(),
  imageCDNUtils: createImageCDNUtils(args),
  router: createRouterService([]),
});

export default createTestServices;
