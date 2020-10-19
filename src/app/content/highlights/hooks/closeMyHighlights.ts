import { push } from '../../../navigation/actions';
import { locationState } from '../../../navigation/selectors';
import { ActionHookBody } from '../../../types';
import { actionHook, assertNotNull } from '../../../utils';
import { content } from '../../routes';
import { contentParams } from '../../selectors';
import { closeMyHighlights } from '../actions';

export const hookBody: ActionHookBody<typeof closeMyHighlights> = ({
  dispatch, getState,
}) => async() => {
  const state = getState();

  const currentParams = assertNotNull(contentParams(state), 'Closed modal before location was processed');
  const currentLocationState = locationState(state);

  dispatch(push({params: currentParams, route: content, state: currentLocationState}));
};

export const closeMyHighlightsHook = actionHook(closeMyHighlights, hookBody);
