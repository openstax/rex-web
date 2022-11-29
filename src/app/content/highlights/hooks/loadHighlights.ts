import { getType } from 'typesafe-actions';
import { ensureApplicationErrorType } from '../../../../helpers/applicationMessageError';
import { receivePageFocus } from '../../../actions';
import { user } from '../../../auth/selectors';
import { AnyAction, AppServices, MiddlewareAPI } from '../../../types';
import { maxHighlightsApiPageSize } from '../../constants';
import { bookAndPage } from '../../selectors';
import { receiveHighlights } from '../actions';
import { HighlightLoadError } from '../errors';
import * as select from '../selectors';
import { HighlightData } from '../types';
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

  let highlights: HighlightData[];
  try {
    highlights = await loadAllHighlights({
      book,
      highlightClient,
      pagination: {page: 1, sourceIds: [page.id], perPage: maxHighlightsApiPageSize},
    });
  } catch (error) {
    throw ensureApplicationErrorType(
      error,
      () => action && action.type !== getType(receivePageFocus)
        ? new HighlightLoadError({ destination: 'page', shouldAutoDismiss: false })
        : error
    );
  }

  dispatch(receiveHighlights({highlights, pageId: page.id}));
};

export default hookBody;
