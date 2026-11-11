import { AppServices } from '../../src/app/types';

export default {
  getCurrentUser: () => Promise.resolve(undefined),
} as AppServices['userLoader'];
