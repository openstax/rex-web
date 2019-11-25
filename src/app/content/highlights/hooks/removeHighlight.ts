import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { deleteHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof deleteHighlight> = ({highlightClient}) => async({payload}) => {
  highlightClient.deleteHighlight({id: payload});
};

export default actionHook(deleteHighlight, hookBody);
