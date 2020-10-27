import { push } from '../../../navigation/actions';
import { query } from '../../../navigation/selectors';
import { removeParamFromQuery } from '../../../navigation/utils';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { modalQueryParameterName } from '../../constants';
import { getContentParams } from '../../utils/urlUtils';
import { closeMyHighlights } from '../actions';

export const hookBody: ActionHookBody<typeof closeMyHighlights> = ({
  dispatch, getState,
}) => () => {
  const state = getState();
  const existingQuery = query(state);

  dispatch(push(getContentParams(state), {
    search: removeParamFromQuery(modalQueryParameterName, existingQuery),
  }));
};

export const closeMyHighlightsHook = actionHook(closeMyHighlights, hookBody);
