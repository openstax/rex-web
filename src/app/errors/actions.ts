import { createStandardAction } from 'typesafe-actions';

export const showErrorDialog = createStandardAction('Errors/showDialog')<void>();
export const hideErrorDialog = createStandardAction('Errors/hideDialog')<void>();
export const recordError = createStandardAction('Errors/record')<Error>();
export const recordSentryMessage = createStandardAction('Errors/sentryMessage')<string>();
