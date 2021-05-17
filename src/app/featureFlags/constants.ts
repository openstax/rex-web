import { FeatureFlagVariantValue } from './types';

export const experiments: { [key: string]: FeatureFlagVariantValue[] } = {
  searchButton: [
    'originalButtonEnabled',
    'bannerColorButtonEnabled',
    'grayButtonEnabled',
  ],
};

export const experimentIds: { [key: string]: string } = {
  '473Jeu7ORta1TTuJ5UjL6w': 'searchButton', // prod
  'OCCkMMCZSwW87szzpniCow': 'searchButton', // dev
};
