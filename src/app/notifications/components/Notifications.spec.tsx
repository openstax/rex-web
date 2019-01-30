import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { createStore } from 'redux';
import { AppState } from '../../types';
import { updateAvailable } from '../actions';
import { initialState } from '../reducer';
import ConnectedNotifications from './Notifications';

describe('Notifications', () => {
  let state: AppState;

  beforeEach(() => {
    state = cloneDeep({
      notifications: initialState,
    }) as any as AppState;
  });

  it('matches snapshot', () => {
    state.notifications.push(updateAvailable());
    const store = createStore((s: AppState | undefined) => s || state, state);

    const component = renderer.create(<Provider store={store}>
      <ConnectedNotifications />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
