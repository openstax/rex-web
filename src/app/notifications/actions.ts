import { createStandardAction } from 'typesafe-actions';
import { AnyNotification } from './types';

export const updateAvailable = createStandardAction('Notification/updateAvailable')();
export const acceptCookies = createStandardAction('Notification/acceptCookies')();
export const appMessage = createStandardAction('Notification/appMessage')<any>();

export const dismissNotification = createStandardAction('Notification/dismiss')<AnyNotification>();
