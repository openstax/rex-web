import { FeatureFlagVariantValue } from './types';

export const experiments: Record<string, FeatureFlagVariantValue[]> = {
  searchButton: [
    'originalButton',
    'bannerColorButton',
    'grayButton',
  ],
};

export const experimentIds: { [key: string]: keyof typeof experiments } = {
  '473Jeu7ORta1TTuJ5UjL6w': 'searchButton', // prod
  'OCCkMMCZSwW87szzpniCow': 'searchButton', // dev
};
