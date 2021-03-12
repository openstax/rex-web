import fs from 'fs';
import path from 'path';
import { RedirectsData } from '../../data/redirects/types';
import { content } from '../app/content/routes';
import { makeUnifiedBookLoader } from '../app/content/utils';
import { findArchiveTreeNodeById } from '../app/content/utils/archiveTreeUtils';
import { AppServices } from '../app/types';
import config from '../config.books';

const redirectsPath = path.resolve(__dirname, '../../data/redirects/');

const prepareRedirects = async(
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader']
) => {
  const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);

  const books = fs.readdirSync(redirectsPath).filter((name) => name.match('.json'));

  const redirects: Array<{ from: string, to: string }> = [];

  for (const fileName of books) {
    const bookRedirects: RedirectsData = await import(`${redirectsPath}/${fileName}`);

    for (const { bookId, pageId, pathname } of bookRedirects) {
      const configForBook: { defaultVersion: string } | undefined = config[bookId];

      if (!configForBook) {
        // tslint:disable-next-line: no-console
        console.log(`Couldn't find version for book: ${bookId}`);
        continue;
      }

      const { tree, slug: bookSlug } = await bookLoader(bookId, configForBook.defaultVersion);
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

  return redirects;
};

export default prepareRedirects;
