import { user } from '../../../auth/selectors';
import { push } from '../../../navigation/actions';
import { locationState } from '../../../navigation/selectors';
import { getQueryForParam } from '../../../navigation/utils';
import { ActionHookBody } from '../../../types';
import { actionHook, assertNotNull } from '../../../utils';
import { modalQueryParameterName } from '../../constants';
import { content } from '../../routes';
import { contentParams } from '../../selectors';
import { initializeMyHighlightsSummary, openMyHighlights } from '../actions';
import { modalUrlName } from '../constants';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof openMyHighlights> = ({
  dispatch, getState,
}) => async() => {
  const state = getState();
  const authenticated = user(state);

  const currentParams = assertNotNull(contentParams(state), 'Opened modal before location was processed');
  const currentLocationState = locationState(state);

  const summaryNeedsInitialization = () => select.summaryHighlights(state) === null
    && select.summaryIsLoading(state) === false;

  dispatch(push({
      params: currentParams,
      route: content,
      state: currentLocationState,
    }, {
      search: getQueryForParam(modalQueryParameterName, modalUrlName),
    }
  ));

  if (authenticated && summaryNeedsInitialization()) {
    dispatch(initializeMyHighlightsSummary());
  }
};

export const openMyHighlightsHook = actionHook(openMyHighlights, hookBody);
