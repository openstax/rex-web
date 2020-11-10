import { isObject } from 'lodash/fp';
import { Key, Token } from 'path-to-regexp';
import { AnyRoute, GenericMatch, MatchWithParams } from './types';

export const hasParams = (payload: any & {params?: object}): payload is {params: object} =>
  payload.params !== undefined;

export const hasState = (payload: any & {state?: object}): payload is {state: object} =>
  payload.state !== undefined;

export const pathTokenIsKey = (token: Token): token is Key =>
  isObject(token);

export const isMatchWithParams = (payload: GenericMatch): payload is MatchWithParams<Omit<AnyRoute, 'undefined'>> => {
  return 'params' in payload;
};
