import { Highlight } from '@openstax/highlighter/dist/api';
import { SummaryHighlights } from '../../types';

interface Data {
  chapterId: string;
  highlight: Highlight;
  pageId: string;
}

/**
 * Add highlight to provided obejct in place.
 */
const addToSummaryHighlights = (summaryHighlights: SummaryHighlights, data: Data) => {
  const { chapterId, pageId, highlight } = data;

  if (summaryHighlights[chapterId]) {
    if (summaryHighlights[chapterId][pageId]) {
      summaryHighlights[chapterId][pageId].push(highlight);
    } else {
      summaryHighlights[chapterId][pageId] = [highlight];
    }
  } else {
    summaryHighlights[chapterId] = {
      [pageId]: [highlight],
    };
  }
};

export default addToSummaryHighlights;
