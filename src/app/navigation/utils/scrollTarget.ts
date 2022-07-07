import { OutputParams } from 'query-string';
import { isPlainObject } from '../../guards';
import { ScrollTarget } from '../types';

export const isScrollTarget = (
  object: { [key: string]: any }
): object is ScrollTarget => {
  if (
    !object.elementId
    || typeof object.elementId !== 'string'
    || typeof object.type !== 'string'
  ) { return false; }
  return true;
};

export const getScrollTargetFromQuery = (
  query: OutputParams,
  hash: string
): ScrollTarget | null => {
  if (!hash || !query.target || Array.isArray(query.target)) { return null; }
  let parsed: any;
  try {
    parsed = JSON.parse(decodeURIComponent(query.target));
  } catch {
    return null;
  }
  if (isPlainObject(parsed)) {
    (parsed as {[key: string]: any}).elementId = hash.replace('#', '');
    if (isScrollTarget(parsed)) { return parsed; }
  }
  return null;
};
