import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { HighlightColorCounts } from '../types';

const reduceColorCounts = (currentCounts: HighlightColorCounts, counts: HighlightColorCounts) => {
  const newCounts: HighlightColorCounts = {...currentCounts};

  for (const [color, value] of Object.entries(counts)) {
    if (typeof newCounts[color as HighlightColorEnum] === 'number') {
      newCounts[color as HighlightColorEnum]! += value!;
    } else {
      newCounts[color as HighlightColorEnum] = value;
    }
  }

  return newCounts;
};

export default reduceColorCounts;
