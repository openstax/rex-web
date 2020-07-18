import { AppState } from '../types';
import * as selectors from './selectors';

const initialState = {
  hash: '',
  pathname: '',
  search: '',
  state: {},
};

describe('localState', () => {
  it('returns navigation state', () => {
    const rootState = {navigation: initialState} as AppState;
    expect(selectors.localState(rootState)).toEqual(initialState);
  });
});

describe('pathname', () => {
  it('returns pathname', () => {
    const rootState = {navigation: {
      ...initialState,
      pathname: 'foobar',
    }} as AppState;

    expect(selectors.pathname(rootState)).toEqual('foobar');
  });
});

describe('query', () => {
  it('returns query', () => {
    const rootState = {navigation: {
      ...initialState,
      pathname: 'foobar',
      query: { "foo": "bar" }
    }} as AppState;

    expect(selectors.query(rootState)).toEqual({"foo": "bar"});
  });
});
