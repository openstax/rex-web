import { user } from '../../../../auth/selectors';
import { locationChange } from '../../../../navigation/actions';
import { getParamFromQuery } from '../../../../navigation/utils';
import { ActionHookBody } from '../../../../types';
import { actionHook } from '../../../../utils';
import { modalQueryParameterName } from '../../../constants';
import { bookAndPage } from '../../../selectors';
import { openMyHighlights } from '../../actions';
import { modalUrlName } from '../../constants';
import { highlightsLoaded } from '../../selectors';

const hookBody: ActionHookBody<typeof locationChange> = ({
  dispatch, getState,
}) => async(action) => {
  const state = getState();

  const authenticated = user(state);
  const loaded = highlightsLoaded(state);
  const { page } = bookAndPage(state);

  const stateEstablished = loaded || (!authenticated && page);

  if (
    !stateEstablished
    || action.payload.action !== 'POP'
    || getParamFromQuery(action.payload.location.search, modalQueryParameterName) !== modalUrlName) {
    return;
  }

  dispatch(openMyHighlights());
};

export const syncModalWithUrlHook = actionHook(locationChange, hookBody);
