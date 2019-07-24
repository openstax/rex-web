import { createStandardAction } from 'typesafe-actions';

export const recordError = createStandardAction('Errors/record')<Error>();
