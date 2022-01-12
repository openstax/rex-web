// tslint:disable:no-console

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromContainerMetadata } from '@aws-sdk/credential-providers';
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

export const writeHtmlAsset = (uri: string, html: string) => {
  if (assetDirectoryExists(uri)) {
    writeAssetFile(path.join(uri, 'index.html'), html);
  } else {
    writeAssetFile(uri, html);
  }
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

let s3Client: S3Client | undefined;

export async function writeS3File(filepath: string, contents: string, contentType = 'text/html') {
  let basePath = process.env.PUBLIC_URL;
  if (!basePath) { throw new Error('PUBLIC_URL environment variable not set'); }
  if (basePath[0] === '/') { basePath = basePath.slice(1); }
  const key = `${basePath}${filepath}`;

  if (!s3Client) {
    // We explicitly pass credentials to the S3 Client only once during initialization
    // so it'll not try to load them over and over

    console.log('Fetching container credentials');
    const credentials = await fromContainerMetadata();

    console.log('Initializing S3 client');
    s3Client = new S3Client({ credentials, region: process.env.BUCKET_REGION });
  }

  console.log(`Writing s3 file: /${key}`);
  return s3Client.send(new PutObjectCommand({
    Body: contents,
    Bucket: process.env.BUCKET_NAME,
    CacheControl: 'max-age=0',
    ContentType: contentType,
    Key: key,
  }));
}
