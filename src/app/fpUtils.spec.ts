import { match, not } from './fpUtils';

describe('not', () => {
  it('inverts the passed functions return value', () => {
    const checker = not(() => true);
    expect(checker()).toBe(false);
  });
  it('forwards arguments', () => {
    const checker = not((str: string) => str === 'asdf');
    expect(checker('asdf')).toBe(false);
    expect(checker('qwer')).toBe(true);
  });
});

describe('match', () => {
  it('creates function that matches the passed literal', () => {
    const matcher = match('asdf');

    expect(matcher('asdf')).toBe(true);
    expect(matcher('qwer')).toBe(false);
    expect(matcher({} as any)).toBe(false);
  });

  it('creates function that evaluates the given function', () => {
    const matcher = match((str: string) => str === 'asdf');

    expect(matcher('asdf')).toBe(true);
    expect(matcher('qwer')).toBe(false);
    expect(matcher({} as any)).toBe(false);
  });
});
