import { getType } from 'typesafe-actions';
import { receivePageFocus } from '../../../actions';
import { user } from '../../../auth/selectors';
import { scrollTarget as scrollTargetSelector } from '../../../navigation/selectors';
import { AnyAction, AppServices, MiddlewareAPI } from '../../../types';
import { maxHighlightsApiPageSize } from '../../constants';
import { bookAndPage } from '../../selectors';
import { focusHighlight, receiveHighlights } from '../actions';
import { isHighlightScrollTarget } from '../guards';
import * as select from '../selectors';
import { loadAllHighlights } from '../utils/highlightLoadingUtils';

const hookBody = (services: MiddlewareAPI & AppServices) => async(action?: AnyAction) => {
  const {dispatch, getState, highlightClient} = services;
  const state = getState();
  const {book, page} = bookAndPage(state);
  const authenticated = user(state);
  const loaded = select.highlightsLoaded(state);
  const highlightsPageId = select.highlightsPageId(state);
  const scrollTarget = scrollTargetSelector(state);

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

  if (isHighlightScrollTarget(scrollTarget) && highlights.find((highlight) => highlight.id === scrollTarget.id)) {
    dispatch(focusHighlight(scrollTarget.id));
  }
};

export default hookBody;
