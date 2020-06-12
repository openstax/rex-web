import { GetHighlightsSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { extractDataFromHighlightClientResponse } from '.';
import { AppServices } from '../../../types';
import { maxHighlightsApiPageSize } from '../../constants';
import { incrementPage } from '../../highlights/utils/paginationUtils';
import { Book, HighlightData, SummaryHighlightsPagination } from '../../types';
import { SummaryHighlightsQuery } from './createSummaryHighlightsLoader';

const loadAllHighlights = async({
  highlightClient,
  book,
  pagination,
  query,
}: {
  highlightClient: AppServices['highlightClient'];
  book: Book;
  pagination: NonNullable<SummaryHighlightsPagination>;
  query?: Pick<SummaryHighlightsQuery, 'sets'>
}): Promise<HighlightData[]> => {
  const apiCallQuery = query || {}

  const highlightsResponse = await highlightClient.getHighlights({
    perPage: maxHighlightsApiPageSize,
    scopeId: book.id,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
    ...pagination,
    ...apiCallQuery,
  });

  const {data, page, perPage, totalCount} = extractDataFromHighlightClientResponse(
    highlightsResponse);
  const loadedResults = (page - 1) * perPage + data.length;

  if (loadedResults < totalCount) {
    const moreResults = await loadAllHighlights({
      book,
      highlightClient,
      pagination: incrementPage(pagination),
      query: apiCallQuery,
    });
    return [...data, ...moreResults];
  } else {
    return data;
  }
};

export default loadAllHighlights;
