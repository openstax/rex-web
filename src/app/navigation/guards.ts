import { isObject } from 'lodash/fp';
import { Key, Token } from 'path-to-regexp';

export const pathTokenIsKey = (token: Token): token is Key =>
  isObject(token);
