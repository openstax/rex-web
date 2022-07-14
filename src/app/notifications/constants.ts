import { getType } from 'typesafe-actions';
import { acceptCookies, retiredBookRedirect, updateAvailable } from './actions';
import { appMessageType } from './reducer';

export const messagePriority = [
  getType(updateAvailable),
  appMessageType,
  getType(acceptCookies),
  getType(retiredBookRedirect),
];
