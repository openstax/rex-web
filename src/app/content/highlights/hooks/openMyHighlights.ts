import { user } from '../../../auth/selectors';
// import { replace } from '../../../navigation/actions';
// import * as navigation from '../../../navigation/selectors';
// import { AnyMatch } from '../../../navigation/types';
// import { getQueryForParam } from '../../../navigation/utils';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { closeMobileMenu } from '../../actions';
import { initializeMyHighlightsSummary, openMyHighlights } from '../actions';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof openMyHighlights> = ({
  dispatch, getState,
}) => async() => {
  const state = getState();
  // const query = navigation.query(state);
  // const match = navigation.match(state);
  // const summaryFilters = select.summaryFilters(state);

  const authenticated = user(state);
  const summaryNeedsInitialization = () => select.summaryHighlights(state) === null
    && select.summaryIsLoading(state) === false;

  if (authenticated && summaryNeedsInitialization()) {
    dispatch(initializeMyHighlightsSummary());
    // dispatch(replace(match as AnyMatch, {
    //   search: getQueryForParam(summaryFilters as any as Record<string, string[]>, query),
    // }));
  }

  dispatch(closeMobileMenu());
};

export const openMyHighlightsHook = actionHook(openMyHighlights, hookBody);
