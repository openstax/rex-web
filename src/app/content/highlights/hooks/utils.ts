import {
  GetHighlightsColorsEnum,
  GetHighlightsSourceTypeEnum,
  Highlight,
  Highlights
} from '@openstax/highlighter/dist/api';
import omit from 'lodash/fp/omit';
import { AppServices, AppState, MiddlewareAPI, Store } from '../../../types';
import { assertDefined } from '../../../utils';
import { book as bookSelector } from '../../selectors';
import { Book } from '../../types';
import { stripIdVersion } from '../../utils';
import * as select from '../selectors';
import { HighlightLocationFilters, SummaryHighlightsPagination, } from '../types';
import { addSummaryHighlight, getHighlightLocationFilterForPage } from '../utils';
import { getNextPageSources } from '../utils/paginationUtils';

export type fetchFunctionBody = (args: { previousPagination: SummaryHighlightsPagination, getState: Store['getState'],
    highlightClient: AppServices['highlightClient'],
    highlights?: Highlight[]
    sourcesFetched: string[]}
  ) => Promise<{pagination: SummaryHighlightsPagination, highlights: Highlight[]}>;

export const formatReceivedHighlights = (
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

export const incrementPage = (pagination: NonNullable<SummaryHighlightsPagination>) =>
({...pagination, page: pagination.page + 1});

export const getNewSources = (state: AppState, omitSources: string[], limit?: number) => {
  const book = bookSelector(state);
  const remainingCounts = omit(omitSources, select.filteredCountsPerPage(state));
  return book ?  getNextPageSources(remainingCounts, book.tree, limit) : [];
};

export const extractDataFromHighlightClientResponse = (highlightsResponse: Highlights) => {
  // TODO - change swagger so none of this is nullable
  const data = assertDefined(highlightsResponse.data, 'response from highlights api is invalid');
  const meta = assertDefined(highlightsResponse.meta, 'response from highlights api is invalid');
  const perPage = assertDefined(meta.perPage, 'response from highlights api is invalid');
  const totalCount = assertDefined(meta.totalCount, 'response from highlights api is invalid');

  return {
    data,
    meta,
    perPage,
    totalCount,
  };
};

export const fetchHighlightsForSource = async({
  highlightClient,
  colors,
  prevHighlights,
  perFetch,
  book,
  pagination,
}: {
  highlightClient: AppServices['highlightClient'],
  colors: GetHighlightsColorsEnum[],
  prevHighlights?: Highlight[],
  perFetch: number,
  book: Book,
  pagination: NonNullable<SummaryHighlightsPagination>
}) => {
  const {sourceIds, page} = pagination;

  const highlightsResponse = await highlightClient.getHighlights({
    colors: colors as unknown as GetHighlightsColorsEnum[],
    page,
    perPage: perFetch,
    scopeId: book.id,
    sourceIds,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
  });

  const {data, perPage, totalCount} = extractDataFromHighlightClientResponse(highlightsResponse);

  const loadedResults = (page - 1) * perPage + data.length;
  const nextPagination = loadedResults < totalCount
    ? {sourceIds, page}
    : null;

  return {
    highlights: prevHighlights ? [...prevHighlights, ...data] : data,
    pagination: nextPagination,
  };
};

export const loadMoreByFunction = async(fetchingFunction: fetchFunctionBody, {
  getState,
  highlightClient,
}: MiddlewareAPI & AppServices) => {
  const state = getState();
  const locationFilters = select.highlightLocationFilters(state);
  const previousPagination = select.summaryPagination(state);
  const sourcesFetched = Object.keys(select.loadedCountsPerSource(state));

  const {pagination, highlights} = await fetchingFunction({
    getState,
    highlightClient,
    previousPagination,
    sourcesFetched,
  });

  const formattedHighlights = formatReceivedHighlights(highlights, locationFilters);

  return {formattedHighlights, pagination};
};
