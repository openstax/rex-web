import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import ToastNotifications from '.';
import createTestStore from '../../../../test/createTestStore';
import { resetModules } from '../../../../test/utils';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { addToast, dismissNotification } from '../../actions';
import { toastNotifications } from '../../selectors';
import { BannerBodyWrapper, CloseButton } from './styles';
import Toast from './Toast';

jest.mock('react', () => {
  const react = (jest as any).requireActual('react');
  return { ...react, useEffect: react.useLayoutEffect };
});

describe('ToastNotifications', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    resetModules();

    store = createTestStore();

    dispatch = jest.spyOn(store, 'dispatch');

    jest.useFakeTimers();
  });

  it('matches snapshot for no notifications', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ToastNotifications />
      </MessageProvider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for few notifications', () => {
    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2);

    store.dispatch(addToast({messageKey: 'i18n:notification:toast:highlights:create-failure'}));
    store.dispatch(addToast({messageKey: 'i18n:notification:toast:highlights:delete-failure'}));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ToastNotifications />
      </MessageProvider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('allows dismissing individual notifications', () => {
    const firstNotificationMessage = 'i18n:notification:toast:highlights:create-failure';
    const secondNotificationMessage = 'i18n:notification:toast:highlights:delete-failure';

    store.dispatch(addToast({messageKey: firstNotificationMessage}));

    const {root} = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ToastNotifications />
      </MessageProvider>
    </Provider>);

    expect(root.findAllByType(BannerBodyWrapper)).toHaveLength(1);

    renderer.act(() => {
      store.dispatch(addToast({messageKey: secondNotificationMessage}));
    });

    expect(root.findAllByType(BannerBodyWrapper)).toHaveLength(2);

    const [firstNotification, secondNotification] = toastNotifications(store.getState());

    renderer.act(() => {
      const firstNotificationNode = root.findByProps({notification: firstNotification});
      firstNotificationNode.findByType(CloseButton).props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(dismissNotification(firstNotification));
    expect(root.findAllByType(BannerBodyWrapper)).toHaveLength(1);

    renderer.act(() => {
      const secondNotificationNode = root.findByProps({notification: secondNotification});
      secondNotificationNode.findByType(CloseButton).props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(dismissNotification(secondNotification));
    expect(root.findAllByType(BannerBodyWrapper)).toHaveLength(0);
  });

  it('sorts notification in descending order based on timestamp', () => {
    const firstNotificationMessage = 'i18n:notification:toast:highlights:create-failure';
    const secondNotificationMessage = 'i18n:notification:toast:highlights:delete-failure';

    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(3);

    const firstNotification = addToast({messageKey: firstNotificationMessage});
    const secondNotification = addToast({messageKey: secondNotificationMessage});

    store.dispatch(firstNotification);
    store.dispatch(secondNotification);

    const {root} = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ToastNotifications />
      </MessageProvider>
    </Provider>);

    let [firstToast, secondToast] = root.findAllByType(Toast);

    expect(firstToast.props.notification.messageKey).toBe(firstNotificationMessage);
    expect(firstToast.props.positionProps.index).toBe(1);

    expect(secondToast.props.notification.messageKey).toBe(secondNotificationMessage);
    expect(secondToast.props.positionProps.index).toBe(0);

    renderer.act(() => {
      store.dispatch(addToast({messageKey: firstNotificationMessage}));
    });

    [firstToast, secondToast] = root.findAllByType(Toast);

    expect(firstToast.props.notification.messageKey).toBe(firstNotificationMessage);
    expect(firstToast.props.positionProps.index).toBe(0);

    expect(secondToast.props.notification.messageKey).toBe(secondNotificationMessage);
    expect(secondToast.props.positionProps.index).toBe(1);
  });
});
