import path from 'path';
import { AppServices } from '../../src/app/types';
import prepareRedirects from '../../src/helpers/prepareRedirects';
import { writeAssetFile } from './fileUtils';

const redirectsPath = path.resolve(__dirname, '../../data/redirects/');

export default async(archiveLoader: AppServices['archiveLoader'], osWebLoader: AppServices['osWebLoader']) => {
  const redirects = await prepareRedirects(archiveLoader, osWebLoader, redirectsPath);
  writeAssetFile('/rex/redirects.json', JSON.stringify(redirects, undefined, 2));
};
