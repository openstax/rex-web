// tslint:disable:object-literal-sort-keys

import { FeatureFlagVariantValue } from './types';

export const experiments: Record<string, FeatureFlagVariantValue[]> = {
  searchButton: [
    'originalButton',
    'bannerColorButton',
    'grayButton',
  ],
  kineticBanner: [
    false,
    0,
    1,
    2,
  ],
};

export const experimentIds: { [key: string]: keyof typeof experiments } = {
  'OCCkMMCZSwW87szzpniCow': 'searchButton', // dev
  'zHtr33wcS1mVgFn7b2nU3A': 'searchButton', // prod

  'xneKbLnfQ8SbU-BvFNBM7Q': 'kineticBanner', // dev
  'L3WXXDcvT_OhGcLxyDcYOQ': 'kineticBanner', // prod
};
