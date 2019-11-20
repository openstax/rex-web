import { FirstArgumentType } from './types';

/*
 * returns a function that inverts the result of the passed in function
 */
export const not = <A extends any[]>(wrapped: (...args: A) => any) => (...args: A) => !wrapped(...args);

/*
 * returns a function that evaluates its argument against the given predicate
 */
// tslint:disable-next-line:ban-types
export const match = <T extends any>(predicate: T) => (arg: T extends Function ? FirstArgumentType<T> : T) => {
  if (typeof predicate === 'function') {
    return !!predicate(arg);
  }

  return predicate === arg;
};
