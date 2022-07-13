import { AppServices } from '../../src/app/types';
import prepareRedirects from '../utils/prepareRedirects';
import { writeAssetFile } from './fileUtils';

export default async(archiveLoader: AppServices['archiveLoader'], osWebLoader: AppServices['osWebLoader']) => {
  const redirects = await prepareRedirects(archiveLoader, osWebLoader);
  // need to add some that have different book paths
  writeAssetFile('/rex/redirects.json', JSON.stringify(redirects, undefined, 2));
};
