import ReactType from 'react';
import { Provider } from 'react-redux';
import rendererType from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
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
  let renderer: typeof rendererType;
  let React: typeof ReactType; // tslint:disable-line:variable-name
  let dispatch: jest.SpyInstance;
  let store: Store;
  let notification: ReturnType<typeof searchFailure>;
  let addEventListener: jest.SpyInstance;
  let window: Window;
  let removeEventListener: jest.SpyInstance;

  beforeEach(() => {
    React = require('react');
    renderer = require('react-test-renderer');
    window = assertWindow();
    addEventListener = jest.spyOn(window, 'addEventListener');
    removeEventListener = jest.spyOn(window, 'removeEventListener');

    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');

    notification = searchFailure();
  });

  it('dismisses notification after set time', async() => {
    renderer.create(<Provider store={store}>
        <MessageProvider>
          <SearchFailure notification={notification} />
        </MessageProvider>
      </Provider>);

    expect(addEventListener).toHaveBeenCalledWith('scroll', expect.anything());
    expect(addEventListener).toHaveBeenCalledWith('click', expect.anything());

    await new Promise((resolve) => setTimeout(resolve, clearErrorAfter));

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(dismissNotification(notification));
    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.anything());
    expect(removeEventListener).toHaveBeenCalledWith('click', expect.anything());
  });

  it('dismisses notification on click', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <SearchFailure notification={notification} />
      </MessageProvider>
    </Provider>);

    component.root.findByType('button').props.onClick();

    expect(dispatch).toHaveBeenCalledWith(dismissNotification(notification));
    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.anything());
    expect(removeEventListener).toHaveBeenCalledWith('click', expect.anything());
  });

  it('dismisses notification after scrolling ', async() => {
    renderer.create(<Provider store={store}>
        <MessageProvider>
          <SearchFailure notification={notification} />
        </MessageProvider>
      </Provider>);

    const event = window.document.createEvent('MouseEvents');
    event.initEvent('scroll', true, true);
    window.dispatchEvent(event);

    await new Promise((resolve) => setTimeout(resolve, clearErrorAfter));

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(dismissNotification(notification));
    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.anything());
    expect(removeEventListener).toHaveBeenCalledWith('click', expect.anything());

  });
});
