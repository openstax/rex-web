import { getType } from 'typesafe-actions';
import { receivePageFocus } from '../../../actions';
import { user } from '../../../auth/selectors';
import { AnyAction, AppServices, MiddlewareAPI } from '../../../types';
import { maxHighlightsApiPageSize } from '../../constants';
import { bookAndPage } from '../../selectors';
import { loadAllHighlights } from '../../utils/highlightLoadingUtils';
import { receiveHighlights } from '../actions';
import * as select from '../selectors';

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
