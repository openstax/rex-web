declare module 'weak-map' {
  interface WeakMap {
    /**
     * Removes `key` and its value from the cache.
     * @param key The key of the value to remove.
     * @return Returns `true` if the entry was removed successfully, else `false`.
     */
    delete(key: string): boolean;

    /**
     * Gets the cached value for `key`.
     * @param key The key of the value to get.
     * @return Returns the cached value.
     */
    get(key: string): any;

    /**
     * Checks if a cached value for `key` exists.
     * @param key The key of the entry to check.
     * @return Returns `true` if an entry for `key` exists, else `false`.
     */
    has(key: string): boolean;

    /**
     * Sets `value` to `key` of the cache.
     * @param key The key of the value to cache.
     * @param value The value to cache.
     * @return Returns the cache object.
     */
    set(key: string, value: any): Dictionary<any>;

    /**
     * Removes all key-value entries from the map.
     */
    clear(): void;
  }

  interface WeakMapConstructor {
    new (): WeakMap;
  }

  class WeakMap {
    constructor();
  }

  export = WeakMap;
}
