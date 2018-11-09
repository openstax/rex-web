import { Location } from 'history';
import { createStandardAction } from 'typesafe-actions';
import { AnyMatch, historyActions } from './types';

export const callHistoryMethod = createStandardAction('Navigation/callHistoryMethod')<historyActions>();
export const locationChange = createStandardAction('Navigation/locationChange')<{location: Location, match?: AnyMatch}>();
