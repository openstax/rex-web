import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { highlightStyles } from '../constants';
import { CountsPerSource } from '../types';

export default (locationsWithContent: CountsPerSource) => {
  const colorFiltersWithContent: Set<HighlightColorEnum> = new Set();

  for (const colorCounts of Object.values(locationsWithContent)) {
    for (const color of Object.keys(colorCounts)) {
      colorFiltersWithContent.add(color as HighlightColorEnum);
    }
    // If already all colors were found, break without processing rest of object
    if (colorFiltersWithContent.size === highlightStyles.length) { break; }
  }

  return colorFiltersWithContent;
};
