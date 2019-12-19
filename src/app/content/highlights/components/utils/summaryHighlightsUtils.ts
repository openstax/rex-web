import {
  Highlight,
  HighlightColorEnum,
  HighlightUpdateColorEnum,
  UpdateHighlightRequest,
} from '@openstax/highlighter/dist/api';
import { SummaryFilters, SummaryHighlights } from '../../types';

interface BaseData {
  locationId?: string;
  pageId: string;
}

interface DataAdd extends BaseData {
  highlight: Highlight;
}

export const addSummaryHighlight = (summaryHighlights: SummaryHighlights, data: DataAdd) => {
  const newHighlights = {...summaryHighlights};
  const { locationId, pageId, highlight } = data;
  const chId = locationId || pageId;

  if (newHighlights[chId]) {
    if (newHighlights[chId][pageId]) {
      newHighlights[chId][pageId].push(highlight);
    } else {
      newHighlights[chId][pageId] = [highlight];
    }
  } else {
    newHighlights[chId] = {
      [pageId]: [highlight],
    };
  }
  return newHighlights;
};

interface DataRemove extends BaseData {
  id: string;
}

export const removeSummaryHighlight = (summaryHighlights: SummaryHighlights, data: DataRemove) => {
  const newHighlights = {...summaryHighlights};
  const { locationId, pageId, id } = data;
  const chId = locationId || pageId;

  if (newHighlights[chId] && newHighlights[chId][pageId]) {
    newHighlights[chId][pageId] = newHighlights[chId][pageId]
      .filter((h) => h.id !== id);
    if (newHighlights[chId][pageId].length === 0) {
      delete newHighlights[chId][pageId];
    }
    if (Object.keys(newHighlights[chId]).length === 0) {
      delete newHighlights[chId];
    }
  }

  return newHighlights;
};

interface DataUpdate extends BaseData, UpdateHighlightRequest {}

export const updateSummaryHighlight = (summaryHighlights: SummaryHighlights, data: DataUpdate) => {
  const newHighlights = {...summaryHighlights};
  const { locationId, pageId, id, highlight } = data;
  const chId = locationId || pageId;

  if (newHighlights[chId] && newHighlights[chId][pageId]) {
    newHighlights[chId][pageId] = newHighlights[chId][pageId].map((currHighlight) =>
      currHighlight.id === id ? {
        ...currHighlight,
        ...highlight,
        color: highlight.color as string as HighlightColorEnum,
      } : currHighlight);
  }

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
  let newHighlights = {...summaryHighlights};
  const { locationId, pageId, highlight: updatedHighlight, highlight: { color, annotation } } = data;
  const chId = locationId || pageId;
  const { colors, locationIds } = filters;

  // If highlight's chapter is not in summary filters stop here...
  if (!locationIds.includes(chId)) { return newHighlights; }

  // If highlight's color has changed and it's no longer in filters
  // remove this highlight from summary highlights...
  if (!colors.includes(color)) {
    newHighlights = removeSummaryHighlight(newHighlights, {
      id: updatedHighlight.id,
      locationId,
      pageId,
    });
    return newHighlights;
  }

  // If color it is in filters and highlight was already in summary highlights
  // then just update it.
  if (
    newHighlights[chId]
    && newHighlights[chId][pageId]
    && newHighlights[chId][pageId].find((currHighlight) => currHighlight.id === updatedHighlight.id)
  ) {
    newHighlights = updateSummaryHighlight(newHighlights, {
      highlight: { color: color as string as HighlightUpdateColorEnum, annotation },
      id: updatedHighlight.id,
      locationId,
      pageId,
    });
    return newHighlights;
  }

  // If it wasn't then add it to summary highlights.
  newHighlights = addSummaryHighlight(newHighlights, {
    highlight: updatedHighlight,
    locationId,
    pageId,
  });

  return newHighlights;
};
