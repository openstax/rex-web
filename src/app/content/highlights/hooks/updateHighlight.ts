import { ActionHookBody } from '../../../types';
import { actionHook, makeApiCallOrThrow } from '../../../utils';
import { updateHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof updateHighlight> = ({highlightClient}) => async({payload}) => {
  await makeApiCallOrThrow(highlightClient.updateHighlight(payload));
};

export default actionHook(updateHighlight, hookBody);
