import * as selectors from './selectors';

const initialState = {
  hash: '',
  pathname: '',
  search: '',
  state: {},
};

describe('localState', () => {
  it('returns navigation state', () => {
    const rootState = {navigation: initialState} as RootState;
    expect(selectors.localState(rootState)).toEqual(initialState);
  });
});

describe('pathname', () => {
  it('returns pathname', () => {
    const rootState = {navigation: {
      ...initialState,
      pathname: 'foobar',
    }} as RootState;

    expect(selectors.pathname(rootState)).toEqual('foobar');
  });
});
