import { addToast } from '../../../notifications/actions';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { createHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof createHighlight> = ({highlightClient, dispatch}) => async({payload}) => {
  try {
    await highlightClient.addHighlight({highlight: payload});
  } catch {
    dispatch(addToast('i18n:notification:toast:highlights:create-failure'));
  }
};

export default actionHook(createHighlight, hookBody);
