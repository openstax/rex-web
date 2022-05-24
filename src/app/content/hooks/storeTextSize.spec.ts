import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { MiddlewareAPI, Store } from '../../types';
import { assertWindow } from '../../utils/browser-assertions';
import { setTextSize } from '../actions';
import storeTextSize from './storeTextSize';

describe('storeTextSize', () => {
  let hook: ReturnType<typeof import ('./storeTextSize').default>;
  let helpers: MiddlewareAPI & ReturnType<typeof createTestServices>;
  let store: Store;

  beforeEach(() => {
    jest.spyOn(assertWindow().localStorage.__proto__, 'setItem');
    assertWindow().localStorage.__proto__.setItem = jest.fn();

    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    hook = storeTextSize(helpers);
  });

  it('uses localstorage', async() => {
    await hook(store.dispatch(setTextSize(3)));
    expect(assertWindow().localStorage.setItem).toHaveBeenCalledWith('textSize', '3');
  });
});
