import { AppState } from '../types';
import { initialState } from './reducer';
import * as selectors from './selectors';

describe('localState', () => {
  it('returns errors state', () => {
    const rootState = {head: initialState} as any as AppState;
    expect(selectors.localState(rootState)).toEqual(initialState);
  });
});

describe('code', () => {
  it('returns code', () => {
    const rootState = {head: {
      ...initialState,
      meta: ['one', 'two'],
    }} as any as AppState;

    expect(selectors.meta(rootState)).toEqual(['one', 'two']);
  });
});
