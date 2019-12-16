import { Highlight, HighlightColorEnum, UpdateHighlightRequest } from '@openstax/highlighter/dist/api';
import { SummaryHighlights } from '../../types';

interface BaseData {
  chapterId: string;
  pageId: string;
}

interface DataAdd extends BaseData {
  type: 'add';
  highlight: Highlight;
}

interface DataRemove extends BaseData  {
  type: 'remove';
  id: string;
}

interface DataUpdate extends BaseData, UpdateHighlightRequest {
  type: 'update';
}

type Data = DataAdd | DataRemove | DataUpdate;

/**
 * Update summary highlights object in place.
 */
const updateSummaryHighlights = (summaryHighlights: SummaryHighlights, data: Data) => {
  const { chapterId, pageId, type } = data;

  switch (type) {
    case 'add': {
      const { highlight } = data as DataAdd;
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
      break;
    }

    case 'remove': {
      const { id } = data as DataRemove;
      if (summaryHighlights[chapterId] && summaryHighlights[chapterId][pageId]) {
        summaryHighlights[chapterId][pageId] = summaryHighlights[chapterId][pageId]
          .filter((h) => h.id !== id);
        if (summaryHighlights[chapterId][pageId].length === 0) {
          delete summaryHighlights[chapterId][pageId];
        }
        if (Object.keys(summaryHighlights[chapterId]).length === 0) {
          delete summaryHighlights[chapterId];
        }
      }
      break;
    }

    case 'update': {
      const { id, highlight } = data as DataUpdate;
      if (summaryHighlights[chapterId] && summaryHighlights[chapterId][pageId]) {
        summaryHighlights[chapterId][pageId] = summaryHighlights[chapterId][pageId].map((h) =>
          h.id === id ? {
            ...h,
            ...highlight,
            color: highlight.color as string as HighlightColorEnum,
          } : h);
      }
    }
  }
};

export default updateSummaryHighlights;
