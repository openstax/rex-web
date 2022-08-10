import { isKeyOf } from '../../guards';
import { locationChange } from '../../navigation/actions';
import * as selectNavigation from '../../navigation/selectors';
import { ActionHookBody } from '../../types';
import { actionHook } from '../../utils';
import { retiredBookRedirect } from '../actions';

const possibleNotifications = {
  retired: retiredBookRedirect,
};

export const addQueryNotificationsBody: ActionHookBody<typeof locationChange> = ({dispatch, getState}) => () => {
  if (typeof(document) === 'undefined') {
    return;
  }

  const state = getState();
  const query = selectNavigation.query(state);

  if (isKeyOf(possibleNotifications, query.message)) {
    dispatch(possibleNotifications[query.message]());
  }
};

export const addQueryNotifications = actionHook(locationChange, addQueryNotificationsBody);
