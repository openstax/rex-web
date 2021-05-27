import { FeatureFlagVariantValue } from './types';

export const experiments: Record<string, FeatureFlagVariantValue[]> = {
  searchButton: [
    'originalButton',
    'bannerColorButton',
    'grayButton',
  ],
};

export const experimentIds: { [key: string]: keyof typeof experiments } = {
  OCCkMMCZSwW87szzpniCow: 'searchButton', // dev
  zHtr33wcS1mVgFn7b2nU3A: 'searchButton', // prod
};
