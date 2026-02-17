import { FirstArgumentType } from './types';

export const and = <A extends unknown[]>(...predicates: Array<(...args: A) => boolean>) => (...args: A) =>
  predicates.reduce((result, predicate) => result && predicate(...args), true);

export const or = <A extends unknown[]>(...predicates: Array<(...args: A) => boolean>) => (...args: A) =>
  predicates.reduce((result, predicate) => result || predicate(...args), false);

export const ifUndefined = <I, D>(item: I | undefined, defaultValue: D): I | D  =>
  item === undefined ? defaultValue : item;

/*
 * returns a function that inverts the result of the passed in function
 */
export const not = <A extends unknown[]>(wrapped: (...args: A) => unknown) => (...args: A) => !wrapped(...args);

/*
 * returns a function that evaluates its argument against the given predicate
 */
export const match = <T>(predicate: T) => (arg: T extends Function ? FirstArgumentType<T> : T) => {
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
