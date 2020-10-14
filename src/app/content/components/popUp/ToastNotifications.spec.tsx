import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { resetModules } from '../../../../test/utils';
import MessageProvider from '../../../MessageProvider';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { ToastNotification } from '../../../notifications/types';
import { Store } from '../../../types';
import ToastNotifications from './ToastNotifications';

describe('ToastNotifications', () => {
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
    const toasts = [{
      destination: 'highlights' as ToastNotification['destination'],
      messageKey: toastMessageKeys.higlights.failure.delete,
      shouldAutoDismiss: true,
      timestamp: 1,
    }, {
      destination: 'highlights' as ToastNotification['destination'],
      messageKey: toastMessageKeys.higlights.failure.update.annotation,
      shouldAutoDismiss: true,
      timestamp: 2,
    }];

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ToastNotifications toasts={toasts} />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
