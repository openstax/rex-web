import createCache from './createCache';

describe('create cache', () => {

  it('sets and gets things to cache', () => {
    const cache = createCache<string, {[key: string]: string}>();
    const thing = {asdf: 'qwer'};
    cache.set('somekey', thing);

    expect(cache.get('somekey')).toBe(thing);
  });

  it('removes things to cache when it reaches max size', () => {
    const cache = createCache<string, {[key: string]: string}>({maxRecords: 1});
    const thing1 = {asdf: 'qwer1'};
    cache.set('somekey1', thing1);

    expect(cache.get('somekey1')).toBe(thing1);

    const thing2 = {asdf: 'qwer2'};
    cache.set('somekey2', thing2);

    expect(cache.get('somekey2')).toBe(thing2);

    expect(cache.get('somekey1')).toBe(undefined);
  });

  it('doesn\'t removes things until it reaches max size', () => {
    const cache = createCache<string, {[key: string]: string}>({maxRecords: 2});

    const thing1 = {asdf: 'qwer1'};
    cache.set('somekey1', thing1);

    expect(cache.get('somekey1')).toBe(thing1);

    const thing2 = {asdf: 'qwer2'};
    cache.set('somekey2', thing2);

    expect(cache.get('somekey2')).toBe(thing2);
    expect(cache.get('somekey1')).toBe(thing1);

    const thing3 = {asdf: 'qwer3'};
    cache.set('somekey3', thing3);

    expect(cache.get('somekey3')).toBe(thing3);
    expect(cache.get('somekey2')).toBe(thing2);
    expect(cache.get('somekey1')).toBe(undefined);
  });
});
