import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { resetModules } from '../../../../test/utils';
import MessageProvider from '../../../MessageProvider';
import { addToast } from '../../../notifications/actions';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import Toast from '../../../notifications/components/ToastNotifications/Toast';
import { groupedToastNotifications } from '../../../notifications/selectors';
import { Store } from '../../../types';
import { openMobileToolbar } from '../../search/actions';
import ToastNotifications from './PageToasts';

describe('PageToasts', () => {
  let store: Store;

  beforeEach(() => {
    resetModules();

    store = createTestStore();
  });

  it('matches snapshot', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ToastNotifications />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshots with toasts', () => {
    store.dispatch(addToast(toastMessageKeys.higlights.failure.create, {destination: 'page'}));
    const toasts = groupedToastNotifications(store.getState()).page;

    if (!toasts) {
      return expect(toasts).toBeTruthy();
    }

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ToastNotifications />
      </MessageProvider>
    </Provider>);

    expect(component.root.findAllByType(Toast).length).toBe(1);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with toasts when mobile toolbar is open', () => {
    store.dispatch(addToast(toastMessageKeys.higlights.failure.create, {destination: 'page'}));
    store.dispatch(openMobileToolbar());

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ToastNotifications />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
