import {
  GetHighlightsRequest,
  GetHighlightsSourceTypeEnum,
  Highlight,
  Highlights,
} from '@openstax/highlighter/dist/api';
import omit from 'lodash/fp/omit';
import pick from 'lodash/fp/pick';
import { AppServices, MiddlewareAPI } from '../../types';
import { assertDefined } from '../../utils';
import { maxHighlightsApiPageSize } from '../constants';
import { addSummaryHighlight, getHighlightLocationFilterForPage } from '../highlights/utils';
import { getNextPageSources, incrementPage } from '../highlights/utils/paginationUtils';
import { book as bookSelector } from '../selectors';
import { Book, CountsPerSource, HighlightData, HighlightLocationFilters, SummaryHighlightsPagination } from '../types';
import { stripIdVersion } from './idUtils';

interface SummaryQueryParams {
  colors: NonNullable<GetHighlightsRequest['colors']>;
  sets?: GetHighlightsRequest['sets'];
}

type ContentQueryParams = Pick<SummaryQueryParams, 'sets'>;

type QueryParams = ContentQueryParams | SummaryQueryParams;

interface PopupSummaryContentQuery {
  previousPagination: SummaryHighlightsPagination;
  sourcesFetched: string[];
  countsPerSource: CountsPerSource;
  locationFilters: HighlightLocationFilters;
  pageSize?: number;
}

interface ContentQuery {
  pagination: NonNullable<SummaryHighlightsPagination>;
}

const extractDataFromHighlightClientResponse = (highlightsResponse: Highlights) => {
  // TODO - change swagger so none of this is nullable
  const data = assertDefined(highlightsResponse.data, 'response from highlights api is invalid');
  const meta = assertDefined(highlightsResponse.meta, 'response from highlights api is invalid');
  const page = assertDefined(meta.page, 'response from highlights api is invalid');
  const perPage = assertDefined(meta.perPage, 'response from highlights api is invalid');
  const totalCount = assertDefined(meta.totalCount, 'response from highlights api is invalid');

  return {
    data,
    meta,
    page,
    perPage,
    totalCount,
  };
};

const getNewSources = (
  book: Book | undefined,
  omitSources: string[],
  countsPerSource: CountsPerSource,
  pageSize?: number
) => {
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
  params,
  pagination,
}: {
  highlightClient: AppServices['highlightClient'],
  prevHighlights?: Highlight[],
  book: Book,
  pagination: NonNullable<SummaryHighlightsPagination>,
  params: QueryParams
}) => {
  const highlightsResponse = await highlightClient.getHighlights({
    scopeId: book.id,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
    ...pagination,
    ...params,
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
  book: Book | undefined,
  highlightClient: AppServices['highlightClient'],
  params: QueryParams
  sourcesFetched: string[],
  countsPerSource: CountsPerSource
  highlights?: Highlight[]
  pageSize?: number,
}): Promise<{pagination: SummaryHighlightsPagination, highlights: Highlight[]}> => {
  const {page, sourceIds, perPage} = previousPagination
    ? incrementPage(previousPagination)
    : {
      page: 1,
      perPage: args.pageSize || maxHighlightsApiPageSize,
      sourceIds: getNewSources(args.book, args.sourcesFetched, args.countsPerSource, args.pageSize),
    };

  if (!args.book || sourceIds.length === 0) {
    return {pagination: null, highlights: args.highlights || []};
  }

  const {highlights, pagination} = await fetchHighlightsForSource({
    book: args.book,
    highlightClient: args.highlightClient,
    pagination: {page, sourceIds, perPage},
    params: args.params,
    prevHighlights: args.highlights,
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

const loadAllHighlights = async({
  highlightClient,
  book,
  pagination,
  params,
}: {
  highlightClient: AppServices['highlightClient'];
  book: Book;
  pagination: NonNullable<SummaryHighlightsPagination>;
  params?: ContentQueryParams
}): Promise<HighlightData[]> => {
  const apiCallParams = params || {};

  const highlightsResponse = await highlightClient.getHighlights({
    perPage: maxHighlightsApiPageSize,
    scopeId: book.id,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
    ...pagination,
    ...apiCallParams,
  });

  const {data, page, perPage, totalCount} = extractDataFromHighlightClientResponse(
    highlightsResponse);
  const loadedResults = (page - 1) * perPage + data.length;

  if (loadedResults < totalCount) {
    const moreResults = await loadAllHighlights({
      book,
      highlightClient,
      pagination: incrementPage(pagination),
      params: apiCallParams,
    });
    return [...data, ...moreResults];
  } else {
    return data;
  }
};

const createLoader = (services: MiddlewareAPI & AppServices, params: QueryParams) => {
  const { highlightClient } = services;
  const state = services.getState();
  const book = bookSelector(state);

  const loadSummary = async(query: PopupSummaryContentQuery) => {
    const {pagination, highlights} = await loadUntilPageSize({
      ...query,
      book,
      highlightClient,
      params,
    });

    const formattedHighlights = formatReceivedHighlights(highlights, query.locationFilters);

    return {formattedHighlights, pagination};
  };

  const loadAll = async(query: ContentQuery) => {
    if (!book) { return []; }

    return loadAllHighlights({
      book,
      highlightClient,
      pagination: query.pagination,
      params: pick('sets', params),
    });
  };

  return {
    loadAll,
    loadSummary,
  };
};

export default createLoader;
