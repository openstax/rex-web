interface Options {
  maxRecords?: number;
}

export interface Cache<K, V> {
  get: (key: K) => V | undefined;
  set: (key: K, value: V) => void;
}

const get = <K, V>(_options: Options, cache: Map<K, V>): Cache<K, V>['get'] => (key) => {
  return cache.get(key);
};

const set = <K, V>(options: Options, cache: Map<K, V>): Cache<K, V>['set'] => (key, value) => {
  if (options.maxRecords && cache.size >= options.maxRecords && cache.size >= 1) {
    cache.delete(cache.keys().next().value);
  }

  return cache.set(key, value);
};

export default <K, V>(options: Options = {}): Cache<K, V> => {
  const cache = new Map<K, V>();
  return {
    get: get(options, cache),
    set: set(options, cache),
  };
};
