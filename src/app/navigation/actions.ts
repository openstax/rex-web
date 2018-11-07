import { createAction, createStandardAction } from 'typesafe-actions';
import { historyActions, Match, State } from './types';

export const callHistoryMethod = createStandardAction('Navigation/callHistoryMethod')<historyActions>();
// export const locationChange = createStandardAction('Navigation/locationChange')<{location: State, match?: Match}>();

export const locationChange = createAction('Navigation/locationChange', (resolve) => {
  return (payload: {location: State, match?: Match}) => resolve(payload);
});
