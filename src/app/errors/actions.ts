import { createStandardAction } from 'typesafe-actions';

export const recordError = createStandardAction('Errors/record')<Error>();

export const recordSentryMessage = createStandardAction('Errors/sentryMessage')<string>();

export const clearCurrentError = createStandardAction('Errors/clearCurrent')<void>();
