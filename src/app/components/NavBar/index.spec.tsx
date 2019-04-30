import React from 'react';
import createTestStore from '../../../test/createTestStore';
import renderer from 'react-test-renderer';
import MessageProvider from '../../MessageProvider';
import { Provider } from 'react-redux';
import {receiveUser, receiveLoggedOut} from '../../auth/actions';
import NavBar from '.';

describe('content', () => {
  let state: AppState;
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
    state = store.getState();
  });

  it('matches snapshot for null state', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <NavBar />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for logged in', () => {

    store.dispatch(receiveUser({firstName: 'test'}));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <NavBar />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for logged out', () => {

    store.dispatch(receiveLoggedOut());

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <NavBar />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
