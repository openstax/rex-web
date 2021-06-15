import flow from 'lodash/fp/flow';
import path from 'path';
import createCache, { Cache } from '../../src/helpers/createCache';
import { directoryExists, readFile, writeFile } from '../../src/helpers/fileUtils';

const ASSET_DIR = path.resolve(__dirname, '../../build');
const CACHE_DIR = path.resolve(__dirname, '../../cache');

const prefixPath = (filePath: string) => path.join(ASSET_DIR, filePath);

export const assetDirectoryExists = flow(prefixPath, directoryExists);

export const writeAssetFile = (filepath: string, contents: string) => {
  if (filepath === `index.html`) {
    throw new Error(`can't write to index.html`);
  }
  writeFile(prefixPath(filepath), contents);
};

export const readAssetFile = flow(prefixPath, readFile);

export const createDiskCache = <K extends string, V>(prefix: string): Cache<K, V> => {
  const memoryCache = createCache<K, V>({maxRecords: 20});

  return {
    get: (key) => {
      const cached = memoryCache.get(key);

      if (cached) {
        return cached;
      }

      try {
        return JSON.parse(readFile(path.join(CACHE_DIR, prefix, key)));
      } catch (e) {
        return undefined;
      }
    },
    set: (key, value) => {
      memoryCache.set(key, value);
      writeFile(path.join(CACHE_DIR,  prefix, key), JSON.stringify(value));
    },
  };
};
