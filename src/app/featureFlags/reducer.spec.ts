import * as actions from '../actions';
import reducer, { initialState } from './reducer';

describe('feature flags reducer', () => {
  it('stores correct search button variant in state', () => {
    const state = {
      ...initialState,
    };

    const newState = reducer(state, actions.receiveExperiments(['OCCkMMCZSwW87szzpniCow', '2']));

    expect(newState).toEqual({
        ...state,
        searchButton: 'grayButton',
    });
  });
});
