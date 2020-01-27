import { user } from '../../../auth/selectors';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { initializeMyHighlightsSummary, openMyHighlights } from '../actions';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof openMyHighlights> = ({
  dispatch, getState,
}) => async() => {
  const state = getState();
  const authenticated = user(state);
  const summaryNeedsInitialization = () => select.summaryHighlights(state) === null
    && select.summaryIsLoading(state) === false;

  if (authenticated && summaryNeedsInitialization()) {
    dispatch(initializeMyHighlightsSummary());
  }
};

export const openMyHighlightsHook = actionHook(openMyHighlights, hookBody);
