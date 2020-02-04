import { getType } from 'typesafe-actions';
import { locationChange } from '../../../navigation/actions';
import { AnyAction, Dispatch } from '../../../types';
import { Middleware } from '../../../types'
import { toggleDiscardHighlightModal } from '../actions';
import {  } from '../actions';
import * as select from '../selectors';

const actionsToIntercept = new Set();
actionsToIntercept.add(getType(locationChange));

export default (): Middleware => ({dispatch, getState}) => {

    return (next: Dispatch) => (action: AnyAction) => {
        const state = getState();
        const hasUnsavedHighlight = select.hasUnsavedHighlight(state);

        if (!hasUnsavedHighlight || (hasUnsavedHighlight && !actionsToIntercept.has(action.type))) {
            return next(action);
        }

        if (action.type !== getType(toggleDiscardHighlightModal)) {
            dispatch(toggleDiscardHighlightModal(true));
        }
    };
};
