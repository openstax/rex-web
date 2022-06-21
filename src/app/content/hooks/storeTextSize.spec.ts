import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { MiddlewareAPI, Store } from '../../types';
import { assertWindow } from '../../utils/browser-assertions';
import { setTextSize } from '../actions';
import { textResizerDefaultValue } from '../components/constants';
import storeTextSize, { loadStoredTextSize } from './storeTextSize';

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

  it('noops without window', async() => {
    const { window } = global;
    delete global.window;
    await hook(store.dispatch(setTextSize(3)));
    global.window = window;
    expect(assertWindow().localStorage.setItem).not.toHaveBeenCalled();
  });

  it('uses localstorage', async() => {
    await hook(store.dispatch(setTextSize(3)));
    expect(assertWindow().localStorage.setItem).toHaveBeenCalledWith('textSize', '3');
  });
});

describe('loadStoredTextSize', () => {
  let hook: ReturnType<typeof import ('./storeTextSize').loadStoredTextSize>;
  let helpers: MiddlewareAPI & ReturnType<typeof createTestServices>;
  let store: Store;
  let storeDispatch: jest.SpyInstance;

  beforeEach(() => {
    assertWindow().localStorage.__proto__.getItem = jest.fn().mockReturnValue(2);

    store = createTestStore();
    storeDispatch = jest.spyOn(store, 'dispatch');

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    hook = loadStoredTextSize(helpers);
  });

  it('loads the value from localStorage', async() => {
    await hook();
    expect(assertWindow().localStorage.getItem).toHaveBeenCalled();
    expect(storeDispatch).toHaveBeenCalledWith(setTextSize(2));
  });

  it('noops if textSize is already set', async() => {
    store.dispatch(setTextSize(3));
    await hook();
    expect(assertWindow().localStorage.getItem).not.toHaveBeenCalled();
  });

  it('uses the default if window is not available', async() => {
    const { window } = global;
    delete global.window;

    await hook();
    expect(storeDispatch).toHaveBeenCalledWith(setTextSize(textResizerDefaultValue));

    global.window = window;
  });
})
