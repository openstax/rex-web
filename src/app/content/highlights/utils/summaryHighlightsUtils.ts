import {
  Highlight,
  HighlightColorEnum,
  HighlightUpdateColorEnum,
  UpdateHighlightRequest,
} from '@openstax/highlighter/dist/api';
import {
  HighlightsTotalCountsPerLocation,
  HighlightsTotalCountsPerPage,
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

export const addSummaryHighlight = (summaryHighlights: SummaryHighlights, data: DataAdd) => {
  const { locationFilterId, pageId, highlight } = data;
  const newHighlights: SummaryHighlights = {
    ...summaryHighlights,
    [locationFilterId]: {
      ...summaryHighlights[locationFilterId],
      [pageId]: [...(summaryHighlights[locationFilterId] || {})[pageId] || []],
    },
  };

  newHighlights[locationFilterId][pageId].push(highlight);

  return newHighlights;
};

interface DataRemove extends BaseData {
  id: string;
}

export const removeSummaryHighlight = (summaryHighlights: SummaryHighlights, data: DataRemove) => {
  const { locationFilterId, pageId, id } = data;

  const filteredHighlights = summaryHighlights[locationFilterId] && summaryHighlights[locationFilterId][pageId]
    ? summaryHighlights[locationFilterId][pageId].filter((highlight) => highlight.id !== id)
    : [];

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
  let newHighlights: SummaryHighlights = {
    ...summaryHighlights,
    [locationFilterId]: {
      ...summaryHighlights[locationFilterId],
      [pageId]: [...(summaryHighlights[locationFilterId] || {})[pageId] || []],
    },
  };

  // If highlight's chapter is not in summary filters stop here...
  if (!locationIds.includes(locationFilterId)) { return summaryHighlights; }

  // If highlight's color has changed and it's no longer in filters
  // remove this highlight from summary highlights...
  if (!colors.includes(color)) {
    newHighlights = removeSummaryHighlight(newHighlights, {
      id: updatedHighlight.id,
      locationFilterId,
      pageId,
    });
    return newHighlights;
  }

  // If color it is in filters and highlight was already in summary highlights
  // then just update it.
  if (
    newHighlights[locationFilterId]
    && newHighlights[locationFilterId][pageId]
    && newHighlights[locationFilterId][pageId].find((currHighlight) => currHighlight.id === updatedHighlight.id)
  ) {
    newHighlights = updateSummaryHighlight(newHighlights, {
      highlight: { color: color as string as HighlightUpdateColorEnum, annotation },
      id: updatedHighlight.id,
      locationFilterId,
      pageId,
    });
    return newHighlights;
  }

  // If it wasn't then add it to summary highlights.
  newHighlights = addSummaryHighlight(newHighlights, {
    highlight: updatedHighlight,
    locationFilterId,
    pageId,
  });

  return newHighlights;
};

export const removeOneFromTotalCounts = (
  totalCounts: HighlightsTotalCountsPerLocation | HighlightsTotalCountsPerPage, id: string
) => {
  const newTotalCounts = {...totalCounts};

  if (newTotalCounts[id]) {
    newTotalCounts[id] -= 1;
  }

  return newTotalCounts;
};

export const addOneToTotalCounts = (
  totalCounts: HighlightsTotalCountsPerLocation | HighlightsTotalCountsPerPage, id: string
) => {
  const newTotalCounts = {...totalCounts};

  if (newTotalCounts[id]) {
    newTotalCounts[id] += 1;
  } else {
    newTotalCounts[id] = 1;
  }

  return newTotalCounts;
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
