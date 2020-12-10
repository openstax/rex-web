import flow from 'lodash/fp/flow';
import path from 'path';
import { directoryExists, readFile, writeFile } from '../../src/helpers/fileUtils';

const ASSET_DIR = path.resolve(__dirname, '../../build');

const prefixPath = (filePath: string) => path.join(ASSET_DIR, filePath);

export const assetDirectoryExists = flow(prefixPath, directoryExists);

export const writeAssetFile = (filepath: string, contents: string) => {
  if (filepath === `index.html`) {
    throw new Error(`can't write to index.html`);
  }
  writeFile(prefixPath(filepath), contents);
};

export const readAssetFile = flow(prefixPath, readFile);
