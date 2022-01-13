/*
 * util for dealing with array and object index signatures
 * don't include undefined
 *
 * ref: https://github.com/Microsoft/TypeScript/issues/13778
 */
export const assertDefined = <X>(x: X, message: string) => {
  if (x === undefined) {
    throw new Error(message);
  }

  return x as Exclude<X, undefined>;
};

export const assertNotNull = <X>(x: X, message: string) => {
  if (x === null) {
    throw new Error(message);
  }

  return x as Exclude<X, null>;
};

export const assertString = <X>(x: X, message: string): string => {
  if (typeof x !== 'string') {
    throw new Error(message);
  }

  return x;
};

// When the argument is "any", we don't want to cast it to object
// or we'll be unable to assign it to more specific types
// So we just exclude all primitive types instead
export const assertObject = <X>(x: X, message: string) => {
  // typeof null === 'object'
  if (x === null || typeof x !== 'object') {
    throw new Error(message);
  }

  return x as Exclude<X, number | string | boolean | bigint | symbol | null | undefined>;
};
