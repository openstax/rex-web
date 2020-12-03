import { FirstArgumentType } from './types';

export const ifUndefined = <I, D>(item: I | undefined, defaultValue: D): I | D  =>
  item === undefined ? defaultValue : item;

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

/*
 * reduces from the left until result matches the predicate and then stops,
 * more efficient than conditionally nooping in your reducer for all remaining
 * records
 */
export const reduceUntil = <R>(predicate: (result: R) => boolean) =>
  <T>(array: T[], reducer: (result: R, item: T) => R, result: R): R => {
    if (predicate(result) || array.length === 0) {
      return result;
    }

    const [item, ...remainder] = array;

    const reduceUntilPredicate = reduceUntil(predicate);
    return reduceUntilPredicate(remainder, reducer, reducer(result, item));
  };
