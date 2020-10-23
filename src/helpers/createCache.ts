interface Options {
  maxRecords?: number;
}

const get = <K, V>(_options: Options, cache: Map<K, V>) => (key: K) => {
  return cache.get(key);
};

const set = <K, V>(options: Options, cache: Map<K, V>) => (key: K, value: V) => {
  if (options.maxRecords && cache.size >= options.maxRecords && cache.size >= 1) {
    cache.delete(cache.keys().next().value);
  }

  return cache.set(key, value);
};

export default <K, V>(options: Options = {}) => {
  const cache = new Map<K, V>();
  return {
    get: get(options, cache),
    set: set(options, cache),
  };
};
