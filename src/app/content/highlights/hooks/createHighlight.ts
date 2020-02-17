import { ActionHookBody } from '../../../types';
import { actionHook, makeApiCallOrThrow } from '../../../utils';
import { createHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof createHighlight> = ({highlightClient}) => async({payload}) => {
  await makeApiCallOrThrow(highlightClient.addHighlight({highlight: payload}));
};

export default actionHook(createHighlight, hookBody);
