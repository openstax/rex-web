import {
  GetHighlightsRequest,
  GetHighlightsSourceTypeEnum,
  Highlight,
} from '@openstax/highlighter/dist/api';
import omit from 'lodash/fp/omit';
import { AppServices, AppState, MiddlewareAPI, Store } from '../../../types';
import { assertDefined } from '../../../utils';
import { maxHighlightsApiPageSize } from '../../constants';
import { addSummaryHighlight } from '../../highlights/utils';
import { getNextPageSources, incrementPage } from '../../highlights/utils/paginationUtils';
import { book as bookSelector } from '../../selectors';
import { CountsPerSource, HighlightLocationFilters, SummaryHighlightsPagination } from '../../types';
import { Book } from '../../types';
import { stripIdVersion } from '../idUtils';
import extractDataFromHighlightClientResponse from './extractDataFromHighlightClientResponse';
import getHighlightLocationFilterForPage from './getHighlightLocationFilterForPage';

interface SummaryHighlightsQuery {
  colors: NonNullable<GetHighlightsRequest['colors']>;
  sets?: GetHighlightsRequest['sets'];
}

const getNewSources = (state: AppState, omitSources: string[], countsPerSource: CountsPerSource, pageSize?: number) => {
  const book = bookSelector(state);
  const remainingCounts = omit(omitSources, countsPerSource);
  return book ? getNextPageSources(remainingCounts, book.tree, pageSize) : [];
};

const formatReceivedHighlights = (
  highlights: Highlight[],
  locationFilters: HighlightLocationFilters
) => highlights.reduce((result, highlight) => {
  const pageId = stripIdVersion(highlight.sourceId);
  const location = assertDefined(
    getHighlightLocationFilterForPage(locationFilters, pageId),
    'highlight is not in a valid location'
  );
  const locationFilterId = stripIdVersion(location.id);

  return addSummaryHighlight(result, {
    highlight,
    locationFilterId,
    pageId,
  });
}, {} as ReturnType<typeof addSummaryHighlight>);

const fetchHighlightsForSource = async({
  highlightClient,
  prevHighlights,
  book,
  query,
  pagination,
}: {
  highlightClient: AppServices['highlightClient'],
  prevHighlights?: Highlight[],
  book: Book,
  pagination: NonNullable<SummaryHighlightsPagination>,
  query: SummaryHighlightsQuery
}) => {
  const highlightsResponse = await highlightClient.getHighlights({
    scopeId: book.id,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
    ...pagination,
    ...query,
  });

  const {data, perPage, totalCount} = extractDataFromHighlightClientResponse(highlightsResponse);

  const loadedResults = (pagination.page - 1) * perPage + data.length;
  const nextPagination = loadedResults < totalCount
    ? pagination
    : null;

  return {
    highlights: prevHighlights ? [...prevHighlights, ...data] : data,
    pagination: nextPagination,
  };
};

const loadUntilPageSize = async({
  previousPagination,
  ...args
}: {
  previousPagination: SummaryHighlightsPagination,
  getState: Store['getState'],
  highlightClient: AppServices['highlightClient'],
  highlights?: Highlight[]
  sourcesFetched: string[],
  pageSize?: number,
  query: SummaryHighlightsQuery
  countsPerSource: CountsPerSource
}): Promise<{pagination: SummaryHighlightsPagination, highlights: Highlight[]}> => {
  const state = args.getState();
  const book = bookSelector(state);

  const {page, sourceIds, perPage} = previousPagination
    ? incrementPage(previousPagination)
    : {
      page: 1,
      perPage: args.pageSize || maxHighlightsApiPageSize,
      sourceIds: getNewSources(state, args.sourcesFetched, args.countsPerSource, args.pageSize),
    };

  if (!book || sourceIds.length === 0) {
    return {pagination: null, highlights: args.highlights || []};
  }

  const {highlights, pagination} = await fetchHighlightsForSource({
    book,
    highlightClient: args.highlightClient,
    pagination: {page, sourceIds, perPage},
    prevHighlights: args.highlights,
    query: args.query,
  });

  if (highlights.length < perPage || !args.pageSize) {
    return loadUntilPageSize({
      ...args,
      highlights,
      previousPagination: pagination,
      sourcesFetched: [...args.sourcesFetched, ...sourceIds],
    });
  }
  return {pagination, highlights};
};

const createSummaryHighlightsLoader = ({
  locationFilters,
  previousPagination,
  sourcesFetched,
  query,
  countsPerSource,
}: {
  locationFilters: HighlightLocationFilters,
  previousPagination: SummaryHighlightsPagination,
  sourcesFetched: string[],
  query: SummaryHighlightsQuery,
  countsPerSource: CountsPerSource
}) => async({getState, highlightClient}: MiddlewareAPI & AppServices, pageSize?: number) => {
  const {pagination, highlights} = await loadUntilPageSize({
    countsPerSource,
    getState,
    highlightClient,
    pageSize,
    previousPagination,
    query,
    sourcesFetched,
  });

  const formattedHighlights = formatReceivedHighlights(highlights, locationFilters);

  return {formattedHighlights, pagination};
};

export default createSummaryHighlightsLoader;
