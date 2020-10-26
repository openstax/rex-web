import { user } from '../../../auth/selectors';
import { push } from '../../../navigation/actions';
import { query } from '../../../navigation/selectors';
import { getQueryForParam } from '../../../navigation/utils';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { modalQueryParameterName } from '../../constants';
import { getContentParams } from '../../utils/urlUtils';
import { initializeMyHighlightsSummary, openMyHighlights } from '../actions';
import { modalUrlName } from '../constants';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof openMyHighlights> = ({
  dispatch, getState,
}) => async() => {
  const state = getState();
  const authenticated = user(state);
  const existingQuery = query(state);

  const summaryNeedsInitialization = () => select.summaryHighlights(state) === null
    && select.summaryIsLoading(state) === false;

  dispatch(push(getContentParams(state), {
    search: getQueryForParam(modalQueryParameterName, modalUrlName, existingQuery)
  }));

  if (authenticated && summaryNeedsInitialization()) {
    dispatch(initializeMyHighlightsSummary());
  }
};

export const openMyHighlightsHook = actionHook(openMyHighlights, hookBody);
