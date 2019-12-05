import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { updateHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof updateHighlight> = ({highlightClient}) => async({payload}) => {
  highlightClient.updateHighlight(payload);
};

export default actionHook(updateHighlight, hookBody);
