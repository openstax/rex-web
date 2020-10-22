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
    const results = {
      hits: {
        hits: [],
        total: 0,
      },
      overallTook: 0,
      shards: {},
      timedOut: false,
      took: 0,
    };
    const state = {
      ...initialState,
      loading: true,
      results: null,
    };
    const newState = reducer(state, actions.receiveSearchResults(results));
    expect(newState.loading).toEqual(false);
    expect(newState.results).toEqual(results);
  });

  it('sets initial state', () => {
    const newState = reducer(undefined, {type: 'asdf'} as unknown as AnyAction);
    expect(newState).toEqual(initialState);
  });

  it('reduces clearSearch', () => {
    const state = {
      ...initialState,
      loading: true,
      query: 'asdfasdf',
    };
    const newState = reducer(state, actions.clearSearch());
    expect(newState).toBe(initialState);
    expect(newState.query).toEqual(null);
  });
});
