import isObject from 'lodash/fp/isObject';
import { Key, Token } from 'path-to-regexp';
import { AnyMatch, MatchesWithParams } from './types';

export const hasState = (payload: any & {state?: object}): payload is {state: object} =>
  payload.state !== undefined;

export const pathTokenIsKey = (token: Token): token is Key =>
  isObject(token);

export const isMatchWithParams = (payload: AnyMatch): payload is MatchesWithParams =>
  'params' in payload
;
