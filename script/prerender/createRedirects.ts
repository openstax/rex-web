import fs from 'fs';
import path from 'path';
import { content } from '../../src/app/content/routes';
import { makeUnifiedBookLoader } from '../../src/app/content/utils';
import { findArchiveTreeNodeById } from '../../src/app/content/utils/archiveTreeUtils';
import { AppServices } from '../../src/app/types';
import { Redirects } from '../../src/redirects/types';
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

    redirects.push(
      ...bookRedirects.map(({ pageId, pathname }) => {
        const page = findArchiveTreeNodeById(tree, pageId);

        if (!page) {
          // tslint:disable-next-line: no-console
          console.log(`Couldn't find page ${pageId} in book ${bookId}`);
          return null;
        }

        return {
          from: pathname,
          to: content.getUrl({ book: { slug: bookSlug }, page: { slug: page.slug } }),
        };
      }).filter((data) => Boolean(data)) as Array<{ from: string, to: string }>
    );
  }

  writeAssetFile('/rex/redirects.json', JSON.stringify(redirects, undefined, 2));
};

export default createRedirects;
