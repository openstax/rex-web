import { book, page } from '../../../test/mocks/archiveLoader';
import { makeSearchResultHit } from '../../../test/searchResults';
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
    const previousState = {
      query: 'asdfasdf',
      results: null,
      selectedResult: null,
    };

    const state = {
      ...initialState,
      loading: true,
      previous: previousState,
      query: 'asdfasdf',
    };

    const newState = reducer(state, actions.clearSearch());
    expect(newState).toEqual({...initialState, previous: {...previousState}});
    expect(newState.query).toEqual(null);
    expect(newState.previous.query).toEqual(state.query);
  });

  it('reduces openSearchInSidebar', () => {
    const newState = reducer(initialState, actions.openSearchInSidebar());
    expect(newState.sidebarOpen).toBe(true);
  });

  it('reduces openSearchInSidebar without unnecessary state changes', () => {
    const results = {
      hits: {
        hits: [makeSearchResultHit({book, page})],
        total: 0,
      },
      overallTook: 0,
      shards: {},
      timedOut: false,
      took: 0,
    };

    const state = {
      ...initialState,
      previous: {
        query: null,
        results: null,
        selectedResult: null,
      },
      query: 'existing query',
      results,
      selectedResult: { result: results.hits.hits[0], highlight: 0 },
    };

    const newState = reducer(state, actions.openSearchInSidebar());
    expect(newState.sidebarOpen).toBe(true);
    expect(newState.query).toEqual(state.query);
    expect(newState.results).toEqual(state.results);
    expect(newState.selectedResult).toEqual(state.selectedResult);
  });
});
