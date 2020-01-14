import { UpdateHighlightRequest } from '@openstax/highlighter/dist/api';
import { HighlightData } from '../types';

const updateHighlights = (highlights: HighlightData[], data: UpdateHighlightRequest) => {
  const oldHiglightIndex = highlights.findIndex(
    (highlight) => highlight.id === data.id);

  if (oldHiglightIndex < 0) { return highlights; }

  const newHighlights = [...highlights];
  newHighlights[oldHiglightIndex] = {
    ...newHighlights[oldHiglightIndex],
    ...data.highlight,
  } as HighlightData;

  return newHighlights;
};

export default updateHighlights;
