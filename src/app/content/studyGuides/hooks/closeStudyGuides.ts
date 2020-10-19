import { push } from '../../../navigation/actions';
import { locationState } from '../../../navigation/selectors';
import { ActionHookBody } from '../../../types';
import { actionHook, assertNotNull } from '../../../utils';
import { content } from '../../routes';
import * as selectContent from '../../selectors';
import { closeStudyGuides } from '../actions';

export const hookBody: ActionHookBody<typeof closeStudyGuides> = (services) => async() => {
  const state = services.getState();
  const currentParams = assertNotNull(selectContent.contentParams(state), 'Closed modal before location was processed');
  const currentLocationState = locationState(state);

  services.dispatch(push({params: currentParams, route: content, state: currentLocationState}));
};

export const closeStudyGuidesHook = actionHook(closeStudyGuides, hookBody);
