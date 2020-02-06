import { getType } from 'typesafe-actions';
import { callHistoryMethod } from '../../../navigation/actions';
import { AnyAction, Dispatch } from '../../../types';
import { Middleware } from '../../../types';
import { clearFocusedHighlight } from '../actions';
import showConfirmation from '../components/utils/showConfirmation';
import * as select from '../selectors';

const actionsToIntercept = new Set<AnyAction['type']>([
    callHistoryMethod,
].map(getType));

export default (): Middleware => ({dispatch, getState}) => (next: Dispatch) => async(action: AnyAction) => {
    const state = getState();
    const hasUnsavedHighlight = select.hasUnsavedHighlight(state);

    if (!hasUnsavedHighlight ||
        (hasUnsavedHighlight && !actionsToIntercept.has(action.type)) ||
        action.type === getType(clearFocusedHighlight)) {
        return next(action);
    }

    const didConfirm = await showConfirmation();
    if (didConfirm) {
        return dispatch(clearFocusedHighlight());
    }
};
