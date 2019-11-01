import createTestStore from '../../../test/createTestStore';
import { Store } from '../../types';
import { focusHighlight } from './actions';
import * as select from './selectors';

let store: Store;

beforeEach(() => {
  store = createTestStore();
});

describe('focused', () => {
  it('gets focused highlight id', () => {
    store.dispatch(focusHighlight('asdf'));
    expect(select.focused(store.getState())).toEqual('asdf');
  });
});
