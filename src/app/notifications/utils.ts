import { isFuture, isPast } from 'date-fns';
import * as actions from './actions';
import { isAppMessageDismissed } from './dismissAppMessages';
import { isQueuelessNotification } from './guards';
import { AnyNotification, Message, State } from './types';

export const shouldLoadAppMessage = (message: Message) => {
  if (message.start_at && isFuture(new Date(message.start_at))) {
    return false;
  }
  if (message.end_at && isPast(new Date(message.end_at))) {
    return false;
  }

  if (isAppMessageDismissed(message)) {
    return false;
  }

  return true;
};

const notificationExists = (notifications: AnyNotification[], notification: AnyNotification) =>
  notifications.find(({type}) => type === notification.type);

export const pushNotification = (
  state: State,
  notification: Exclude<AnyNotification, typeof actions.receiveMessages>
) => {
  return isQueuelessNotification(notification)
    ? notificationExists(state.queuelessNotifications, notification)
      ? state
      : {...state, queuelessNotifications: [...state.queuelessNotifications, notification]}
    : notificationExists(state.notificationQueue, notification)
      ? state
      : {...state, notificationQueue: [...state.notificationQueue, notification]};
};

export const filterClosedNotification = (state: State, notification: AnyNotification) => {
  if (isQueuelessNotification(notification)) {
    return {
      ...state,
      queuelessNotifications: state.queuelessNotifications.filter(({type}) => type !== notification.type),
    };
  }
  return {
    ...state,
    notificationQueue: state.notificationQueue.filter(({type}) => type !== notification.type),
  };
};
