import { isKeyOf } from '../../guards';
import * as selectNavigation from '../../navigation/selectors';
import { Initializer } from '../../types';
import { retiredBookRedirect } from '../actions';

const possibleNotifications = {
  retired: retiredBookRedirect,
};

export const addQueryNotifications: Initializer = async({dispatch, getState}) => {
  if (typeof(document) === 'undefined') {
    return;
  }

  const state = getState();
  const query = selectNavigation.query(state);

  if (isKeyOf(possibleNotifications, query.message)) {
    dispatch(possibleNotifications[query.message]());
  }
};
