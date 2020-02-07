import ReactType from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import { renderToDom } from '../../../test/reactutils';
import MessageProvider from '../../MessageProvider';
import { Store } from '../../types';
import { assertWindow } from '../../utils';
import { dismissNotification, searchFailure } from '../actions';
import SearchFailure, { clearErrorAfter } from './SearchFailure';

jest.mock('react', () => {
    const react = (jest as any).requireActual('react');
    return { ...react, useEffect: react.useLayoutEffect };
});

describe('SearchFailure', () => {
  let React: typeof ReactType; // tslint:disable-line:variable-name
  let dispatch: jest.SpyInstance;
  let store: Store;
  let notification: ReturnType<typeof searchFailure>;
  let addEventListener: jest.SpyInstance;
  let setTimeout: jest.SpyInstance;
  let clearTimeout: jest.SpyInstance;
  let window: Window;
  let removeEventListener: jest.SpyInstance;

  beforeEach(() => {
    React = require('react');
    window = assertWindow();
    addEventListener = jest.spyOn(window, 'addEventListener');
    removeEventListener = jest.spyOn(window, 'removeEventListener');
    setTimeout = jest.spyOn(window, 'setTimeout');
    clearTimeout = jest.spyOn(window, 'clearTimeout');
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');

    notification = searchFailure();
  });

  it('manages timeout', async() => {
    const component = renderer.create(<Provider store={store}>
        <MessageProvider>
          <SearchFailure notification={notification} />
        </MessageProvider>
      </Provider>);

    expect(addEventListener).toHaveBeenCalledWith('scroll', expect.anything());
    expect(addEventListener).toHaveBeenCalledWith('click', expect.anything());
    expect(setTimeout).toHaveBeenCalledWith(expect.anything(), clearErrorAfter);

    await new Promise(((resolve) => window.setTimeout(resolve, clearErrorAfter)));
    expect(clearTimeout).toHaveBeenCalled();

    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.anything());
    expect(removeEventListener).toHaveBeenCalledWith('click', expect.anything());
    component.unmount();
  });

  it('dismisses on animation end', () => {
    const {root} = renderToDom(<Provider store={store}>
      <MessageProvider>
        <SearchFailure notification={notification} />
      </MessageProvider>
    </Provider>);

    const wrapper = root.querySelector('[data-testid=banner-body]');

    if (!wrapper) {
      return expect(wrapper).toBeTruthy();
    }

    ReactTestUtils.Simulate.animationEnd(wrapper);

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(dismissNotification(notification));
  });

  it('dismisses notification on click', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <SearchFailure notification={notification} />
      </MessageProvider>
    </Provider>);

    component.root.findByType('button').props.onClick();

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(dismissNotification(notification));
    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.anything());
    expect(removeEventListener).toHaveBeenCalledWith('click', expect.anything());
    component.unmount();
  });
});
