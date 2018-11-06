import {createStandardAction} from 'typesafe-actions';
import {historyActions, Match, State} from './types';
  
export const callHistoryMethod = createStandardAction('Navigation/callHistoryMethod')<historyActions>();
export const locationChange = createStandardAction('Navigation/locationChange')<{location: State, match?: Match}>();
