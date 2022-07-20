import config from '../../src/config';
import BOOKS from '../../src/config.books';
import { writeAssetFile } from './fileUtils';

const {
  CODE_VERSION,
  REACT_APP_ARCHIVE_URL,
  RELEASE_ID,
} = config;

export default async function renderManifest() {
  writeAssetFile('/rex/release.json', JSON.stringify({
    archiveUrl: REACT_APP_ARCHIVE_URL,
    books: BOOKS,
    code: CODE_VERSION,
    id: RELEASE_ID,
  }, null, 2));

  writeAssetFile('/rex/config.json', JSON.stringify(config, null, 2));
}
