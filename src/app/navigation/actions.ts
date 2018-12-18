import { createStandardAction } from 'typesafe-actions';
import { AnyHistoryAction, AnyMatch, LocationChange } from './types';

export const callHistoryMethod = createStandardAction('Navigation/callHistoryMethod')<AnyHistoryAction>();
export const locationChange = createStandardAction('Navigation/locationChange')<LocationChange>();

export const push = (
  match: AnyMatch,
  options: {hash?: string, search?: string} = {}
) => callHistoryMethod({method: 'push', ...match, ...options});
