import { createStandardAction } from 'typesafe-actions';
import { RecordableError } from './types';

export const recordError = createStandardAction('Errors/record')<RecordableError>();

export const clearCurrentError = createStandardAction('Errors/clearCurrent')<void>();
