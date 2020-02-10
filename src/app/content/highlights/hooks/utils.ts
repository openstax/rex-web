import {
  GetHighlightsColorsEnum,
  GetHighlightsSourceTypeEnum,
  Highlight,
  Highlights
} from '@openstax/highlighter/dist/api';
import { AppServices } from '../../../types';
import { assertDefined } from '../../../utils';
import { Book } from '../../types';
import { stripIdVersion } from '../../utils';
import { HighlightLocationFilters, SummaryHighlightsPagination, } from '../types';
import { addSummaryHighlight, getHighlightLocationFilterForPage } from '../utils';

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
