import { createStandardAction } from 'typesafe-actions';
import { AnyHistoryAction, LocationChange } from './types';

export const callHistoryMethod = createStandardAction('Navigation/callHistoryMethod')<AnyHistoryAction>();
export const locationChange = createStandardAction('Navigation/locationChange')<LocationChange>();
