import { isObject } from 'lodash/fp';
import { Key, Token } from 'path-to-regexp';

export const hasState = (payload: any & {state?: object}): payload is {state: object} =>
  payload.state !== undefined;

export const pathTokenIsKey = (token: Token): token is Key =>
  isObject(token);

/*
export const isMatchWithParams = <P extends RouteParamsType | undefined, S extends RouteStateType | undefined>(
  match: Match<Route<P, S>>
): match is GenericMatchWithParams<Exclude<P, undefined>, S> =>
  'params' in match
;
*/
