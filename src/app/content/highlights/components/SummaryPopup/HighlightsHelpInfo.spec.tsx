import * as Cookies from 'js-cookie';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../../test/createTestStore';
import { receiveUser } from '../../../../auth/actions';
import { User } from '../../../../auth/types';
import { PlainButton } from '../../../../components/Button';
import MessageProvider from '../../../../MessageProvider';
import { Store } from '../../../../types';
import HighlightsHelpInfo, { cookieId, timeBeforeShow } from './HighlightsHelpInfo';

jest.mock('js-cookie', () => ({
  ...jest.requireActual('js-cookie'),
  get: jest.fn(),
  set: jest.fn(),
}));

describe('HighlightsHelpInfo', () => {
  jest.useFakeTimers();
  let store: Store;
  let user: User;

  beforeEach(() => {
    store = createTestStore();
    user = {firstName: 'test', isNotGdprLocation: true, uuid: 'a_uuid'};
  });

  it('matches snapshot when hidden', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsHelpInfo/>
      </MessageProvider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('matches snapshot when showed', async() => {
    store.dispatch(receiveUser(user));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsHelpInfo/>
      </MessageProvider>
    </Provider>);

    await renderer.act(async() => {
      jest.runTimersToTime(timeBeforeShow);
    });

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('does not open if user is not logged in', async() => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsHelpInfo/>
      </MessageProvider>
    </Provider>);

    await renderer.act(async() => {
      jest.runTimersToTime(timeBeforeShow);
    });

    expect(() => component.root.findByProps({ 'data-testid': 'support-link' })).toThrow();
  });

  it('does not open if cookie is already set', async() => {
    store.dispatch(receiveUser(user));

    const spy = jest.spyOn(Cookies, 'get');
    spy.mockImplementationOnce(() => 'true' as any);

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsHelpInfo/>
      </MessageProvider>
    </Provider>);

    await renderer.act(async() => {
      jest.runTimersToTime(timeBeforeShow);
    });

    expect(() => component.root.findByProps({ 'data-testid': 'support-link' })).toThrow();
  });

  it('set cookie on dismiss', async() => {
    store.dispatch(receiveUser(user));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsHelpInfo/>
      </MessageProvider>
    </Provider>);

    await renderer.act(async() => {
      jest.runTimersToTime(timeBeforeShow);
    });

    await renderer.act(async() => {
      const dismissButton = component.root.findByType(PlainButton);
      dismissButton.props.onClick();
    });

    expect(Cookies.set).toHaveBeenCalledWith(cookieId, 'true');
  });
});
