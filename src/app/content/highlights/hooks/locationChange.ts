import { Highlight } from '@openstax/highlighter/dist/api';
import { getType } from 'typesafe-actions';
import Sentry from '../../../../helpers/Sentry';
import { receivePageFocus } from '../../../actions';
import { user } from '../../../auth/selectors';
import { addToast } from '../../../notifications/actions';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { AnyAction, AppServices, MiddlewareAPI } from '../../../types';
import { maxHighlightsApiPageSize } from '../../constants';
import { bookAndPage } from '../../selectors';
import { receiveHighlights } from '../actions';
import * as select from '../selectors';
import { loadAllHighlights } from '../utils/highlightLoadingUtils';

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

  let highlights: Highlight[];
  try {
    highlights = await loadAllHighlights({
      book,
      highlightClient,
      pagination: {page: 1, sourceIds: [page.id], perPage: maxHighlightsApiPageSize},
    });
  } catch (error) {
    const errorId = Sentry.captureException(error);
    if (action && action.type !== getType(receivePageFocus)) {
      dispatch(
        addToast(toastMessageKeys.higlights.failure.load, {destination: 'page', shouldAutoDismiss: false, errorId}));
    }
    return;
  }

  dispatch(receiveHighlights({highlights, pageId: page.id}));
};

export default hookBody;
