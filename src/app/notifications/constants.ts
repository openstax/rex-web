import { getType } from 'typesafe-actions';
import { retiredBookRedirect, updateAvailable } from './actions';
import { appMessageType } from './reducer';

export const messagePriority = [
  getType(updateAvailable),
  appMessageType,
  getType(retiredBookRedirect),
];
