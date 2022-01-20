// tslint:disable:no-console

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromContainerMetadata } from '@aws-sdk/credential-providers';
import flow from 'lodash/fp/flow';
import path from 'path';
import { assertDefined } from '../../src/app/utils';
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

let s3Client: S3Client | undefined;

// Generates a release path for a file without a leading /, used when uploading the release to S3
function prefixReleasePath(filepath: string) {
  let basePath = assertDefined(process.env.PUBLIC_URL, 'PUBLIC_URL environment variable not set');
  if (basePath[0] === '/') { basePath = basePath.slice(1); }
  return `${basePath}${filepath}`;
}

async function writeS3File(key: string, contents: string, contentType: string) {
  if (!s3Client) {
    // We explicitly pass credentials to the S3 Client only once
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

async function writeS3ReleaseFile(filepath: string, contents: string, contentType: string) {
  return writeS3File(prefixReleasePath(filepath), contents, contentType);
}

export async function writeS3ReleaseHtmlFile(filepath: string, contents: string) {
  return writeS3ReleaseFile(filepath, contents, 'text/html');
}

export async function writeS3ReleaseXmlFile(filepath: string, contents: string) {
  return writeS3ReleaseFile(filepath, contents, 'text/xml');
}
