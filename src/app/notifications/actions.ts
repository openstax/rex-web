import { createStandardAction } from 'typesafe-actions';

export const updateAvailable = createStandardAction('Notification/updateAvailable')();
export const acceptCookies = createStandardAction('Notification/acceptCookies')();
