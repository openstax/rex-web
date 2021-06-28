import {
  Highlight,
  HighlightColorEnum,
  HighlightUpdateColorEnum,
  UpdateHighlightRequest,
} from '@openstax/highlighter/dist/api';
import flow from 'lodash/fp/flow';
import partition from 'lodash/fp/partition';
import { LocationFilters } from '../../components/popUp/types';
import {
  archiveTreeSectionIsAnswerKey,
  archiveTreeSectionIsChapter,
  findTreePages,
} from '../../utils/archiveTreeUtils';
import {
  CountsPerSource,
  HighlightData,
  OrderedSummaryHighlights,
  SummaryFilters,
  SummaryHighlights,
} from '../types';

interface BaseData {
  locationFilterId: string;
  pageId: string;
}

interface DataAdd extends BaseData {
  highlight: Highlight;
}

const insertHighlightAtIndex = (
  highlights: HighlightData[],
  highlight: HighlightData,
  index: number
) => {
  return [
    ...highlights.slice(0, index),
    highlight,
    ...highlights.slice(index),
  ];
};

export const insertHighlightInOrder = (prevHighlights: HighlightData[] , newHighlight: HighlightData) => {
  if (!prevHighlights.length) {
    return [newHighlight];
  }
  const { prevHighlightId, nextHighlightId } = newHighlight;

  for (const [index, highlight] of prevHighlights.entries()) {
    if (highlight.id === prevHighlightId) {
      return insertHighlightAtIndex(prevHighlights, newHighlight, index + 1);
    }
    if (highlight.id === nextHighlightId) {
      return insertHighlightAtIndex(prevHighlights, newHighlight, index);
    }
  }

  return [...prevHighlights, newHighlight];
};

export const addSummaryHighlight = (summaryHighlights: SummaryHighlights, data: DataAdd) => {
  const { locationFilterId, pageId, highlight } = data;
  const newHighlights: SummaryHighlights = {
    ...summaryHighlights,
    [locationFilterId]: {
      ...summaryHighlights[locationFilterId],
      [pageId]: [...(summaryHighlights[locationFilterId] || {})[pageId] || []],
    },
  };

  newHighlights[locationFilterId][pageId] = insertHighlightInOrder(newHighlights[locationFilterId][pageId], highlight);

  return newHighlights;
};

export const getSortedSummaryHighlights =
  (summaryHighlights: SummaryHighlights | null, locationFilters: LocationFilters ) => {
    if (!summaryHighlights) {
      return  null;
    }

    return Array.from(locationFilters).reduce((previousLocations, [locationID, location]) => {
      if (!summaryHighlights[locationID]) {
        return previousLocations;
      }

      if (!archiveTreeSectionIsChapter(location.section) && !archiveTreeSectionIsAnswerKey(location.section)) {
        return [...previousLocations, {
          location: location.section,
          pages: [{
            highlights: summaryHighlights[locationID][locationID],
            pageId: locationID,
          }],
        }];
      }

      const orderedPages = findTreePages(location.section);

      const pages: OrderedSummaryHighlights[0]['pages'] = [];

      for (const page of orderedPages) {
        if (!summaryHighlights[locationID][page.id]) { continue; }
        pages.push({
          highlights: summaryHighlights[locationID][page.id],
          pageId: page.id,
        });
      }

      return [
        ...previousLocations,
        {
          location: location.section,
          pages,
        },
      ];
    }, [] as OrderedSummaryHighlights);
};

interface DataRemove extends BaseData {
  id: string;
}

export const removeSummaryHighlight = (
  summaryHighlights: SummaryHighlights,
  data: DataRemove
): SummaryHighlights => {
  const { locationFilterId, pageId, id } = data;

  const pageHighlights: Highlight[] | undefined =
    summaryHighlights[locationFilterId] && summaryHighlights[locationFilterId][pageId];
  const [filteredHighlights, removedHighlights] = pageHighlights
    ? partition((highlight) => highlight.id !== id, pageHighlights)
    : [null, []]
  ;
  const removedHighlight = removedHighlights[0];

  if (!filteredHighlights || !removedHighlight) {
    return summaryHighlights;
  }

  const newHighlights: SummaryHighlights = {
    ...summaryHighlights,
    [locationFilterId]: {
      ...summaryHighlights[locationFilterId],
      [pageId]: filteredHighlights,
    },
  };

  if (newHighlights[locationFilterId][pageId].length === 0) {
    delete newHighlights[locationFilterId][pageId];
  }
  if (Object.keys(newHighlights[locationFilterId]).length === 0) {
    delete newHighlights[locationFilterId];
  }

  return newHighlights;
};

interface DataUpdate extends BaseData, UpdateHighlightRequest {}

