import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { createHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof createHighlight> = ({highlightClient}) => async({payload}) => {
  await highlightClient.addHighlight({highlight: payload});
};

export default actionHook(createHighlight, hookBody);
