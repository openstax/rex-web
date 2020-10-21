import { Highlight } from '@openstax/highlighter/dist/api';
import { getType } from 'typesafe-actions';
import Sentry from '../../../../helpers/Sentry';
import { receivePageFocus } from '../../../actions';
import { user } from '../../../auth/selectors';
import { locationChange } from '../../../navigation/actions';
import { getParamFromQuery } from '../../../navigation/utils';
import { addToast } from '../../../notifications/actions';
import { ActionHookBody, AnyAction, AppServices, MiddlewareAPI } from '../../../types';
import { actionHook } from '../../../utils';
import { maxHighlightsApiPageSize, modalQueryParameterName } from '../../constants';
import { bookAndPage } from '../../selectors';
import { openMyHighlights, receiveHighlights } from '../actions';
import { modalUrlName } from '../constants';
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
    Sentry.captureException(error);

    if (action && action.type !== getType(receivePageFocus)) {
      dispatch(addToast({messageKey: 'i18n:notification:toast:highlights:load-failure', shouldAutoDismiss: false}));
    }
    return;
  }

  dispatch(receiveHighlights({highlights, pageId: page.id}));
};

const hook2: ActionHookBody<typeof locationChange> = ({
  dispatch, getState,
}) => async(action) => {
  const summaryOpen = select.myHighlightsOpen(getState());

  if (!summaryOpen && getParamFromQuery(action.payload.location.search, modalQueryParameterName) === modalUrlName) {
    dispatch(openMyHighlights());
  }
};

export const doStuff = actionHook(locationChange, hook2);

export default hookBody;
