import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveExperiments, receiveFeatureFlags } from '../featureFlags/actions';
import { AnyAction } from '../types';
import { experimentIds, experiments } from './constants';
import { State } from './types';

export const initialState: State = {};

const reducer: Reducer<State, AnyAction> = (state = initialState, action): any => {
    switch (action.type) {
        case getType(receiveExperiments):
            const [id, variant] = action.payload;
            if (variant && experimentIds[id]) {
                const experimentName = experimentIds[id];
                const variantIndex = parseInt(variant, 10);
                const variantName = experiments[experimentName][variantIndex];
                return {...state, [experimentName]: variantName};
            }
            return state;
        case getType(receiveFeatureFlags):
            return action.payload.reduce((result, flag) => ({...result, [flag]: true}), {...state});
        default:
            return state;
    }
};

export default reducer;
