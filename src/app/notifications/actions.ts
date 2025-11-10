import { createStandardAction } from 'typesafe-actions';
import { AnyNotification, Message, ToastMeta } from './types';

export const retiredBookRedirect = createStandardAction('Notification/retiredBookRedirect')();
export const updateAvailable = createStandardAction('Notification/updateAvailable')();

export const addToast = createStandardAction('Notification/toasts/add')
  .map((messageKey: string, meta: ToastMeta) => ({
    payload: {
      destination: meta.destination,
      errorId: meta.errorId,
      messageKey,
      shouldAutoDismiss: meta.shouldAutoDismiss === undefined || meta.shouldAutoDismiss,
      timestamp: Date.now(),
      variant: meta.variant,
    },
  }));

export const receiveMessages = createStandardAction('Notification/receiveMessages')<Message[]>();

export const dismissNotification = createStandardAction('Notification/dismiss')<AnyNotification>();
