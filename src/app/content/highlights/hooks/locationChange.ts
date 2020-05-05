import { GetHighlightsSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { getType } from 'typesafe-actions';
import { receivePageFocus } from '../../../actions';
import { user } from '../../../auth/selectors';
import { AnyAction, AppServices, MiddlewareAPI } from '../../../types';
import { bookAndPage } from '../../selectors';
import { Book } from '../../types';
import { receiveHighlights } from '../actions';
import { maxHighlightsApiPageSize } from '../constants';
import * as select from '../selectors';
import { HighlightData, SummaryHighlightsPagination } from '../types';
import { extractDataFromHighlightClientResponse, incrementPage } from './utils';

// TODO - some of this logic could be integrated into src/app/content/highlights/hooks/utils.ts
// once openstax/rex-web#489 is merged

interface LoadAllHighlightsArgs {
  highlightClient: AppServices['highlightClient'];
  book: Book;
  pagination: NonNullable<SummaryHighlightsPagination>;
}
const loadAllHighlights = async(args: LoadAllHighlightsArgs): Promise<HighlightData[]> => {
  const {highlightClient, book, pagination} = args;
  const highlightsResponse = await highlightClient.getHighlights({
    perPage: maxHighlightsApiPageSize,
    scopeId: book.id,
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
    ...pagination,
  });

  const {data, page, perPage, totalCount} = extractDataFromHighlightClientResponse(highlightsResponse);
  const loadedResults = (page - 1) * perPage + data.length;

  if (loadedResults < totalCount) {
    const moreResults = await loadAllHighlights({...args, pagination: incrementPage(pagination)});
    return [...data, ...moreResults];
  } else {
    return data;
  }
};

// const didntChangeLocation = () => {
  
// }

const hookBody = (services: MiddlewareAPI & AppServices) => async(action?: AnyAction) => {
  const {dispatch, getState, highlightClient} = services;
  const state = getState();
  const {book, page} = bookAndPage(state);
  const authenticated = user(state);
  const loaded = select.highlightsLoaded(state);
  const highlightsPageId = select.highlightsPageId(state);

  const pageFocusIn = action && action.type === getType(receivePageFocus) && action.payload;

  if (
    !authenticated
    || !book
    || !page
    || typeof(window) === 'undefined'
    || (loaded && !pageFocusIn)
    || (!pageFocusIn && highlightsPageId === page.id)
  ) {
    return;
  }

  const highlights = await loadAllHighlights({
    book,
    highlightClient,
    pagination: {page: 1, sourceIds: [page.id], perPage: maxHighlightsApiPageSize},
  });

  dispatch(receiveHighlights({highlights, pageId: page.id}));
};

export default hookBody;
