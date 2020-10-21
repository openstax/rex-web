import { user } from '../../../auth/selectors';
import { push } from '../../../navigation/actions';
import { locationState, query } from '../../../navigation/selectors';
import { getQueryForParam } from '../../../navigation/utils';
import { ActionHookBody } from '../../../types';
import { actionHook, assertNotNull } from '../../../utils';
import { modalQueryParameterName } from '../../constants';
import { content } from '../../routes';
import { contentParams, page } from '../../selectors';
import { initializeMyHighlightsSummary, openMyHighlights } from '../actions';
import { modalUrlName } from '../constants';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof openMyHighlights> = ({
  dispatch, getState,
}) => async() => {
  const state = getState();
  const authenticated = user(state);

  const highlightsLoaded = select.highlightsLoaded(state);
  const currentPage = page(state);
  const currentQuery = query(state);
  const currentParams = assertNotNull(contentParams(state), 'Opened modal before location was processed');
  const currentLocationState = locationState(state);

  const stateEstablished = highlightsLoaded || (!user && currentPage);

  const summaryNeedsInitialization = () => select.summaryHighlights(state) === null
    && select.summaryIsLoading(state) === false;

  if (stateEstablished && currentQuery[modalQueryParameterName] !== modalUrlName) {
    dispatch(push({
        params: currentParams,
        route: content,
        state: currentLocationState,
      }, {
        search: getQueryForParam(modalQueryParameterName, modalUrlName),
      }
    ));
  }

  if (authenticated && summaryNeedsInitialization()) {
    dispatch(initializeMyHighlightsSummary());
  }
};

export const openMyHighlightsHook = actionHook(openMyHighlights, hookBody);
