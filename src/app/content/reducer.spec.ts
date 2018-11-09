import * as actions from './actions';
import reducer, { initialState } from './reducer';

describe('content reducer', () => {

  it('reduces openToc', () => {
    const state = {
      ...initialState,
      tocOpen: false,
    };
    const newState = reducer(state, actions.openToc());
    expect(newState.tocOpen).toEqual(true);
  });

  it('reduces closeToc', () => {
    const state = {
      ...initialState,
      tocOpen: true,
    };
    const newState = reducer(state, actions.closeToc());
    expect(newState.tocOpen).toEqual(false);
  });
});
