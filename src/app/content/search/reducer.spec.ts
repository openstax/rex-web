import { AnyAction } from '../../types';
import * as actions from './actions';
import reducer, { initialState } from './reducer';

describe('search reducer', () => {
  it('reduces requestSearch', () => {
    const query = 'asdf';
    const state = {
      ...initialState,
      loading: false,
      query: null,
    };
    const newState = reducer(state, actions.requestSearch(query));
    expect(newState.loading).toEqual(true);
    expect(newState.query).toEqual(query);
  });

  it('reduces receiveSearchResults', () => {
    const results = {};
    const state = {
      ...initialState,
      loading: true,
      results: null,
    };
    const newState = reducer(state, actions.receiveSearchResults({}));
    expect(newState.loading).toEqual(false);
    expect(newState.results).toEqual(results);
  });

  it('sets initial state', () => {
    const newState = reducer(undefined, {type: 'asdf'} as unknown as AnyAction);
    expect(newState).toEqual(initialState);
  });
});
