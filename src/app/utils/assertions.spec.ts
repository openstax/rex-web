import { assertNonNullableArray } from './assertions';

describe('assertNonNullableArray', () => {
  it('throw if array contains undefined element', () => {
    expect(() => assertNonNullableArray([undefined], 'asd')).toThrow();
  });

  it('throw if array contains null element', () => {
    expect(() => assertNonNullableArray([null], 'asd')).toThrow();
  });

  it('do not throw if array contains other falsy values', () => {
    expect(() => assertNonNullableArray([0, false, '', NaN], 'asd')).not.toThrow();
  });
});
