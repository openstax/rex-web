import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { reactAndFriends } from '../../../../test/utils';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { closeCallToActionPopup, openCallToActionPopup } from '../../actions';
import CallToActionPopup from './';
import { CTACloseButton } from './styles';

describe('CallToActionPopup', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let renderToDom: ReturnType<typeof reactAndFriends>['renderToDom'];

  beforeEach(() => {
    store = createTestStore();

    dispatch = jest.spyOn(store, 'dispatch');
    ({renderToDom} = reactAndFriends());
  });

  it('matches snapshot when close', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <CallToActionPopup/>
      </MessageProvider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('matches snapshot when open', () => {
    store.dispatch(openCallToActionPopup());

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <CallToActionPopup/>
      </MessageProvider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('closes on clicking close button', () => {
    store.dispatch(openCallToActionPopup());

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <CallToActionPopup/>
      </MessageProvider>
    </Provider>);

    renderer.act(() => {
      const closeButton = component.root.findByType(CTACloseButton);
      closeButton.props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(closeCallToActionPopup());
  });

  it('doesnt prevent default on clicking links', () => {
    store.dispatch(openCallToActionPopup());
    const window = assertWindow();
    const {root} = renderToDom(<Provider store={store}>
      <MessageProvider>
        <CallToActionPopup/>
      </MessageProvider>
    </Provider>);

    const loginButton = root.querySelector('[data-testid="log-in"]');
    const signupButton = root.querySelector('[data-testid="sign-up"]');

    expect(loginButton).toBeTruthy();
    expect(signupButton).toBeTruthy();

    const event = window.document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    const preventDefault = event.preventDefault = jest.fn();

    loginButton.dispatchEvent(event); // this checks for bindings using addEventListener
    ReactTestUtils.Simulate.click(loginButton, {preventDefault}); // this checks for react onClick prop
    signupButton.dispatchEvent(event);
    ReactTestUtils.Simulate.click(signupButton, {preventDefault});

    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
