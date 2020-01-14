import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { ColorCounts } from '../types';

const reduceColorCounts = (counts: ColorCounts, currentCounts: ColorCounts) => {
  const newCounts: ColorCounts = {...currentCounts};

  for (const [color, value] of Object.entries(counts)) {
    if (typeof newCounts[color as HighlightColorEnum] === 'number') {
      newCounts[color as HighlightColorEnum] += value;
    } else {
      newCounts[color as HighlightColorEnum] = value;
    }
  }

  return newCounts;
};

export default reduceColorCounts;
