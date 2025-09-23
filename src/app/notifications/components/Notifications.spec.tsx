import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import TestContainer from '../../../test/TestContainer';
import { Store } from '../../types';
import { receiveMessages, retiredBookRedirect, updateAvailable } from '../actions';
import ConnectedNotifications from './Notifications';

describe('Notifications', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('matches snapshot for retiredBookRedirect', () => {
    store.dispatch(retiredBookRedirect());

    const component = renderer.create(<TestContainer store={store}>
      <ConnectedNotifications />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for updateAvailable', () => {
    store.dispatch(updateAvailable());

    const component = renderer.create(<TestContainer store={store}>
      <ConnectedNotifications />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for appMessage', () => {
    store.dispatch(receiveMessages([{
      dismissable: false,
      end_at: null,
      html: 'asdf',
      id: '1',
      start_at: null,
      url_regex: null,
    }]));

    const component = renderer.create(<TestContainer store={store}>
      <ConnectedNotifications />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for unknown notification', () => {
    store.getState().notifications.modalNotifications.push({type: 'foobar'} as any);

    const component = renderer.create(<TestContainer store={store}>
      <ConnectedNotifications />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
