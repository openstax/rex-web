import { AppServices } from '../../src/app/types';

export default {
  getAuthorizedFetchConfig: () => Promise.resolve({}),
  getCurrentUser: () => Promise.resolve(undefined),
} as AppServices['userLoader'];
