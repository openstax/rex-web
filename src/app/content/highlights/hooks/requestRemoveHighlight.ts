import { scrollTarget as scrollTargetSelector } from '../../../navigation/selectors';
import { ActionHookBody } from '../../../types';
import { actionHook, assertWindow } from '../../../utils';
import { receiveDeleteHighlight, requestDeleteHighlight } from '../actions';
import { isHighlightScrollTarget } from '../guards';

export const hookBody: ActionHookBody<typeof requestDeleteHighlight> =
  ({dispatch, getState}) => ({meta, payload}) => {
    const scrollTarget = scrollTargetSelector( getState());
    if (scrollTarget && isHighlightScrollTarget(scrollTarget) && scrollTarget.id === payload.id) {
      const window = assertWindow();
      window.history.replaceState(null, '', window.location.origin + window.location.pathname);
    }

    dispatch(receiveDeleteHighlight(payload, meta));
  };

export default actionHook(requestDeleteHighlight, hookBody);
