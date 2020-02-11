import { GetHighlightsColorsEnum, Highlight } from '@openstax/highlighter/dist/api';
import { ActionHookBody, AppServices, MiddlewareAPI, Store } from '../../../types';
import { actionHook, assertWindow } from '../../../utils';
import { book as bookSelector } from '../../selectors';
import { printSummaryHighlights, receiveSummaryHighlights } from '../actions';
import { maxHighlightsPerFetch } from '../constants';
import * as select from '../selectors';
import { SummaryHighlightsPagination,  } from '../types';
import { fetchHighlightsForSource, formatReceivedHighlights, getNewSources, incrementPage } from './utils';

const loadAllRemainingHighlights = async({
  previousPagination,
  ...args
}: {
  previousPagination: SummaryHighlightsPagination,
  getState: Store['getState'],
  highlightClient: AppServices['highlightClient'],
  highlights?: Highlight[]
  sourcesFetched: string[]
}): Promise<{pagination: SummaryHighlightsPagination, highlights: Highlight[]}> => {
  const state = args.getState();
  const book = bookSelector(state);
  const {colors} = select.summaryFilters(state);
  const {page, sourceIds} = previousPagination
    ? incrementPage(previousPagination)
    : {sourceIds: getNewSources(state, args.sourcesFetched), page: 1};

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

const printHighlights = async({getState, highlightClient, dispatch}: MiddlewareAPI & AppServices) => {
  const state = getState();
  const locationFilters = select.highlightLocationFilters(state);
  const previousPagination = select.summaryPagination(state);
  const sourcesFetched = Object.keys(select.loadedCountsPerSource(state));

  const { highlights } = await loadAllRemainingHighlights({
    getState,
    highlightClient,
    previousPagination,
    sourcesFetched,
  });

  const formattedHighlights = formatReceivedHighlights(highlights, locationFilters);

  dispatch(receiveSummaryHighlights(formattedHighlights, null));

  assertWindow().print();
};

export default printHighlights;

export const hookBody: ActionHookBody<typeof printSummaryHighlights> =
  (services) => () => printHighlights(services);

export const printHighlightsHook = actionHook(printSummaryHighlights, hookBody);