export const updateSummaryHighlight = (summaryHighlights: SummaryHighlights, data: DataUpdate) => {
  const { locationFilterId, pageId, id, highlight } = data;

  const updatedHighlights = summaryHighlights[locationFilterId] && summaryHighlights[locationFilterId][pageId]
    ? summaryHighlights[locationFilterId][pageId].map((currHighlight) =>
      currHighlight.id === id ? {
        ...currHighlight,
        ...highlight,
        color: highlight.color as string as HighlightColorEnum,
      } : currHighlight)
    : [];

  const newHighlights: SummaryHighlights = {
    ...summaryHighlights,
    [locationFilterId]: {
      ...summaryHighlights[locationFilterId],
      [pageId]: updatedHighlights,
    },
  };

  return newHighlights;
};

interface Data extends BaseData {
  highlight: Highlight;
}

/**
 * When user is updating highlight on the page there are 3 cases which we have to handle
 * to update summary highlights.
 *
 * We are accepting Highlight rather than HighlightUpdate because it may not exists in
 * current summaryHighlights object and we may need to add it.
 *
 * First - current chapter is not in filters - we can do nothing with new highlight.
 * Second - color of new highlight is not in filters - we'll remove this highlight from summary.
 * Third - current chapter and color exists in filters - we'll update highlight in summary if it was
 * already there or add it to summary if it wasn't before.
 */
export const updateSummaryHighlightsDependOnFilters = (
  summaryHighlights: SummaryHighlights, filters: SummaryFilters, data: Data
) => {
  const { locationFilterId, pageId, highlight: updatedHighlight, highlight: { color, annotation } } = data;
  const { colors, locationIds } = filters;

  // If highlight's chapter is not in summary filters stop here...
  if (!locationIds.includes(locationFilterId)) { return summaryHighlights; }

  // If highlight's color has changed and it's no longer in filters
  // remove this highlight from summary highlights...
  if (!colors.includes(color)) {
    return removeSummaryHighlight(summaryHighlights, {
      id: updatedHighlight.id,
      locationFilterId,
      pageId,
    });
  }

  // If color is in filters and highlight was already in summary highlights
  // then just update it.
  if (
    summaryHighlights[locationFilterId]
    && summaryHighlights[locationFilterId][pageId]
    && summaryHighlights[locationFilterId][pageId].find((currHighlight) => currHighlight.id === updatedHighlight.id)
  ) {
    return updateSummaryHighlight(summaryHighlights, {
      highlight: { color: color as string as HighlightUpdateColorEnum, annotation },
      id: updatedHighlight.id,
      locationFilterId,
      pageId,
    });
  }

  // If it wasn't then add it to summary highlights.
  return addSummaryHighlight(summaryHighlights, {
    highlight: updatedHighlight,
    locationFilterId,
    pageId,
  });
};

export const removeFromTotalCounts = (
  totalCounts: CountsPerSource,
  highlight: Highlight
) => {
  if (totalCounts[highlight.sourceId] && totalCounts[highlight.sourceId][highlight.color]) {
    const newTotal = {
      ...totalCounts,
      [highlight.sourceId]: {
        ...totalCounts[highlight.sourceId],
        [highlight.color]: totalCounts[highlight.sourceId][highlight.color]! - 1,
      },
    };

    if (newTotal[highlight.sourceId][highlight.color] === 0) {
      delete newTotal[highlight.sourceId][highlight.color];
    }

    if (Object.keys(newTotal[highlight.sourceId]).length === 0) {
      delete newTotal[highlight.sourceId];
    }

    return newTotal;
  }

  return totalCounts;
};

export const addToTotalCounts = (
  totalCounts: CountsPerSource,
  highlight: Highlight
) => {
  return {
    ...totalCounts,
    [highlight.sourceId]: {
      ...totalCounts[highlight.sourceId] || {},
      [highlight.color]: ((totalCounts[highlight.sourceId] || {})[highlight.color] || 0) + 1,
    },
  };
};

export const updateInTotalCounts = (
  totalCounts: CountsPerSource,
  oldHighlight: Highlight,
  newHighlight: Highlight
) => {
  if (
    oldHighlight.sourceId === newHighlight.sourceId
    && oldHighlight.color === newHighlight.color
  ) {
    return totalCounts;
  }

  return flow(
    (counts) => removeFromTotalCounts(counts, oldHighlight),
    (counts) => addToTotalCounts(counts, newHighlight)
  )(totalCounts);
};

export const getHighlightByIdFromSummaryHighlights = (
  summaryHighlights: SummaryHighlights, id: string
): Highlight | undefined => {

  for (const data of Object.values(summaryHighlights)) {
    for (const highlights of Object.values(data)) {
      const highlight = highlights.find((search) => search.id === id);
      if (highlight) { return highlight; }
    }
  }

  return;
};
