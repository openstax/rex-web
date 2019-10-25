import { createSelector } from 'reselect';
import { getType } from 'typesafe-actions';
import { pathname } from '../navigation/selectors';
import * as parentSelectors from '../selectors';
import { acceptCookies, updateAvailable } from './actions';
import { isAppMessage } from './guards';
import { appMessageType } from './reducer';
import { AnyNotification } from './types';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.notifications
);

export const notifications = localState;

const messagePriority = [
  getType(updateAvailable),
  appMessageType,
  getType(acceptCookies),
];

export const notificationForDisplay = createSelector(
  notifications,
  pathname,
  (messages, url): AnyNotification | undefined =>  messages
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
