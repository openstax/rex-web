import fs from 'fs';
import path from 'path';
import { Redirects } from '../../data/redirects/types';
import { content } from '../../src/app/content/routes';
import { makeUnifiedBookLoader } from '../../src/app/content/utils';
import { findArchiveTreeNodeById } from '../../src/app/content/utils/archiveTreeUtils';
import { AppServices } from '../../src/app/types';
import { writeAssetFile } from './fileUtils';

const redirectsPath = path.resolve(__dirname, '../../src/redirects/');

const createRedirects = async(archiveLoader: AppServices['archiveLoader'], osWebLoader: AppServices['osWebLoader']) => {
  const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);

  const books = fs.readdirSync(redirectsPath).filter((name) => name.match('.json'));

  const redirects: Array<{ from: string, to: string }> = [];

  for (const bookName of books) {
    const bookRedirects: Redirects = require(redirectsPath + '/' + bookName);
    const bookId = bookName.replace('.json', '');
    const { tree, slug: bookSlug } = await bookLoader(bookId);

    for (const { pageId, pathname } of bookRedirects) {
      const page = findArchiveTreeNodeById(tree, pageId);

      if (!page) {
        // tslint:disable-next-line: no-console
        console.log(`Couldn't find page ${pageId} in book ${bookId}`);
        continue;
      }

      redirects.push({
        from: pathname,
        to: content.getUrl({ book: { slug: bookSlug }, page: { slug: page.slug } }),
      });
    }
  }

  writeAssetFile('/rex/redirects.json', JSON.stringify(redirects, undefined, 2));
};

export default createRedirects;
