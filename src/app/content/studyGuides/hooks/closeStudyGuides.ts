import { push } from '../../../navigation/actions';
import { query } from '../../../navigation/selectors';
import { removeParamFromQuery } from '../../../navigation/utils';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { modalQueryParameterName } from '../../constants';
import { getContentParams } from '../../utils/urlUtils';
import { closeStudyGuides } from '../actions';

export const hookBody: ActionHookBody<typeof closeStudyGuides> = (services) => async() => {
  const state = services.getState();
  const existingQuery = query(state);

  services.dispatch(push(getContentParams(state), {
    search: removeParamFromQuery(modalQueryParameterName, existingQuery),
  }));
};

export const closeStudyGuidesHook = actionHook(closeStudyGuides, hookBody);
