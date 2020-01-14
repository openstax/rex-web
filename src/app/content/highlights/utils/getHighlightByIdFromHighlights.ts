import { Highlight } from '@openstax/highlighter/dist/api';
import { HighlightData } from '../types';

const getHighlightByIdFromHighlights = (highlights: HighlightData[], id: string) => {
  let foundHighlight: Highlight | undefined;

  const oldHiglightIndex = highlights.findIndex(
    (highlight) => highlight.id === id);

  if (oldHiglightIndex !== -1) {
    foundHighlight = {...highlights[oldHiglightIndex]};
  }

  return foundHighlight;
};

export default getHighlightByIdFromHighlights;
