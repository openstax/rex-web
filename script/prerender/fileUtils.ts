// tslint:disable:no-console

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromContainerMetadata } from '@aws-sdk/credential-providers';
import flow from 'lodash/fp/flow';
import once from 'lodash/once';
import path from 'path';
import createCache, { Cache } from '../../src/helpers/createCache';
import { directoryExists, readFile, writeFile } from '../../src/helpers/fileUtils';
import { BUCKET_REGION, PUBLIC_URL, BUCKET_NAME } from './constants';

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

// Generates a release path for a file without a leading /, used when uploading the release to S3
function prefixReleasePath(filepath: string) {
  let basePath = PUBLIC_URL;
  if (basePath[0] === '/') { basePath = basePath.slice(1); }
  return `${basePath}${filepath}`;
}

const getS3Client = once(async() => {
  console.log('Fetching container credentials');

  const credentials = process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI
    ? await fromContainerMetadata()
    : undefined;

  console.log('Initializing S3 client');
  return new S3Client({ credentials, region: BUCKET_REGION });
});

async function writeS3File(key: string, contents: string, contentType: string) {
  const s3Client = await getS3Client();

  console.log(`Writing s3 file: /${key}`);
  return s3Client.send(new PutObjectCommand({
    Body: contents,
    Bucket: BUCKET_NAME,
    CacheControl: 'max-age=0',
    ContentType: contentType,
    Key: key,
  }));
}

async function writeS3ReleaseFile(filepath: string, contents: string, contentType: string) {
  return writeS3File(prefixReleasePath(filepath), contents, contentType);
}

export async function writeS3ReleaseHtmlFile(filepath: string, contents: string) {
  return writeS3ReleaseFile(filepath, contents, 'text/html');
}

export async function writeS3ReleaseXmlFile(filepath: string, contents: string) {
  return writeS3ReleaseFile(filepath, contents, 'text/xml');
}
