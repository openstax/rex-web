import { GetHighlightsSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { getType } from 'typesafe-actions';
import { receivePageFocus } from '../../../actions';
import { user } from '../../../auth/selectors';
import { AnyAction, AppServices, MiddlewareAPI } from '../../../types';
import { bookAndPage } from '../../selectors';
import { receiveHighlights } from '../actions';
import * as select from '../selectors';

const hookBody = (services: MiddlewareAPI & AppServices) => async(action?: AnyAction) => {
  const {dispatch, getState, highlightClient} = services;
  const state = getState();
  const {book, page} = bookAndPage(state);
  const authenticated = user(state);
  const loaded = select.highlightsLoaded(state);

  const pageFocusIn = action && action.type === getType(receivePageFocus) && action.payload;

  if (!authenticated || !book || !page || typeof(window) === 'undefined' || (loaded && !pageFocusIn)) {
    return;
  }

  const highlights = await highlightClient.getHighlights({
    perPage: 100,
    scopeId: book.id,
    sourceIds: [page.id],
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
  });

  if (highlights.data) {
    dispatch(receiveHighlights(highlights.data));
  }
};

export default hookBody;
