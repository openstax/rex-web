import { createStandardAction } from 'typesafe-actions';
import { AnyNotification, Message, ToastNotification } from './types';

export const updateAvailable = createStandardAction('Notification/updateAvailable')();
export const acceptCookies = createStandardAction('Notification/acceptCookies')();
export const addToast = createStandardAction('Notification/toasts/add')
  .map((messageKey: string, {destination}: {destination: ToastNotification['destination']}) =>
    ({payload: {messageKey, destination, timestamp: Date.now()}}));

export const receiveMessages = createStandardAction('Notification/receiveMessages')<Message[]>();

export const dismissNotification = createStandardAction('Notification/dismiss')<AnyNotification>();
