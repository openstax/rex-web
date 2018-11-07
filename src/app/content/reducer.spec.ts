import { locationChange } from '../navigation/actions';
import * as actions from './actions';
import reducer, { initialState } from './reducer';
import { content } from './routes';

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

  it('reduces locationChange', () => {
    const state = {
      ...initialState,
      params: undefined,
    };
    const location = {
      hash: '',
      pathname: '',
      search: '',
      state: {},
    };
    const params = { bookId: 'book', pageId: 'page'  };
    const match = { params, route: content };
    const newState = reducer(state, locationChange({location, match}));

    expect(newState.params).toEqual(params);
  });
});
