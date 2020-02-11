import { GetHighlightsColorsEnum } from '@openstax/highlighter/dist/api';
import { ActionHookBody } from '../../../types';
import { actionHook, assertWindow } from '../../../utils';
import { book as bookSelector } from '../../selectors';
import { printSummaryHighlights, receiveSummaryHighlights } from '../actions';
import { maxHighlightsPerFetch } from '../constants';
import * as select from '../selectors';
import {
  fetchFunctionBody,
  fetchHighlightsForSource,
  getNewSources,
  incrementPage,
  loadMoreByFunction,
} from './utils';

const loadAllRemainingHighlights: fetchFunctionBody = async({
  previousPagination,
  ...args
}) => {
  const state = args.getState();
  const book = bookSelector(state);
  const {colors} = select.summaryFilters(state);
  const {page, sourceIds} = previousPagination
    ? incrementPage(previousPagination)
    : {sourceIds: getNewSources(state, args.sourcesFetched, maxHighlightsPerFetch), page: 1};

  if (!book || sourceIds.length === 0) {
    return {pagination: null, highlights: args.highlights || []};
  }

  const { highlights, pagination } = await fetchHighlightsForSource({
    book,
    colors: colors as unknown as GetHighlightsColorsEnum[],
    highlightClient: args.highlightClient,
    pagination: {page, sourceIds},
    perFetch: maxHighlightsPerFetch,
    prevHighlights: args.highlights,
  });

  return loadAllRemainingHighlights({
    ...args,
    highlights: args.highlights ? [...args.highlights, ...highlights] : highlights,
    previousPagination: pagination,
    sourcesFetched: [...args.sourcesFetched, ...sourceIds],
  });
};

// very similar to `loadMore` hook since both are meant to fetch summary highlights
// main difference is that this one is meant to recursively fetch all of them, the other one
// only up to a set limit.
export const hookBody: ActionHookBody<typeof printSummaryHighlights> =
  (services) => async() => {
    const {formattedHighlights, pagination} = await loadMoreByFunction(loadAllRemainingHighlights, services);
    services.dispatch(receiveSummaryHighlights(formattedHighlights, pagination));
    assertWindow().print();
  };

export const printHighlightsHook = actionHook(printSummaryHighlights, hookBody);
