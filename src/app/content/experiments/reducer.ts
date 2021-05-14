import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../actions';
import { AnyAction } from '../../types';
import { experimentIds } from './constants';

export const initialState = {};

const reducer: Reducer<{}, AnyAction> = (state = initialState, action): any => {
    switch (action.type) {
        case getType(receiveFeatureFlags):
            const [id, variant] = action.payload;
            if (experimentIds[id]) {
                const experiment = experimentIds[id];
                const idx = parseInt(variant, 10);
                return {...state, [experiment]: idx};
            }
            return state;
        default:
            return state;
    }
};

export default reducer;
