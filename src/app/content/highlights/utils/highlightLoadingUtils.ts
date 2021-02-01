import {
  GetHighlightsRequest,
  GetHighlightsSourceTypeEnum,
  Highlights,
} from '@openstax/highlighter/dist/api';
import omit from 'lodash/fp/omit';
import { AppServices } from '../../../types';
import { assertDefined } from '../../../utils';
import { LocationFilters } from '../../components/popUp/types';
import { maxHighlightsApiPageSize } from '../../constants';
import { Book } from '../../types';
import { stripIdVersion } from '../../utils/idUtils';
import { CountsPerSource, HighlightData, SummaryHighlightsPagination } from '../types';
import { addSummaryHighlight, getHighlightLocationFilterForPage } from './';
import { getNextPageSources, incrementPage } from './paginationUtils';

const extractDataFromHighlightClientResponse = (highlightsResponse: Highlights) => {
  // TODO - change swagger so none of this is nullable
  const data = assertDefined(highlightsResponse.data, 'response from highlights api is invalid') as HighlightData[];
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

export const formatReceivedHighlights = (
  highlights: HighlightData[],
  locationFilters: LocationFilters
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
  colors,
  sets,
  pagination,
}: {
  highlightClient: AppServices['highlightClient'],
  prevHighlights?: HighlightData[],
  book: Book,
  pagination: NonNullable<SummaryHighlightsPagination>,
  colors: NonNullable<GetHighlightsRequest['colors']>;
  sets?: GetHighlightsRequest['sets'];
}) => {
  const highlightsResponse = await highlightClient.getHighlights({
    colors,
    scopeId: book.id,
    sets,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
    ...pagination,
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

export const loadUntilPageSize = async({
  previousPagination,
  ...args
}: {
  previousPagination: SummaryHighlightsPagination,
  book: Book | undefined,
  highlightClient: AppServices['highlightClient'],
  colors: NonNullable<GetHighlightsRequest['colors']>;
  sets?: GetHighlightsRequest['sets'];
  sourcesFetched: string[],
  countsPerSource: CountsPerSource,
  highlights?: HighlightData[]
  pageSize?: number,
}): Promise<{pagination: SummaryHighlightsPagination, highlights: HighlightData[]}> => {
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
    colors: args.colors,
    highlightClient: args.highlightClient,
    pagination: {page, sourceIds, perPage},
    prevHighlights: args.highlights,
    sets: args.sets,
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

export const loadAllHighlights = async({
  highlightClient,
  book,
  pagination,
  sets,
}: {
  highlightClient: AppServices['highlightClient'];
  book: Book;
  pagination: NonNullable<SummaryHighlightsPagination>;
  sets?: GetHighlightsRequest['sets']
}): Promise<HighlightData[]> => {
  const highlightsResponse = await highlightClient.getHighlights({
    ...pagination,
    perPage: maxHighlightsApiPageSize,
    scopeId: book.id,
    sets,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
  });

  const {data, page, perPage, totalCount} = extractDataFromHighlightClientResponse(
    highlightsResponse);
  const loadedResults = (page - 1) * perPage + data.length;

  if (loadedResults < totalCount) {
    const moreResults = await loadAllHighlights({
      book,
      highlightClient,
      pagination: incrementPage(pagination),
      sets,
    });
    return [...data, ...moreResults];
  } else {
    return data;
  }
};
