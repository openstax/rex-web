import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { deleteHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof deleteHighlight> =
  ({highlightClient}) => async({meta, payload}) => {
    if (meta.failedToSave) { return; }

    await highlightClient.deleteHighlight({id: payload});
  };

export default actionHook(deleteHighlight, hookBody);
