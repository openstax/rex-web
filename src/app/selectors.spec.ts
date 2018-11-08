import * as selectors from './selectors';

describe('localState', () => {
  it('returns identity', () => {
    const rootState = {} as RootState;
    expect(selectors.localState(rootState)).toEqual(rootState);
  });
});
