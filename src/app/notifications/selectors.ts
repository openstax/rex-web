import { createSelector } from 'reselect';
import { pathname } from '../navigation/selectors';
import * as parentSelectors from '../selectors';
import { isAppMessage } from './guards';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.notifications
);

export const notifications = createSelector(
  localState,
  pathname,
  (messages, url) => messages.filter((message) => {
    if (isAppMessage(message) && message.payload.url_regex) {
      return url.match(message.payload.url_regex);
    }

    return true;
  })
);
