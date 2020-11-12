import { createSelector } from 'reselect';
import { pathname } from '../navigation/selectors';
import * as parentSelectors from '../selectors';
import { messagePriority } from './constants';
import { isAppMessage } from './guards';
import { ModalNotification } from './types';
import { groupToasts } from './utils';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.notifications
);

export const modalNotifications = createSelector(
  localState,
  (notifications) => notifications.modalNotifications
);

export const toastNotifications = createSelector(
  localState,
  (notifications) => notifications.toastNotifications
);

export const groupedToastNotifications = createSelector(
  toastNotifications,
  groupToasts
);

export const modalNotificationToDisplay = createSelector(
  modalNotifications,
  pathname,
  (messages, url): ModalNotification | undefined => messages
    .filter((message) => {
      if (isAppMessage(message) && message.payload.url_regex) {
        return url.match(message.payload.url_regex);
      }
      return true;
    })
    .sort((first, second) => {
      return messagePriority.indexOf(first.type) - messagePriority.indexOf(second.type);
    })[0]
);
