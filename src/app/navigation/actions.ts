import queryString from 'query-string';
import { createStandardAction } from 'typesafe-actions';
import { AnyHistoryAction, AnyMatch, HistoryAction, LocationChange } from './types';

export const callHistoryMethod = createStandardAction('Navigation/callHistoryMethod')<AnyHistoryAction>();
export const locationChange = createStandardAction('Navigation/locationChange').map(
  (data: LocationChange) => ({
    payload: {
      ...data,
      query: queryString.parse(data.location.search),
    },
  }));

const makeCallHistoryMethodAction = (method: HistoryAction['method']) => (
  match: AnyMatch,
  options: {hash?: string, search?: string} = {}
) => callHistoryMethod({method, ...match, ...options});

export const push = makeCallHistoryMethodAction('push');
export const replace = makeCallHistoryMethodAction('replace');
